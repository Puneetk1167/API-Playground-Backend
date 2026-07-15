const express = require('express');
const router = express.Router();
const Request = require('../models/Request');

// GET /api/requests — List all saved requests (optionally filter by collectionId)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.collectionId) filter.collectionId = req.query.collectionId;
    const requests = await Request.find(filter).sort({ updatedAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/requests — Save a new request
router.post('/', async (req, res) => {
  try {
    const request = new Request(req.body);
    const saved = await request.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/requests/:id — Get a single saved request
router.get('/:id', async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ error: 'Request not found.' });
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/requests/:id — Update/overwrite a saved request
router.put('/:id', async (req, res) => {
  try {
    const updated = await Request.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: 'Request not found.' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/requests/:id — Delete a saved request
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Request.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Request not found.' });
    res.json({ message: 'Request deleted successfully.', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
