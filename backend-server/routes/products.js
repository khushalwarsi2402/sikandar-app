const express = require('express');
const Product = require('../models/Product');
const router = express.Router();

// GET /api/products — List all active products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ isActive: true });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products.' });
  }
});

// GET /api/products/:id — Single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found.' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch product.' });
  }
});

module.exports = router;
