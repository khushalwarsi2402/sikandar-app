const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone:    { type: String, default: '' },
  password: { type: String, required: true, minlength: 6 },
  dob:      { type: String, default: '' },
  avatar:   { type: String, default: '👤' },
  addresses: [{
    label:   { type: String, required: true },
    address: { type: String, required: true },
  }],
  savedPayments: [{
    type:   { type: String, enum: ['card', 'upi', 'paypal'], required: true },
    name:   { type: String },
    detail: { type: String },
  }],
  preferences: {
    notifications: { type: Boolean, default: true },
    emails:        { type: Boolean, default: false },
    darkMode:      { type: Boolean, default: true },
    language:      { type: String, default: 'en' },
  },
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
