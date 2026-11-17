const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'INR', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'SGD', 'AED'],
    },
    monthlyIncomeTarget: {
      type: Number,
      default: 0,
      min: [0, 'Monthly income target cannot be negative'],
    },
    avatar: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
      maxlength: [200, 'Bio cannot exceed 200 characters'],
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate signed JWT token
userSchema.methods.generateAuthToken = function () {
  const secret = process.env.JWT_SECRET || 'smarttrack_super_secret_jwt_key_2026';
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      name: this.name,
      role: this.role,
    },
    secret,
    {
      expiresIn: process.env.JWT_EXPIRE || '30d',
    }
  );
};

module.exports = mongoose.model('User', userSchema);
