import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth/middleware'
import { connectDB, ConsentRecord } from '@/lib/db'
import { APIResponse } from '@/types'

/**
 * Get specific consent record details
 * GET /api/consent-records/[consentId]
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ consentId: string }> }
) {
  return withAuth(async (req: NextRequest, { user }) => {
    try {
      await connectDB()
      
      const { consentId } = await context.params

      // Find consent record and verify ownership
      const consent = await ConsentRecord.findOne({
        _id: consentId,
        userId: user._id
      })

      if (!consent) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Consent record not found'
          }
        } as APIResponse, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        data: { consent }
      } as APIResponse, { status: 200 })

    } catch (error) {
      console.error('Get consent record error:', error)
      
      return NextResponse.json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve consent record'
        }
      } as APIResponse, { status: 500 })
    }
})(request)
}

/**
 * Update consent record (mainly for revoking)
 * PUT /api/consent-records/[consentId]
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ consentId: string }> }
) {
  return withAuth(async (req: NextRequest, { user }) => {
    try {
      await connectDB()
      
      const { consentId } = await context.params

      // Find consent record and verify ownership
      const consent = await ConsentRecord.findOne({
        _id: consentId,
        userId: user._id
      })

      if (!consent) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Consent record not found'
          }
        } as APIResponse, { status: 404 })
      }

      const body = await request.json()
      const { action, reason, ipAddress, userAgent } = body

      if (action === 'revoke') {
        if (consent.status === 'revoked') {
          return NextResponse.json({
            success: false,
            error: {
              code: 'ALREADY_REVOKED',
              message: 'Consent has already been revoked'
            }
          } as APIResponse, { status: 400 })
        }

        // Revoke the consent
        consent.status = 'revoked'
        consent.revokedAt = new Date()
        consent.revocationReason = reason?.trim() || 'User requested revocation'
        consent.revocationMethodology = {
          method: 'digital_form',
          ipAddress: ipAddress || 'unknown',
          userAgent: userAgent || 'unknown',
          timestamp: new Date()
        }

        await consent.save()

        return NextResponse.json({
          success: true,
          data: { consent },
          message: 'Consent revoked successfully'
        } as APIResponse, { status: 200 })

      } else if (action === 'withdraw') {
        if (consent.status === 'withdrawn') {
          return NextResponse.json({
            success: false,
            error: {
              code: 'ALREADY_WITHDRAWN',
              message: 'Consent has already been withdrawn'
            }
          } as APIResponse, { status: 400 })
        }

        // Withdraw the consent (user-initiated removal)
        consent.status = 'withdrawn'
        consent.withdrawnAt = new Date()
        consent.withdrawalReason = reason?.trim() || 'User requested withdrawal'

        await consent.save()

        return NextResponse.json({
          success: true,
          data: { consent },
          message: 'Consent withdrawn successfully'
        } as APIResponse, { status: 200 })

      } else {
        return NextResponse.json({
          success: false,
          error: {
            code: 'INVALID_ACTION',
            message: 'Invalid action. Supported actions: revoke, withdraw'
          }
        } as APIResponse, { status: 400 })
      }

    } catch (error) {
      console.error('Update consent record error:', error)
      
      return NextResponse.json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update consent record'
        }
      } as APIResponse, { status: 500 })
    }
})(request)
}

/**
 * Delete consent record (hard delete - use with caution)
 * DELETE /api/consent-records/[consentId]
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ consentId: string }> }
) {
  return withAuth(async (req: NextRequest, { user }) => {
    try {
      await connectDB()
      
      const { consentId } = await context.params

      // Find consent record and verify ownership
      const consent = await ConsentRecord.findOne({
        _id: consentId,
        userId: user._id
      })

      if (!consent) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Consent record not found'
          }
        } as APIResponse, { status: 404 })
      }

      // Only allow deletion of revoked or withdrawn consents for compliance
      if (consent.status === 'active') {
        return NextResponse.json({
          success: false,
          error: {
            code: 'CANNOT_DELETE_ACTIVE',
            message: 'Cannot delete active consent. Please revoke or withdraw first.'
          }
        } as APIResponse, { status: 400 })
      }

      // Hard delete the consent record
      await ConsentRecord.findByIdAndDelete(consentId)

      return NextResponse.json({
        success: true,
        message: 'Consent record deleted successfully'
      } as APIResponse, { status: 200 })

    } catch (error) {
      console.error('Delete consent record error:', error)
      
      return NextResponse.json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete consent record'
        }
      } as APIResponse, { status: 500 })
    }
})(request)
}
