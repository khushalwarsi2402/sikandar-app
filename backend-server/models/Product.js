const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  category:    { type: String, required: true },
  description: { type: String, default: '' },
  image:       { type: String, default: '' },
  weights: [{
    label: String,
    grams: Number,
    price: Number,
  }],
  stock:       { type: Number, default: 50 },
  features:    [String],
  isActive:    { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
