const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();

// POST /api/payments/create-order — Create Razorpay order
router.post('/create-order', auth, async (req, res) => {
  try {
    // Check if Razorpay keys are configured
    if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.includes('XXXX')) {
      // Fallback: return a mock order for testing without Razorpay
      return res.json({
        id: 'order_mock_' + Date.now(),
        amount: req.body.amount,
        currency: 'INR',
        mock: true,
      });
    }

    const Razorpay = require('razorpay');
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: req.body.amount * 100, // Razorpay uses paise
      currency: 'INR',
      receipt: 'srm_' + Date.now(),
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    console.error('Razorpay error:', err);
    res.status(500).json({ error: 'Payment creation failed.' });
  }
});

// POST /api/payments/verify — Verify Razorpay signature
router.post('/verify', auth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // If mock mode, just accept
    if (razorpay_order_id && razorpay_order_id.startsWith('order_mock_')) {
      return res.json({ verified: true, mock: true });
    }

    const crypto = require('crypto');
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      res.json({ verified: true });
    } else {
      res.status(400).json({ verified: false, error: 'Signature mismatch.' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Verification failed.' });
  }
});

module.exports = router;
