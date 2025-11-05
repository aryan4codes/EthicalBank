import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth/middleware'
import { AuthUtils } from '@/lib/auth/utils'
import { APIResponse } from '@/types'

export const GET = withAuth(async (request: NextRequest, { user }) => {
  try {
    return NextResponse.json({
      success: true,
      data: {
        user: AuthUtils.sanitizeUser(user)
      }
    } as APIResponse, { status: 200 })

  } catch (error) {
    console.error('Get profile error:', error)
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get user profile'
      }
    } as APIResponse, { status: 500 })
  }
})
