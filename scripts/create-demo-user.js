const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function createDemoUser() {
  try {
    console.log('🧪 Creating demo user for login testing...');
    
    await mongoose.connect('mongodb://localhost:27017/ethical-bank');
    
    const UserSchema = new mongoose.Schema({
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      phoneNumber: String,
      kycStatus: { type: String, default: 'verified' },
      isActive: { type: Boolean, default: true },
      preferences: {
        theme: { type: String, default: 'system' },
        language: { type: String, default: 'en' },
        notifications: {
          email: { type: Boolean, default: true },
          sms: { type: Boolean, default: false },
          push: { type: Boolean, default: true }
        }
      },
      lastLoginAt: Date,
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    });
    
    const User = mongoose.models.User || mongoose.model('User', UserSchema);
    
    // Check if demo user already exists
    const existingUser = await User.findOne({ email: 'demo@ethicalbank.com' });
    if (existingUser) {
      console.log('✅ Demo user already exists');
      console.log('📧 Email: demo@ethicalbank.com');
      console.log('🔑 Password: demo123');
      await mongoose.disconnect();
      return;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash('demo123', 12);
    
    // Create demo user
    const demoUser = await User.create({
      email: 'demo@ethicalbank.com',
      password: hashedPassword,
      firstName: 'Demo',
      lastName: 'User',
      phoneNumber: '+1-555-0123',
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
      }
    });
    
    console.log('✅ Demo user created successfully!');
    console.log('📧 Email: demo@ethicalbank.com');
    console.log('🔑 Password: demo123');
    console.log('👤 User ID:', demoUser._id);
    
    await mongoose.disconnect();
    
  } catch (error) {
    console.error('❌ Failed to create demo user:', error);
    process.exit(1);
  }
}

createDemoUser();
