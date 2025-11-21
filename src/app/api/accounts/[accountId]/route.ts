import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth/middleware'
import { connectDB, Account } from '@/lib/db'
import { APIResponse } from '@/types'

/**
 * Get specific account details
 * GET /api/accounts/[accountId]
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ accountId: string }> }
) {
  return withAuth(async (req: NextRequest, { user }) => {
    try {
      await connectDB()
      
      const { accountId } = await context.params

      // Find account and verify ownership (exclude closed accounts)
      const account = await Account.findOne({
        _id: accountId,
        userId: user._id,
        status: { $ne: 'closed' }
      })

      if (!account) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Account not found'
          }
        } as APIResponse, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        data: { account }
      } as APIResponse, { status: 200 })

    } catch (error) {
      console.error('Get account error:', error)
      
      return NextResponse.json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve account'
        }
      } as APIResponse, { status: 500 })
    }
})(request)
}

/**
 * Update account details
 * PUT /api/accounts/[accountId]
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ accountId: string }> }
) {
  return withAuth(async (req: NextRequest, { user }) => {
    try {
      await connectDB()
      
      const { accountId } = await context.params

      // Find account and verify ownership
      const account = await Account.findOne({
        _id: accountId,
        userId: user._id
      })

      if (!account) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Account not found'
          }
        } as APIResponse, { status: 404 })
      }

      const body = await request.json()
      const { name, status } = body

      // Update allowed fields only
      if (name !== undefined) account.name = name.trim()
      if (status !== undefined && ['active', 'inactive', 'frozen'].includes(status)) {
        account.status = status
      }
      
      await account.save()

      return NextResponse.json({
        success: true,
        data: { account },
        message: 'Account updated successfully'
      } as APIResponse, { status: 200 })

    } catch (error) {
      console.error('Update account error:', error)
      
      return NextResponse.json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update account'
        }
      } as APIResponse, { status: 500 })
    }
})(request)
}

/**
 * Close/Delete account
 * DELETE /api/accounts/[accountId]
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ accountId: string }> }
) {
  return withAuth(async (req: NextRequest, { user }) => {
    try {
      await connectDB()
      
      const { accountId } = await context.params

      // Find account and verify ownership
      const account = await Account.findOne({
        _id: accountId,
        userId: user._id
      })

      if (!account) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Account not found'
          }
        } as APIResponse, { status: 404 })
      }

      // Check if account has balance
      if (account.balance > 0) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Cannot close account with positive balance'
          }
        } as APIResponse, { status: 400 })
      }

      // Soft delete (mark as closed) rather than hard delete
      account.status = 'closed'
      account.closedAt = new Date()
      await account.save()

      return NextResponse.json({
        success: true,
        message: 'Account closed successfully'
      } as APIResponse, { status: 200 })

    } catch (error) {
      console.error('Delete account error:', error)
      
      return NextResponse.json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to close account'
        }
      } as APIResponse, { status: 500 })
    }
})(request)
}
