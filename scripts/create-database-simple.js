import mongoose from 'mongoose'

async function createEthicalBankDatabase() {
  try {
    console.log('🏦 Creating EthicalBank database with collections...')
    
    const MONGODB_URI = 'mongodb://localhost:27017/ethical-bank'
    
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB successfully!')
    
    // Create sample data to ensure database persists
    console.log('📊 Creating collections with sample data...')
    
    // Create Users collection
    const User = mongoose.model('User', new mongoose.Schema({
      email: String,
      firstName: String,
      lastName: String,
      password: String,
      kycStatus: String,
      isActive: Boolean,
      preferences: Object,
      createdAt: Date,
      updatedAt: Date
    }))
    
    await User.create({
      email: 'jane.doe@ethicalbank.com',
      firstName: 'Jane',
      lastName: 'Doe',
      password: 'temp_placeholder',
      kycStatus: 'verified',
      isActive: true,
      preferences: {
        theme: 'system',
        language: 'en',
        notifications: {
          email: true,
          sms: false,
          push: true
        }
      },
      createdAt: new Date(),
      updatedAt: new Date()
    })
    console.log('✅ Users collection created')
    
    // Create Accounts collection
    const Account = mongoose.model('Account', new mongoose.Schema({
      userId: mongoose.Schema.Types.ObjectId,
      accountNumber: String,
      accountType: String,
      balance: Number,
      currency: String,
      status: String,
      metadata: Object,
      createdAt: Date,
      updatedAt: Date
    }))
    
    await Account.create({
      accountNumber: '3001234567890',
      accountType: 'checking',
      balance: 3247.89,
      currency: 'INR',
      status: 'active',
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date()
    })
    console.log('✅ Accounts collection created')
    
    // Create Transactions collection
    const Transaction = mongoose.model('Transaction', new mongoose.Schema({
      accountId: mongoose.Schema.Types.ObjectId,
      userId: mongoose.Schema.Types.ObjectId,
      type: String,
      amount: Number,
      currency: String,
      description: String,
      category: String,
      merchantName: String,
      status: String,
      aiAnalysis: Object,
      createdAt: Date,
      updatedAt: Date
    }))
    
    await Transaction.create({
      type: 'debit',
      amount: 87.43,
      currency: 'INR',
      description: 'Grocery Store Purchase',
      category: 'groceries',
      merchantName: 'Fresh Foods Market',
      status: 'completed',
      aiAnalysis: {
        fraudScore: 0.1,
        riskLevel: 'low',
        categoryConfidence: 0.95,
        anomalyScore: 0.05
      },
      createdAt: new Date(),
      updatedAt: new Date()
    })
    console.log('✅ Transactions collection created')
    
    // Create AI Decisions collection
    const AIDecision = mongoose.model('AIDecision', new mongoose.Schema({
      userId: mongoose.Schema.Types.ObjectId,
      entityType: String,
      decisionType: String,
      status: String,
      aiModel: Object,
      explanation: Object,
      createdAt: Date,
      updatedAt: Date
    }))
    
    await AIDecision.create({
      entityType: 'transaction',
      decisionType: 'approval',
      status: 'approved',
      aiModel: {
        name: 'FraudDetectionAI',
        version: '1.0.0',
        confidence: 0.95,
        biasCheck: true
      },
      explanation: {
        summary: 'Transaction approved - normal spending pattern',
        details: 'This transaction matches typical grocery spending behavior',
        factors: [
          {
            name: 'Merchant Category',
            value: 'grocery',
            weight: 0.3,
            impact: 'positive'
          }
        ]
      },
      createdAt: new Date(),
      updatedAt: new Date()
    })
    console.log('✅ AI Decisions collection created')
    
    // Create Consent Records collection
    const ConsentRecord = mongoose.model('ConsentRecord', new mongoose.Schema({
      userId: mongoose.Schema.Types.ObjectId,
      consentType: String,
      status: String,
      purpose: String,
      dataTypes: [String],
      metadata: Object,
      version: String,
      createdAt: Date,
      updatedAt: Date
    }))
    
    await ConsentRecord.create({
      consentType: 'fraud_detection',
      status: 'granted',
      purpose: 'Protect your account from fraudulent transactions',
      dataTypes: ['transaction_history', 'behavioral_data'],
      metadata: {
        source: 'web'
      },
      version: '1.0',
      createdAt: new Date(),
      updatedAt: new Date()
    })
    console.log('✅ Consent Records collection created')
    
    // Get counts
    const userCount = await User.countDocuments()
    const accountCount = await Account.countDocuments()
    const transactionCount = await Transaction.countDocuments()
    const aiDecisionCount = await AIDecision.countDocuments()
    const consentCount = await ConsentRecord.countDocuments()
    
    console.log('\n📊 Database Statistics:')
    console.log(`  - Users: ${userCount}`)
    console.log(`  - Accounts: ${accountCount}`)
    console.log(`  - Transactions: ${transactionCount}`)
    console.log(`  - AI Decisions: ${aiDecisionCount}`)
    console.log(`  - Consent Records: ${consentCount}`)
    
    await mongoose.disconnect()
    console.log('\n✅ EthicalBank database created successfully!')
    console.log('🔄 Refresh MongoDB Compass to see the new "ethical-bank" database')
    console.log('📂 You should now see 5 collections: users, accounts, transactions, aidecisions, consentrecords')
    
  } catch (error) {
    console.error('❌ Failed to create EthicalBank database:', error)
    process.exit(1)
  }
}

createEthicalBankDatabase()
