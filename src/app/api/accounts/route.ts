import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth/middleware'
import { connectDB, Account } from '@/lib/db'
import { APIResponse } from '@/types'

/**
 * Get user accounts
 * GET /api/accounts
 */
export const GET = withAuth(async (request: NextRequest, { user }) => {
  try {
    await connectDB()

    // Get user's accounts (only active ones)
    const accounts = await Account.find({ 
      userId: user._id || user.id,
      status: { $ne: 'closed' }
    }).sort({ createdAt: -1 })

    return NextResponse.json({
      success: true,
      data: {
        accounts,
        totalAccounts: accounts.length,
        totalBalance: accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0)
      }
    } as APIResponse, { status: 200 })

  } catch (error) {
    console.error('Get accounts error:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      user: user ? { id: user._id || user.id, email: user.email } : null
    })
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Failed to retrieve accounts'
      }
    } as APIResponse, { status: 500 })
  }
})

/**
 * Create new account
 * POST /api/accounts
 */
export const POST = withAuth(async (request: NextRequest, { user }) => {
  try {
    await connectDB()

    const body = await request.json()
    const { accountType, currency = 'USD', name } = body

    // Validate required fields
    if (!accountType || !name) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Account type and name are required'
        }
      } as APIResponse, { status: 400 })
    }

    // Check account limits (example: max 5 accounts per user)
    const existingAccounts = await Account.countDocuments({ userId: user._id })
    if (existingAccounts >= 5) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'LIMIT_EXCEEDED',
          message: 'Maximum number of accounts reached (5)'
        }
      } as APIResponse, { status: 400 })
    }

    // Generate unique account number
    const generateAccountNumber = async (): Promise<string> => {
      let accountNumber: string
      let isUnique = false
      
      while (!isUnique) {
        // Generate 12-digit account number
        accountNumber = Math.floor(100000000000 + Math.random() * 900000000000).toString()
        
        // Check if it's unique
        const existing = await Account.findOne({ accountNumber })
        if (!existing) {
          isUnique = true
        }
      }
      
      return accountNumber!
    }

    const accountNumber = await generateAccountNumber()

    // Create new account
    const account = new Account({
      userId: user._id,
      accountNumber,
      accountType,
      currency,
      name: name.trim(),
      balance: 0,
      status: 'active'
    })

    await account.save()

    return NextResponse.json({
      success: true,
      data: { account },
      message: 'Account created successfully'
    } as APIResponse, { status: 201 })

  } catch (error) {
    console.error('Create account error:', error)
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create account'
      }
    } as APIResponse, { status: 500 })
  }
})
