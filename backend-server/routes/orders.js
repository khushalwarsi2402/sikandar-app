const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const router = express.Router();

// POST /api/orders — Place order
router.post('/', auth, async (req, res) => {
  try {
    const { items, customer, paymentMethod, razorpayPaymentId } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty.' });
    }

    // Calculate totals & deduct stock
    let subtotal = 0;
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(400).json({ error: `Product ${item.name} not found.` });
      if (product.stock < item.qty) {
        return res.status(400).json({ error: `Not enough stock for ${item.name}.` });
      }
      product.stock -= item.qty;
      await product.save();
      subtotal += item.unitPrice * item.qty;
    }

    const delivery = 50;
    const total = subtotal + delivery;
    const orderId = 'SM-' + Math.floor(100000 + Math.random() * 900000);

    const order = new Order({
      userId: req.userId,
      orderId,
      items,
      subtotal,
      delivery,
      total,
      customer,
      paymentMethod: paymentMethod || 'card',
      razorpayPaymentId: razorpayPaymentId || null,
      status: 'confirmed',
      trackingSteps: [{ status: 'confirmed', timestamp: new Date() }],
    });

    await order.save();

    // Emit via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(`order_${orderId}`).emit('statusUpdate', { orderId, status: 'confirmed' });
    }

    // Simulate tracking progression
    simulateTracking(orderId, req.app.get('io'));

    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to place order.' });
  }
});

// GET /api/orders — User's orders
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders.' });
  }
});

// GET /api/orders/:orderId — Single order
router.get('/:orderId', auth, async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId, userId: req.userId });
    if (!order) return res.status(404).json({ error: 'Order not found.' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order.' });
  }
});

// Simulate tracking progression
function simulateTracking(orderId, io) {
  const statuses = ['preparing', 'delivering', 'delivered'];
  const delays = [5000, 10000, 15000]; // 5s, 10s, 15s

  statuses.forEach((status, i) => {
    setTimeout(async () => {
      try {
        const order = await Order.findOne({ orderId });
        if (!order || order.status === 'cancelled') return;

        order.status = status;
        order.trackingSteps.push({ status, timestamp: new Date() });
        await order.save();

        if (io) {
          io.to(`order_${orderId}`).emit('statusUpdate', {
            orderId,
            status,
            timestamp: new Date(),
          });
        }
      } catch (err) {
        console.error('Tracking error:', err);
      }
    }, delays[i]);
  });
}

module.exports = router;
