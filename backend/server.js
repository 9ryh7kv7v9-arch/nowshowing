require('dotenv').config();

const path = require('node:path');
const express = require('express');
const cors = require('cors');
const showtimesRouter = require('./routes/showtimes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
const port = Number(process.env.PORT) || 5000;

app.disable('x-powered-by'); // don't advertise the framework
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*' }));
app.use(express.json({ limit: '20kb' }));

// Request log with response time
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => console.info(`${req.method} ${req.originalUrl} → ${res.statusCode} (${Date.now() - start} ms)`));
  next();
});

app.get('/api', (req, res) =>
  res.json({
    success: true,
    service: 'Cinema Showtimes API',
    endpoints: ['GET /api/showtimes', 'GET /api/showtimes/:id', 'POST /api/showtimes', 'PUT /api/showtimes/:id', 'DELETE /api/showtimes/:id'],
  })
);
app.use('/api/showtimes', showtimesRouter);

// Frontend (same origin, so the deployed site works with one URL)
app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.use('/api', notFound);
app.use(errorHandler);

app.listen(port, () => console.info(`[server] http://localhost:${port}  (API at /api/showtimes)`));
