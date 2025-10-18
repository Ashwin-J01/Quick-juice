const express = require('express');
const router = express.Router();
const Juice = require('../models/Juice');

// GET /api/juices - Get all juices
router.get('/', async (req, res) => {
  try {
    const { category, availability } = req.query;
    let filter = {};
    
    if (category) filter.category = category;
    if (availability !== undefined) filter.availability = availability === 'true';
    
    const juices = await Juice.find(filter).sort({ createdAt: -1 });
    res.json(juices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/juices/:id - Get single juice
router.get('/:id', async (req, res) => {
  try {
    const juice = await Juice.findById(req.params.id);
    if (!juice) {
      return res.status(404).json({ error: 'Juice not found' });
    }
    res.json(juice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/juices - Create new juice
router.post('/', async (req, res) => {
  try {
    const juice = new Juice(req.body);
    await juice.save();
    res.status(201).json(juice);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/juices/:id - Update juice
router.put('/:id', async (req, res) => {
  try {
    const juice = await Juice.findByIdAndUpdate(
      req.params.id,
      req.body,
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

// DELETE /api/juices/:id - Delete juice
router.delete('/:id', async (req, res) => {
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

module.exports = router;
