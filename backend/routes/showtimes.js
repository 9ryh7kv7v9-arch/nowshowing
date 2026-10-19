/** /api/showtimes routes */
const { Router } = require('express');
const db = require('../db');
const { validateShowtime, validateId } = require('../middleware/validate');

const router = Router();

// GET /api/showtimes            → all records
// GET /api/showtimes?search=dark → filter by title
router.get('/', (req, res) => {
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
  const data = db.findAll(search);
  res.json({ success: true, total: data.length, data });
});

// GET /api/showtimes/:id
router.get('/:id', validateId, (req, res) => {
  const record = db.findById(req.showtimeId);
  if (!record) return res.status(404).json({ success: false, message: `Showtime ${req.showtimeId} does not exist` });
  res.json({ success: true, data: record });
});

// POST /api/showtimes
router.post('/', validateShowtime, (req, res) => {
  const record = db.create(req.showtime);
  res.status(201).location(`/api/showtimes/${record.id}`).json({ success: true, message: 'Showtime created', data: record });
});

// PUT /api/showtimes/:id (full replace)
router.put('/:id', validateId, validateShowtime, (req, res) => {
  const record = db.update(req.showtimeId, req.showtime);
  if (!record) return res.status(404).json({ success: false, message: `Showtime ${req.showtimeId} does not exist` });
  res.json({ success: true, message: 'Showtime updated', data: record });
});

// DELETE /api/showtimes/:id
router.delete('/:id', validateId, (req, res) => {
  const existing = db.findById(req.showtimeId);
  if (!existing || !db.remove(req.showtimeId)) {
    return res.status(404).json({ success: false, message: `Showtime ${req.showtimeId} does not exist` });
  }
  res.json({ success: true, message: 'Showtime deleted', data: existing });
});

module.exports = router;
