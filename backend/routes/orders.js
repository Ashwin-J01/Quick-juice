const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Juice = require('../models/Juice');

// GET /api/orders - Get all orders
router.get('/', async (req, res) => {
  try {
    const { status, customerEmail } = req.query;
    let filter = {};
    
    if (status) filter.status = status;
    if (customerEmail) filter['customer.email'] = customerEmail;
    
    const orders = await Order.find(filter)
      .populate('items.juice')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/orders/:id - Get single order
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.juice');
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/orders - Create new order
router.post('/', async (req, res) => {
  try {
    const { items, customer, deliveryAddress, paymentMethod, notes } = req.body;
    
    // Validate items and calculate total
    let totalAmount = 0;
    const validatedItems = [];
    
    for (const item of items) {
      const juice = await Juice.findById(item.juice);
      if (!juice) {
        return res.status(400).json({ error: `Juice with ID ${item.juice} not found` });
      }
      
      if (juice.stock < item.quantity) {
        return res.status(400).json({ 
          error: `Insufficient stock for ${juice.name}. Available: ${juice.stock}` 
        });
      }
      
      const itemTotal = juice.price * item.quantity;
      totalAmount += itemTotal;
      
      validatedItems.push({
        juice: item.juice,
        quantity: item.quantity,
        price: juice.price
      });
    }
    
    const order = new Order({
      customer,
      items: validatedItems,
      totalAmount,
      deliveryAddress,
      paymentMethod,
      notes,
      estimatedDelivery: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes from now
    });
    
    await order.save();
    
    // Update stock
    for (const item of validatedItems) {
      await Juice.findByIdAndUpdate(
        item.juice,
        { $inc: { stock: -item.quantity } }
      );
    }
    
    const populatedOrder = await Order.findById(order._id).populate('items.juice');
    res.status(201).json(populatedOrder);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/orders/:id/status - Update order status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('items.juice');
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/orders/:id - Update order
router.put('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('items.juice');
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/orders/:id - Cancel order
router.delete('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Restore stock if order is cancelled
    if (order.status !== 'delivered') {
      for (const item of order.items) {
        await Juice.findByIdAndUpdate(
          item.juice,
          { $inc: { stock: item.quantity } }
        );
      }
    }
    
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
