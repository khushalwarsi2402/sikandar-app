require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const products = [
  {
    name: 'Dry Mutton',
    category: 'dry',
    description: 'Tender boneless mutton pieces, slow cooked with aromatic spices until perfectly dry and rich in flavour.',
    image: '',
    weights: [
      { label: '250g', grams: 250, price: 220 },
      { label: '500g', grams: 500, price: 420 },
      { label: '1 Kg',  grams: 1000, price: 750 },
    ],
    stock: 50,
    features: ['Per Kg', '100% Fresh', 'Mixed'],
    isActive: true,
  },
  {
    name: 'Wet Mutton',
    category: 'wet',
    description: 'Juicy fresh-cut mutton with bone, perfect for rich curries, nihari, and slow-cooked gravies.',
    image: '',
    weights: [
      { label: '250g', grams: 250, price: 200 },
      { label: '500g', grams: 500, price: 380 },
      { label: '1 Kg',  grams: 1000, price: 700 },
    ],
    stock: 50,
    features: ['Per Kg', '100% Fresh', 'Mixed'],
    isActive: true,
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    await Product.deleteMany({});
    console.log('🗑️  Cleared existing products');

    await Product.insertMany(products);
    console.log('✅ Seeded 2 products');

    mongoose.disconnect();
    console.log('Done!');
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
}

seed();
