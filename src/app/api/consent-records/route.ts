import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth/middleware'
import { connectDB, ConsentRecord } from '@/lib/db'
import { APIResponse } from '@/types'

/**
 * Get user consent records
 * GET /api/consent-records
 */
export const GET = withAuth(async (request: NextRequest, { user }) => {
  try {
    await connectDB()

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const consentType = searchParams.get('type')
    const status = searchParams.get('status')
    const includeRevoked = searchParams.get('includeRevoked') === 'true'

    // Build query
    const query: any = { userId: user._id }
    
    if (consentType) {
      query.consentType = consentType
    }

    if (status) {
      query.status = status
    } else if (!includeRevoked) {
      // By default, exclude revoked consents
      query.status = { $ne: 'revoked' }
    }

    // Execute query with pagination
    const skip = (page - 1) * limit
    const [consents, totalCount] = await Promise.all([
      ConsentRecord.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ConsentRecord.countDocuments(query)
    ])

    // Get current active consents summary
    const activeConsentsByType = await ConsentRecord.aggregate([
      {
        $match: {
          userId: user._id,
          status: 'granted'
        }
      },
      {
        $group: {
          _id: '$consentType',
          count: { $sum: 1 },
          latestConsent: { $max: '$createdAt' }
        }
      }
    ])

    return NextResponse.json({
      success: true,
      data: {
        consents,
        activeConsentsSummary: activeConsentsByType,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasNext: page * limit < totalCount,
          hasPrev: page > 1
        }
      }
    } as APIResponse, { status: 200 })

  } catch (error) {
    console.error('Get consent records error:', error)
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve consent records'
      }
    } as APIResponse, { status: 500 })
  }
})

/**
 * Create new consent record
 * POST /api/consent-records
 */
export const POST = withAuth(async (request: NextRequest, { user }) => {
  try {
    await connectDB()

    const body = await request.json()
    const { 
      consentType,
      purpose,
      dataTypes,
      thirdParties = [],
      retentionPeriod,
      version,
      ipAddress,
      userAgent,
      source = 'web',
      expiresAt
    } = body

    // Validate required fields
    if (!consentType || !purpose || !dataTypes || !Array.isArray(dataTypes) || dataTypes.length === 0 || !version) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Consent type, purpose, data types, and version are required'
        }
      } as APIResponse, { status: 400 })
    }

    // Check if there's an existing active consent of the same type
    const existingConsent = await ConsentRecord.findOne({
      userId: user._id,
      consentType,
      status: 'granted'
    })

    if (existingConsent) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'CONSENT_EXISTS',
          message: 'Active consent of this type already exists'
        }
      } as APIResponse, { status: 409 })
    }

    // Calculate expiration date if retentionPeriod is provided
    let calculatedExpiresAt = null
    if (retentionPeriod) {
      calculatedExpiresAt = new Date()
      calculatedExpiresAt.setDate(calculatedExpiresAt.getDate() + retentionPeriod)
    } else if (expiresAt) {
      calculatedExpiresAt = new Date(expiresAt)
    }

    // Create consent record
    const consentRecord = new ConsentRecord({
      userId: user._id,
      consentType,
      status: 'granted', // Use correct enum value
      purpose: purpose.trim(),
      dataTypes,
      expiresAt: calculatedExpiresAt,
      version: version.trim(),
      metadata: {
        ipAddress: ipAddress || 'unknown',
        userAgent: userAgent || 'unknown',
        source: source
      }
    })

    await consentRecord.save()

    return NextResponse.json({
      success: true,
      data: { consentRecord },
      message: 'Consent recorded successfully'
    } as APIResponse, { status: 201 })

  } catch (error) {
    console.error('Create consent record error:', error)
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create consent record'
      }
    } as APIResponse, { status: 500 })
  }
})
