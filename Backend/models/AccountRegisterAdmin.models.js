import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const adminSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, "Name is required"],
    trim: true 
  },
  email: { 
    type: String, 
    required: [true, "Email is required"], 
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  password: { 
    type: String, 
    required: [true, "Password is required"],
    minlength: 8
  },
  profileImage: { type: String, default: "" }, 
  role: { type: String, default: "مدير نظام" },
  
  // --- Enhanced Security Fields ---
  twoFASecret: { type: String, select: false }, // Prevent secret from being sent in general queries
  twoFAEnabled: { type: Boolean, default: false },
  
  // Track failed logins (3rd strike = Lockout)
  loginAttempts: { 
    type: Number, 
    required: true, 
    default: 0 
  },
  
  // Timestamp for when the ban expires
  lockUntil: { 
    type: Date, 
    default: null 
  },
  
  createdAt: { type: Date, default: Date.now }
}, {
  // Automatically adds updatedAt and createdAt fields
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field to check if the account is currently locked
adminSchema.virtual('isCurrentlyLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Helper: check if locked (Method version)
adminSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Auto-hash password before saving
adminSchema.pre('save', async function(next) {
  // Only hash if the password is new or modified
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password for login
adminSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('Admin', adminSchema);