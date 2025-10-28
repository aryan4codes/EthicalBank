import mongoose from 'mongoose'

async function createEthicalBankDatabase() {
  try {
    console.log('🏦 Creating EthicalBank database with collections...')
    
    const MONGODB_URI = 'mongodb://localhost:27017/ethical-bank'
    
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB successfully!')
    
    // Use the ethical-bank database
    const ethicalBankDB = mongoose.connection.useDb('ethical-bank')
    
    // Create collections with sample documents to make them persistent
    console.log('📊 Creating collections...')
    
    // Create Users collection
    const usersCollection = ethicalBankDB.collection('users')
    await usersCollection.insertOne({
      _id: new mongoose.Types.ObjectId(),
      email: 'jane.doe@ethicalbank.com',
      firstName: 'Jane',
      lastName: 'Doe',
      password: 'temp_placeholder', // This will be properly hashed later
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
    const accountsCollection = ethicalBankDB.collection('accounts')
    await accountsCollection.insertOne({
      _id: new mongoose.Types.ObjectId(),
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
    const transactionsCollection = ethicalBankDB.collection('transactions')
    await transactionsCollection.insertOne({
      _id: new mongoose.Types.ObjectId(),
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
    const aiDecisionsCollection = ethicalBankDB.collection('aidecisions')
    await aiDecisionsCollection.insertOne({
      _id: new mongoose.Types.ObjectId(),
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
          },
          {
            name: 'Amount Range',
            value: 87.43,
            weight: 0.2,
            impact: 'neutral'
          }
        ]
      },
      createdAt: new Date(),
      updatedAt: new Date()
    })
    console.log('✅ AI Decisions collection created')
    
    // Create Consent Records collection
    const consentRecordsCollection = ethicalBankDB.collection('consentrecords')
    await consentRecordsCollection.insertOne({
      _id: new mongoose.Types.ObjectId(),
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
    
    // List all collections in the database
    const collections = await ethicalBankDB.listCollections().toArray()
    console.log('\n📋 Created collections:')
    collections.forEach(collection => {
      console.log(`  - ${collection.name}`)
    })
    
    // Get database stats
    const stats = await ethicalBankDB.stats()
    console.log('\n📊 Database Statistics:')
    console.log(`  - Database: ${stats.db}`)
    console.log(`  - Collections: ${stats.collections}`)
    console.log(`  - Data Size: ${(stats.dataSize / 1024).toFixed(2)} KB`)
    
    await mongoose.disconnect()
    console.log('\n✅ EthicalBank database created successfully!')
    console.log('🔄 Refresh MongoDB Compass to see the new database')
    
  } catch (error) {
    console.error('❌ Failed to create EthicalBank database:', error)
    process.exit(1)
  }
}

createEthicalBankDatabase()
