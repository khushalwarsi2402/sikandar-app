const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderId:  { type: String, required: true, unique: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name:      String,
    weightLabel: String,
    unitPrice: Number,
    qty:       Number,
  }],
  subtotal:      { type: Number, required: true },
  delivery:      { type: Number, default: 50 },
  total:         { type: Number, required: true },
  customer: {
    name:    String,
    phone:   String,
    address: String,
  },
  paymentMethod:    { type: String, enum: ['card', 'upi', 'paypal', 'cod'], default: 'card' },
  razorpayOrderId:  { type: String },
  razorpayPaymentId:{ type: String },
  status:           { type: String, enum: ['confirmed', 'preparing', 'delivering', 'delivered', 'cancelled'], default: 'confirmed' },
  trackingSteps: [{
    status:    String,
    timestamp: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
