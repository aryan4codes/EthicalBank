import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth/middleware'
import { connectDB, Account, Transaction } from '@/lib/db'
import { APIResponse } from '@/types'

/**
 * Get user transactions
 * GET /api/transactions
 */
export const GET = withAuth(async (request: NextRequest, { user }) => {
  try {
    await connectDB()

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get('accountId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const type = searchParams.get('type') // 'credit', 'debit', 'transfer'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build query
    const query: any = {}
    
    if (accountId) {
      // Verify user owns this account
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
      query.accountId = accountId
    } else {
      // Get transactions for all user's accounts
      const userAccounts = await Account.find({
        userId: user._id,
        status: { $ne: 'closed' }
      }).select('_id')
      query.accountId = { $in: userAccounts.map(acc => acc._id) }
    }

    if (type) {
      query.type = type
    }

    if (startDate || endDate) {
      query.createdAt = {}
      if (startDate) query.createdAt.$gte = new Date(startDate)
      if (endDate) query.createdAt.$lte = new Date(endDate)
    }

    // Execute query with pagination
    const skip = (page - 1) * limit
    const [transactions, totalCount] = await Promise.all([
      Transaction.find(query)
        .populate('accountId', 'name accountNumber accountType')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Transaction.countDocuments(query)
    ])

    return NextResponse.json({
      success: true,
      data: {
        transactions,
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
    console.error('Get transactions error:', error)
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve transactions'
      }
    } as APIResponse, { status: 500 })
  }
})

/**
 * Create new transaction
 * POST /api/transactions
 */
export const POST = withAuth(async (request: NextRequest, { user }) => {
  try {
    await connectDB()

    const body = await request.json()
    const { 
      accountId, 
      type, 
      amount, 
      description, 
      category = 'other',
      toAccountId // For transfers
    } = body

    // Validate required fields
    if (!accountId || !type || !amount || amount <= 0) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Account ID, type, and positive amount are required'
        }
      } as APIResponse, { status: 400 })
    }

    // Verify user owns the account
    const account = await Account.findOne({
      _id: accountId,
      userId: user._id,
      status: 'active'
    })

    if (!account) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Account not found or not active'
        }
      } as APIResponse, { status: 404 })
    }

    // Generate transaction reference
    const generateTransactionRef = (): string => {
      const timestamp = Date.now().toString(36)
      const random = Math.random().toString(36).substring(2, 8)
      return `TXN${timestamp}${random}`.toUpperCase()
    }

    const transactionReference = generateTransactionRef()

    // Handle different transaction types
    if (type === 'transfer' && toAccountId) {
      // Transfer between accounts
      const toAccount = await Account.findOne({
        _id: toAccountId,
        status: 'active'
      })

      if (!toAccount) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Destination account not found or not active'
          }
        } as APIResponse, { status: 404 })
      }

      // Check if user has sufficient balance
      if (account.balance < amount) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'INSUFFICIENT_FUNDS',
            message: 'Insufficient account balance'
          }
        } as APIResponse, { status: 400 })
      }

      // Create debit transaction (from account)
      const debitTransaction = new Transaction({
        accountId: account._id,
        userId: user._id,
        type: 'debit',
        amount,
        description: description || `Transfer to ${toAccount.name || toAccount.accountNumber}`,
        category: 'transfers',
        reference: transactionReference,
        balanceAfter: account.balance - amount,
        metadata: {
          transferType: 'outgoing',
          toAccountId: toAccount._id,
          toAccountNumber: toAccount.accountNumber
        }
      })

      // Create credit transaction (to account) 
      const creditTransaction = new Transaction({
        accountId: toAccount._id,
        userId: toAccount.userId,
        type: 'credit',
        amount,
        description: description || `Transfer from ${account.name || account.accountNumber}`,
        category: 'transfers',
        reference: transactionReference,
        balanceAfter: toAccount.balance + amount,
        metadata: {
          transferType: 'incoming',
          fromAccountId: account._id,
          fromAccountNumber: account.accountNumber
        }
      })

      // Update account balances
      account.balance -= amount
      toAccount.balance += amount

      // Save everything in a transaction-like manner
      await Promise.all([
        debitTransaction.save(),
        creditTransaction.save(),
        account.save(),
        toAccount.save()
      ])

      return NextResponse.json({
        success: true,
        data: { 
          debitTransaction,
          creditTransaction,
          fromAccountBalance: account.balance,
          toAccountBalance: toAccount.balance
        },
        message: 'Transfer completed successfully'
      } as APIResponse, { status: 201 })

    } else {
      // Regular credit/debit transaction
      let newBalance: number

      if (type === 'debit') {
        if (account.balance < amount) {
          return NextResponse.json({
            success: false,
            error: {
              code: 'INSUFFICIENT_FUNDS',
              message: 'Insufficient account balance'
            }
          } as APIResponse, { status: 400 })
        }
        newBalance = account.balance - amount
      } else if (type === 'credit') {
        newBalance = account.balance + amount
      } else {
        return NextResponse.json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid transaction type'
          }
        } as APIResponse, { status: 400 })
      }

      // Create transaction
      const transaction = new Transaction({
        accountId: account._id,
        userId: user._id,
        type,
        amount,
        description: description || `${type.charAt(0).toUpperCase() + type.slice(1)} transaction`,
        category,
        reference: transactionReference,
        balanceAfter: newBalance
      })

      // Update account balance
      account.balance = newBalance

      // Save both
      await Promise.all([
        transaction.save(),
        account.save()
      ])

      return NextResponse.json({
        success: true,
        data: { 
          transaction,
          newAccountBalance: account.balance
        },
        message: 'Transaction completed successfully'
      } as APIResponse, { status: 201 })
    }

  } catch (error) {
    console.error('Create transaction error:', error)
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create transaction'
      }
    } as APIResponse, { status: 500 })
  }
})
