import { NextRequest, NextResponse } from "next/server"
import { auth, currentUser } from '@clerk/nextjs/server'
import { connectDB, User } from "@/lib/db"

/**
 * Authentication middleware for API routes using Clerk
 */
export function withAuth(
  handler: (request: NextRequest, context: { user: any }) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // Get Clerk auth state
      const { userId } = await auth()
      
      if (!userId) {
        return NextResponse.json({
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "No authentication token provided"
          }
        }, { status: 401 })
      }

      // Get Clerk user
      const clerkUser = await currentUser()
      
      if (!clerkUser) {
        return NextResponse.json({
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "User not found"
          }
        }, { status: 401 })
      }

      // Connect to database and find or create user
      await connectDB()
      let user = await User.findOne({ clerkId: userId }).select("-password")
      
      // If user doesn't exist in DB, create it from Clerk data
      if (!user) {
        try {
          const email = clerkUser.emailAddresses[0]?.emailAddress
          const firstName = clerkUser.firstName || clerkUser.emailAddresses[0]?.emailAddress?.split('@')[0] || 'User'
          const lastName = clerkUser.lastName || ''
          
          if (!email) {
            throw new Error('Email is required from Clerk user')
          }
          
          user = await User.create({
            clerkId: userId,
            email: email.toLowerCase(),
            firstName: firstName.trim() || 'User',
            lastName: lastName.trim() || '',
            kycStatus: 'pending',
            isActive: true,
            preferences: {
              theme: 'system',
              language: 'en',
              notifications: {
                email: true,
                sms: false,
                push: true
              }
            }
          })
        } catch (createError: any) {
          console.error('Error creating user from Clerk data:', createError)
          
          // If user creation fails due to duplicate email, try to find and update
          if (createError?.code === 11000 || createError?.message?.includes('duplicate')) {
            user = await User.findOne({ 
              email: clerkUser.emailAddresses[0]?.emailAddress?.toLowerCase() || '' 
            }).select("-password")
            
            if (user) {
              // Update existing user with clerkId if not already set
              if (!user.clerkId) {
                user.clerkId = userId
                await user.save()
              }
            }
          }
          
          // If still no user, throw the error
          if (!user) {
            throw createError
          }
        }
      }
      
      if (!user || !user.isActive) {
        return NextResponse.json({
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Invalid user or account inactive"
          }
        }, { status: 401 })
      }

      // Call the actual handler with user context
      // Let handler errors propagate (don't catch them here)
      return await handler(request, { user })

    } catch (error) {
      console.error('Auth middleware error:', error)
      
      // Check if error is already a NextResponse (from handler)
      if (error instanceof NextResponse) {
        return error
      }
      
      // Only return auth errors for authentication issues
      // If it's a different error, let it propagate or return 500
      if (error instanceof Error && error.message.includes('auth')) {
        return NextResponse.json({
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: error.message || "Authentication failed"
          }
        }, { status: 401 })
      }
      
      // For other errors, return 500
      return NextResponse.json({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: error instanceof Error ? error.message : "An error occurred"
        }
      }, { status: 500 })
    }
  }
}

/**
 * Optional authentication middleware (user might or might not be logged in)
 */
export function withOptionalAuth(
  handler: (request: NextRequest, context: { user?: any }) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const { userId } = await auth()
      let user = null

      if (userId) {
        try {
          const clerkUser = await currentUser()
          if (clerkUser) {
            await connectDB()
            user = await User.findOne({ clerkId: userId }).select("-password")
            
            // Create user if doesn't exist
            if (!user && clerkUser) {
              user = await User.create({
                clerkId: userId,
                email: clerkUser.emailAddresses[0]?.emailAddress || '',
                firstName: clerkUser.firstName || '',
                lastName: clerkUser.lastName || '',
                kycStatus: 'pending',
                isActive: true,
                preferences: {
                  theme: 'system',
                  language: 'en',
                  notifications: {
                    email: true,
                    sms: false,
                    push: true
                  }
                }
              })
            }
          }
        } catch (error) {
          // Ignore authentication errors for optional auth
          console.warn("Optional auth failed:", error)
        }
      }

      return await handler(request, { user })

    } catch (error) {
      // For optional auth, continue without user if authentication fails
      return await handler(request, { user: null })
    }
  }
}

/**
 * Admin-only authentication middleware
 */
export function withAdminAuth(
  handler: (request: NextRequest, context: { user: any }) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const { userId } = await auth()
      if (!userId) {
        return NextResponse.json({
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "No authentication token provided"
          }
        }, { status: 401 })
      }

      const clerkUser = await currentUser()
      if (!clerkUser) {
        return NextResponse.json({
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "User not found"
          }
        }, { status: 401 })
      }

      await connectDB()
      let user = await User.findOne({ clerkId: userId }).select("-password")
      
      // Create user if doesn't exist
      if (!user) {
        user = await User.create({
          clerkId: userId,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          firstName: clerkUser.firstName || '',
          lastName: clerkUser.lastName || '',
          kycStatus: 'pending',
          isActive: true,
          preferences: {
            theme: 'system',
            language: 'en',
            notifications: {
              email: true,
              sms: false,
              push: true
            }
          }
        })
      }
      
      if (!user || !user.isActive) {
        return NextResponse.json({
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Invalid user or account inactive"
          }
        }, { status: 401 })
      }

      // Check if user has admin privileges
      const isAdmin = clerkUser.publicMetadata?.role === 'admin' || 
                     clerkUser.emailAddresses[0]?.emailAddress === "admin@ethicalbank.com" ||
                     user.email === "admin@ethicalbank.com" ||
                     user.role === "admin"

      if (!isAdmin) {
        return NextResponse.json({
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Admin access required"
          }
        }, { status: 403 })
      }

      return await handler(request, { user })

    } catch (error) {
      return NextResponse.json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: error instanceof Error ? error.message : "Authentication failed"
        }
      }, { status: 401 })
    }
  }
}
