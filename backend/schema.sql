/*
  Cinema Showtimes — Question 15
  Resource: showtimes   Table: showtimes
  Engine: SQLite
*/

CREATE TABLE showtimes (
  id            INTEGER      PRIMARY KEY AUTOINCREMENT,
  movie_title   VARCHAR(200) NOT NULL,
  director      VARCHAR(120),
  age_rating    VARCHAR(10)  NOT NULL DEFAULT 'PG',          -- G, PG, PG-13, 16, 18
  duration_min  INTEGER      NOT NULL CHECK (duration_min BETWEEN 1 AND 400),
  screen        INTEGER      NOT NULL CHECK (screen BETWEEN 1 AND 10),
  format        VARCHAR(10)  NOT NULL DEFAULT '2D',          -- 2D, 3D, IMAX
  starts_at     DATETIME     NOT NULL,                       -- 'YYYY-MM-DD HH:MM'
  price         REAL         NOT NULL CHECK (price >= 0),
  created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_showtimes_starts_at ON showtimes (starts_at);

INSERT INTO showtimes (movie_title, director, age_rating, duration_min, screen, format, starts_at, price) VALUES
  ('Interstellar',               'Christopher Nolan', 'PG-13', 169, 1, 'IMAX', '2026-10-21 18:30', 150),
  ('Black Panther',              'Ryan Coogler',      'PG-13', 134, 2, '3D',   '2026-10-21 15:00', 120),
  ('Coco',                       'Lee Unkrich',       'PG',    105, 3, '2D',   '2026-10-21 10:00',  80),
  ('The Dark Knight',            'Christopher Nolan', 'PG-13', 152, 1, 'IMAX', '2026-10-22 20:00', 150),
  ('Spider-Man: Across the Spider-Verse', 'Joaquim Dos Santos', 'PG', 140, 4, '3D', '2026-10-22 13:30', 110),
  ('Top Gun: Maverick',          'Joseph Kosinski',   'PG-13', 131, 2, 'IMAX', '2026-10-23 19:15', 145),
  ('Encanto',                    'Byron Howard',      'PG',    102, 3, '2D',   '2026-10-23 11:30',  80),
  ('Get Out',                    'Jordan Peele',      '16',    104, 5, '2D',   '2026-10-24 21:45', 100),
  ('Avatar: The Way of Water',   'James Cameron',     'PG-13', 192, 1, '3D',   '2026-10-25 17:00', 140),
  ('Paddington 2',               'Paul King',         'G',     103, 4, '2D',   '2026-10-26 09:45',  75);
