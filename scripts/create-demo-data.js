const mongoose = require('mongoose');

async function createSampleData() {
  try {
    await mongoose.connect('mongodb://localhost:27017/ethical-bank');
    
    // User Schema
    const UserSchema = new mongoose.Schema({
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      phoneNumber: String,
      kycStatus: { type: String, default: 'verified' },
      isActive: { type: Boolean, default: true }
    });
    
    // Account Schema
    const AccountSchema = new mongoose.Schema({
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      accountNumber: { type: String, required: true, unique: true },
      accountType: { type: String, required: true },
      balance: { type: Number, required: true },
      status: { type: String, default: 'active' },
      createdAt: { type: Date, default: Date.now }
    });
    
    // Transaction Schema
    const TransactionSchema = new mongoose.Schema({
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
      type: { type: String, required: true },
      amount: { type: Number, required: true },
      description: { type: String, required: true },
      status: { type: String, default: 'completed' },
      createdAt: { type: Date, default: Date.now }
    });
    
    const User = mongoose.models.User || mongoose.model('User', UserSchema);
    const Account = mongoose.models.Account || mongoose.model('Account', AccountSchema);
    const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);
    
    // Find demo user
    const demoUser = await User.findOne({ email: 'demo@ethicalbank.com' });
    if (!demoUser) {
      console.log('❌ Demo user not found');
      await mongoose.disconnect();
      return;
    }
    
    console.log('✅ Found demo user:', demoUser._id);
    
    // Check if accounts already exist
    const existingAccounts = await Account.find({ userId: demoUser._id });
    if (existingAccounts.length > 0) {
      console.log('✅ Demo user already has accounts');
      await mongoose.disconnect();
      return;
    }
    
    // Create sample accounts
    const accounts = await Account.insertMany([
      {
        userId: demoUser._id,
        accountNumber: 'ACC-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        accountType: 'checking',
        balance: 2500.00
      },
      {
        userId: demoUser._id,
        accountNumber: 'ACC-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        accountType: 'savings',
        balance: 15000.00
      }
    ]);
    
    console.log('✅ Created accounts:', accounts.length);
    
    // Create sample transactions
    const transactions = [];
    const now = new Date();
    
    for (let i = 0; i < 10; i++) {
      const account = accounts[Math.floor(Math.random() * accounts.length)];
      const types = ['credit', 'debit'];
      const type = types[Math.floor(Math.random() * types.length)];
      const amount = Math.floor(Math.random() * 500) + 10;
      const descriptions = [
        'Online Purchase',
        'ATM Withdrawal',
        'Direct Deposit',
        'Transfer',
        'Mobile Payment',
        'Grocery Store',
        'Gas Station',
        'Restaurant'
      ];
      
      transactions.push({
        userId: demoUser._id,
        accountId: account._id,
        type,
        amount: type === 'debit' ? -amount : amount,
        description: descriptions[Math.floor(Math.random() * descriptions.length)],
        status: 'completed',
        createdAt: new Date(now.getTime() - (i * 24 * 60 * 60 * 1000))
      });
    }
    
    await Transaction.insertMany(transactions);
    console.log('✅ Created transactions:', transactions.length);
    
    console.log('🎉 Sample data created successfully!');
    console.log('You can now login with:');
    console.log('📧 Email: demo@ethicalbank.com');
    console.log('🔑 Password: demo123');
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Failed to create sample data:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

createSampleData();
