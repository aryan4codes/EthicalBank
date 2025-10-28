import mongoose from 'mongoose'

async function testConnection() {
  try {
    console.log('🔌 Testing MongoDB connection...')
    
    const MONGODB_URI = 'mongodb://localhost:27017/ethical-bank'
    
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB successfully!')
    
    // List all databases
    const admin = mongoose.connection.db.admin()
    const dbs = await admin.listDatabases()
    console.log('📊 Available databases:')
    dbs.databases.forEach(db => console.log(`  - ${db.name}`))
    
    // Create the ethical-bank database if it doesn't exist
    const dbName = 'ethical-bank'
    const ethicalBankDB = mongoose.connection.useDb(dbName)
    
    // Create a test collection to ensure database is created
    await ethicalBankDB.createCollection('test')
    console.log(`✅ Database '${dbName}' created/verified`)
    
    // Clean up test collection
    await ethicalBankDB.dropCollection('test')
    console.log('🧹 Cleaned up test collection')
    
    await mongoose.disconnect()
    console.log('✅ Test completed successfully!')
    
  } catch (error) {
    console.error('❌ MongoDB connection test failed:', error)
    process.exit(1)
  }
}

testConnection()
