/**
 * Validation middleware for showtime bodies.
 * PUT here is a full replace (REST style), so POST and PUT share the same rules.
 */
const RATINGS = ['G', 'PG', 'PG-13', '16', '18'];
const FORMATS = ['2D', '3D', 'IMAX'];
const DATETIME_RE = /^\d{4}-\d{2}-\d{2}[ T]([01]\d|2[0-3]):[0-5]\d$/;

const rules = {
  movie_title:  (v) => typeof v === 'string' && v.trim().length > 0 && v.length <= 200 || 'required text, max 200 chars',
  director:     (v) => v == null || v === '' || (typeof v === 'string' && v.length <= 120) || 'optional text, max 120 chars',
  age_rating:   (v) => RATINGS.includes(v) || `one of ${RATINGS.join(', ')}`,
  duration_min: (v) => Number.isInteger(+v) && +v >= 1 && +v <= 400 || 'whole number 1–400',
  screen:       (v) => Number.isInteger(+v) && +v >= 1 && +v <= 10 || 'whole number 1–10',
  format:       (v) => FORMATS.includes(v) || `one of ${FORMATS.join(', ')}`,
  starts_at:    (v) => typeof v === 'string' && DATETIME_RE.test(v) || 'date-time as YYYY-MM-DD HH:MM',
  price:        (v) => v !== '' && v !== null && Number.isFinite(+v) && +v >= 0 || 'number ≥ 0',
};

function validateShowtime(req, res, next) {
  const body = req.body ?? {};
  const fieldErrors = {};

  for (const [field, check] of Object.entries(rules)) {
    const result = check(body[field]);
    if (result !== true) fieldErrors[field] = result;
  }

  if (Object.keys(fieldErrors).length) {
    return res.status(422).json({ success: false, message: 'Validation failed', fieldErrors });
  }

  // Normalise into clean, typed values; unknown keys in the body are dropped
  req.showtime = {
    movie_title: body.movie_title.trim(),
    director: body.director ? String(body.director).trim() : null,
    age_rating: body.age_rating,
    duration_min: Number(body.duration_min),
    screen: Number(body.screen),
    format: body.format,
    starts_at: body.starts_at.replace('T', ' '),
    price: Math.round(Number(body.price) * 100) / 100,
  };
  next();
}

function validateId(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({ success: false, message: 'id must be a positive whole number' });
  }
  req.showtimeId = id;
  next();
}

module.exports = { validateShowtime, validateId, RATINGS, FORMATS };
