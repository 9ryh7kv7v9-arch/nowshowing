# NowShowing — Cinema Showtimes Manager

ICT251 Activity 4 · Question 15 · resource `showtimes`, table `showtimes`
Node.js + Express REST API · SQLite · vanilla HTML/CSS/JS client

## Project layout

```
showtimes-v2/
├── backend/
│   ├── .env.example            → copy to .env
│   ├── package.json
│   ├── schema.sql              table, index, 10 seed records
│   ├── db.js                   connection, one-time migration, data-access functions
│   ├── server.js               app setup, CORS, logging, static frontend
│   ├── routes/showtimes.js     the five REST endpoints
│   └── middleware/
│       ├── validate.js         body + id validation
│       └── errorHandler.js     404 + JSON error responses
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── Showtimes.postman_collection.json
└── README.md
```

## Table: `showtimes`

| Column | Type | Notes |
|---|---|---|
| id | INTEGER | primary key, auto-increment |
| movie_title | VARCHAR(200) | required |
| director | VARCHAR(120) | optional |
| age_rating | VARCHAR(10) | G, PG, PG-13, 16, 18 |
| duration_min | INTEGER | 1–400 |
| screen | INTEGER | 1–10 |
| format | VARCHAR(10) | 2D, 3D, IMAX |
| starts_at | DATETIME | `YYYY-MM-DD HH:MM` |
| price | REAL | ≥ 0 (ZMW) |
| created_at / updated_at | TIMESTAMP | set automatically |

## Requirements

Node.js **22.13 or newer** (check with `node -v`). The database uses Node's built-in `node:sqlite` module, so there is nothing to compile and no Visual Studio needed.

## Run locally (Windows PowerShell)

```powershell
cd showtimes-v2\backend
copy .env.example .env
npm install
npm start
```

- App: http://localhost:5000
- API: http://localhost:5000/api/showtimes
- Reset to the 10 seed records: stop the server, run `npm run reset-db`, start again.

## API

All responses are JSON with a `success` flag.

| Method | Endpoint | Body | Responses |
|---|---|---|---|
| GET | `/api/showtimes` | – | 200 (optional `?search=title`) |
| GET | `/api/showtimes/:id` | – | 200, 400, 404 |
| POST | `/api/showtimes` | all fields | 201, 422 |
| PUT | `/api/showtimes/:id` | all fields (full replace) | 200, 400, 404, 422 |
| DELETE | `/api/showtimes/:id` | – | 200, 400, 404 |

Example body:

```json
{
  "movie_title": "Sinners",
  "director": "Ryan Coogler",
  "age_rating": "16",
  "duration_min": 137,
  "screen": 5,
  "format": "IMAX",
  "starts_at": "2026-10-27 20:00",
  "price": 135
}
```

## Postman evidence (video)

1. Postman → **Import** → `Showtimes.postman_collection.json`.
2. Start screen recording.
3. Click the requests in order: **Create → List → Get → Update → Delete**. Show the method, URL, body and JSON response for each.
4. The Create request saves the new id, so Get, Update and Delete use that record.
5. For the deployed version: collection → **Variables** → set `host` to your Render URL, then run them again.

## Deploy (Render, free)

1. Create a GitHub repo and push the `showtimes-v2` folder (`.env` and the database are gitignored).
2. Go to render.com → **New → Web Service** → pick the repo.
3. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free
4. **Environment Variables:** `DB_FILE` = `showtimes.sqlite` (Render provides `PORT`).
5. Click **Create Web Service** and wait for "Live".

Links to submit:

- Frontend: `https://<service-name>.onrender.com/`
- GET / POST: `https://<service-name>.onrender.com/api/showtimes`
- GET one / PUT / DELETE: `https://<service-name>.onrender.com/api/showtimes/1`

Note: free instances sleep after ~15 minutes idle, so the first request can take ~50 seconds. The free disk is temporary, so the database returns to the 10 seed records after a redeploy or restart.
