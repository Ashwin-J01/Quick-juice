const express = require('express');
const { body, validationResult } = require('express-validator');
const { adminAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const Juice = require('../models/Juice');
const Order = require('../models/Order');
const User = require('../models/User');

const router = express.Router();

// All admin routes require admin authentication
router.use(adminAuth);

// GET /api/admin/dashboard - Get dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalJuices = await Juice.countDocuments();
    
    const recentOrders = await Order.find()
      .populate('items.juice', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    const lowStockJuices = await Juice.find({ stock: { $lt: 10 } }).select('name stock');

    res.json({
      stats: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalCustomers,
        totalJuices,
        lowStockCount: lowStockJuices.length
      },
      recentOrders,
      lowStockJuices
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/juices - Get all juices for admin
router.get('/juices', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category } = req.query;
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      query.category = category;
    }

    const juices = await Juice.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Juice.countDocuments(query);

    res.json({
      juices,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/juices - Create new juice
router.post('/juices', upload.single('image'), [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('about').trim().notEmpty().withMessage('About is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('category').isIn(['fruit', 'vegetable', 'smoothie']).withMessage('Invalid category')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const juiceData = req.body;
    
    // Handle image upload
    if (req.file) {
      juiceData.image = `/uploads/${req.file.filename}`;
    }

    // Parse ingredients and tags if they're strings
    if (typeof juiceData.ingredients === 'string') {
      juiceData.ingredients = juiceData.ingredients.split(',').map(item => item.trim());
    }
    if (typeof juiceData.tags === 'string') {
      juiceData.tags = juiceData.tags.split(',').map(item => item.trim());
    }

    const juice = new Juice(juiceData);
    await juice.save();

    res.status(201).json(juice);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/admin/juices/:id - Update juice
router.put('/juices/:id', upload.single('image'), [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('price').optional().isNumeric().withMessage('Price must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updateData = req.body;
    
    // Handle image upload
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    // Parse ingredients and tags if they're strings
    if (typeof updateData.ingredients === 'string') {
      updateData.ingredients = updateData.ingredients.split(',').map(item => item.trim());
    }
    if (typeof updateData.tags === 'string') {
      updateData.tags = updateData.tags.split(',').map(item => item.trim());
    }

    const juice = await Juice.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!juice) {
      return res.status(404).json({ error: 'Juice not found' });
    }

    res.json(juice);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/admin/juices/:id - Delete juice
router.delete('/juices/:id', async (req, res) => {
  try {
    const juice = await Juice.findByIdAndDelete(req.params.id);
    if (!juice) {
      return res.status(404).json({ error: 'Juice not found' });
    }
    res.json({ message: 'Juice deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/orders - Get all orders for admin
router.get('/orders', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'customer.email': { $regex: search, $options: 'i' } }
      ];
    }

    const orders = await Order.find(query)
      .populate('items.juice', 'name image')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/admin/orders/:id/status - Update order status
router.put('/orders/:id/status', [
  body('status').isIn(['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'])
    .withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('items.juice', 'name');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/admin/customers - Get all customers
router.get('/customers', async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const query = { role: 'customer' };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const customers = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      customers,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
