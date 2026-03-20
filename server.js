const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); // 1. Added Mongoose

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 2. YOUR REAL DATABASE CONNECTION
const MONGODB_URI = "mongodb+srv://khushalwarsi475:Mongodb098@cluster0.w7fb35r.mongodb.net/sikandar_meats?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas (Mumbai)'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// 3. DEFINE THE DATA MODEL
const itemSchema = new mongoose.Schema({
  name: String,
  price: Number
});
const Item = mongoose.model('Item', itemSchema);

// 4. UPDATED ROUTES
// GET items from the real database
app.get('/api/inventory', async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// POST a new item to the real database
app.post('/api/inventory', async (req, res) => {
  try {
    const newItem = new Item({
      name: req.body.name,
      price: req.body.price
    });
    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: "Failed to save item" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend API is live and connected to MongoDB!`);
});