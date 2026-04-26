const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// DATABASE CONNECTION
const MONGODB_URI = "mongodb+srv://khushalwarsi475:Mongodb098@cluster0.w7fb35r.mongodb.net/sikandar_meats?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas (Mumbai)'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// DATA MODEL
const itemSchema = new mongoose.Schema({
  name: String,
  price: Number
});
const Item = mongoose.model('Item', itemSchema);

// --- API ROUTES ---

// GET: Fetch all items
app.get('/api/inventory', async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// POST: Add a new item
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

// DELETE: Remove an item
app.delete('/api/inventory/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Item.findByIdAndDelete(id); 
    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

// PUT: Update an item's price
app.put('/api/inventory/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { price } = req.body;
    
    const updatedItem = await Item.findByIdAndUpdate(
      id, 
      { price: Number(price) }, 
      { new: true }
    );
    
    if (!updatedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(200).json(updatedItem);
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend API is live and connected to MongoDB!`);
});