// MongoDB Database Setup Script
import connectDB from '@/lib/db/connection'
import { DatabaseUtils } from '@/lib/db'

async function setupDatabase() {
  try {
    console.log('🚀 Starting database setup...')
    
    // Initialize database connection
    await DatabaseUtils.initialize()
    
    // Seed development data
    await DatabaseUtils.seedDevelopmentData()
    
    // Get statistics
    const stats = await DatabaseUtils.getStatistics()
    
    console.log('✅ Database setup completed successfully!')
    console.log('📊 Database Statistics:', stats)
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Database setup failed:', error)
    process.exit(1)
  }
}

// Run the setup if this file is executed directly
if (require.main === module) {
  setupDatabase()
}

export default setupDatabase
