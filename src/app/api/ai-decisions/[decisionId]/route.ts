import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth/middleware'
import { connectDB, AIDecision } from '@/lib/db'
import { APIResponse } from '@/types'

/**
 * Get specific AI decision details
 * GET /api/ai-decisions/[decisionId]
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ decisionId: string }> }
) {
  return withAuth(async (req: NextRequest, { user }) => {
    try {
      await connectDB()
      
      const { decisionId } = await context.params

      // Find AI decision and verify ownership
      const decision = await AIDecision.findOne({
        _id: decisionId,
        userId: user._id
      }).populate('transactionId', 'amount type description category reference')

      if (!decision) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'AI decision not found'
          }
        } as APIResponse, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        data: { decision }
      } as APIResponse, { status: 200 })

    } catch (error) {
      console.error('Get AI decision error:', error)
      
      return NextResponse.json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve AI decision'
        }
      } as APIResponse, { status: 500 })
    }
})(request)
}

/**
 * Update AI decision feedback
 * PUT /api/ai-decisions/[decisionId]
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ decisionId: string }> }
) {
  return withAuth(async (req: NextRequest, { user }) => {
    try {
      await connectDB()
      
      const { decisionId } = await context.params

      // Find AI decision and verify ownership
      const decision = await AIDecision.findOne({
        _id: decisionId,
        userId: user._id
      })

      if (!decision) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'AI decision not found'
          }
        } as APIResponse, { status: 404 })
      }

      const body = await request.json()
      const { userFeedback, correctOutcome, feedbackNote } = body

      // Update feedback fields
      if (userFeedback !== undefined) {
        decision.userFeedback = userFeedback
      }
      
      if (correctOutcome !== undefined) {
        decision.correctOutcome = correctOutcome
      }
      
      if (feedbackNote !== undefined) {
        decision.feedbackNote = feedbackNote.trim()
      }

      decision.feedbackAt = new Date()
      await decision.save()

      return NextResponse.json({
        success: true,
        data: { decision },
        message: 'AI decision feedback updated successfully'
      } as APIResponse, { status: 200 })

    } catch (error) {
      console.error('Update AI decision error:', error)
      
      return NextResponse.json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update AI decision'
        }
      } as APIResponse, { status: 500 })
    }
})(request)
}
