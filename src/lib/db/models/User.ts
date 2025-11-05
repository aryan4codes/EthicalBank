/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { Schema } from 'mongoose'
import bcrypt from 'bcryptjs'
import { IUser } from '@/types'

const AddressSchema = new Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, required: true, default: 'India' }
}, { _id: false })

const NotificationPreferencesSchema = new Schema({
  email: { type: Boolean, default: true },
  sms: { type: Boolean, default: false },
  push: { type: Boolean, default: true }
}, { _id: false })

const PreferencesSchema = new Schema({
  theme: { 
    type: String, 
    enum: ['light', 'dark', 'system'], 
    default: 'system' 
  },
  language: { type: String, default: 'en' },
  notifications: { 
    type: NotificationPreferencesSchema, 
    default: () => ({}) 
  }
}, { _id: false })

const UserSchema = new Schema<IUser>({
  clerkId: {
    type: String,
    unique: true,
    sparse: true, // Allows null values but ensures uniqueness when present
    index: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: function(this: any) {
      // Password not required if using Clerk (has clerkId)
      return !this.clerkId;
    },
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false // Don't include password in queries by default
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  phoneNumber: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number']
  },
  dateOfBirth: {
    type: Date,
    validate: {
      validator: function(value: Date) {
        const today = new Date()
        const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
        return value <= eighteenYearsAgo
      },
      message: 'User must be at least 18 years old'
    }
  },
  address: AddressSchema,
  preferences: {
    type: PreferencesSchema,
    default: () => ({})
  },
  kycStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLoginAt: Date
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      const { password, ...userWithoutPassword } = ret
      return userWithoutPassword
    }
  }
})

// Indexes for performance (removed duplicate email index)
UserSchema.index({ kycStatus: 1 })
UserSchema.index({ isActive: 1 })
UserSchema.index({ createdAt: -1 })

// Pre-save middleware to hash password
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next()
  
  try {
    const salt = await bcrypt.genSalt(12)
    const hashedPassword = await bcrypt.hash(this.password as string, salt)
    this.password = hashedPassword
    next()
  } catch (error: any) {
    next(error)
  }
})

// Instance method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password)
  } catch (error) {
    return false
  }
}

// Static method to find by credentials
UserSchema.statics.findByCredentials = async function(email: string, password: string) {
  const user = await this.findOne({ email, isActive: true }).select('+password')
  if (!user) {
    throw new Error('Invalid credentials')
  }

  const isMatch = await user.comparePassword(password)
  if (!isMatch) {
    throw new Error('Invalid credentials')
  }

  return user
}

// Virtual for full name
UserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`
})

// Ensure virtual fields are serialized
UserSchema.set('toJSON', { virtuals: true })

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
