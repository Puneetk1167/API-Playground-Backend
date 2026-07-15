const express = require('express');
const router = express.Router();
const Collection = require('../models/Collection');

// GET /api/collections — List all collections
router.get('/', async (req, res) => {
  try {
    const collections = await Collection.find().sort({ createdAt: -1 });
    res.json(collections);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/collections — Create a new collection
router.post('/', async (req, res) => {
  try {
    const { name, description, color } = req.body;
    const collection = new Collection({ name, description, color });
    const saved = await collection.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/collections/:id — Get a single collection
router.get('/:id', async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);
    if (!collection) return res.status(404).json({ error: 'Collection not found.' });
    res.json(collection);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/collections/:id — Update a collection
router.put('/:id', async (req, res) => {
  try {
    const updated = await Collection.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: 'Collection not found.' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/collections/:id — Delete a collection
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Collection.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Collection not found.' });
    res.json({ message: 'Collection deleted successfully.', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
