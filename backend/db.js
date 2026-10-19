/**
 * Database layer: connection + migration + data-access functions.
 * Uses Node's built-in SQLite (node:sqlite) — no native packages to compile.
 * Routes never write SQL themselves; they call these functions.
 */
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const SCHEMA_VERSION = 1;

function openDatabase(file) {
  const fullPath = path.resolve(__dirname, file);
  const conn = new DatabaseSync(fullPath);
  conn.exec('PRAGMA journal_mode = WAL;');

  // PRAGMA user_version is an integer SQLite stores in the file header.
  // 0 means "brand-new database", so create the table and seed data exactly once.
  const { user_version: current } = conn.prepare('PRAGMA user_version').get();
  if (current < SCHEMA_VERSION) {
    const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    conn.exec('BEGIN');
    try {
      conn.exec(sql);
      conn.exec(`PRAGMA user_version = ${SCHEMA_VERSION}`);
      conn.exec('COMMIT');
    } catch (err) {
      conn.exec('ROLLBACK');
      throw err;
    }
    console.info(`[db] created schema v${SCHEMA_VERSION} with seed data`);
  }
  console.info(`[db] using ${fullPath}`);
  return conn;
}

const conn = openDatabase(process.env.DB_FILE || 'showtimes.sqlite');

const COLUMNS = ['movie_title', 'director', 'age_rating', 'duration_min', 'screen', 'format', 'starts_at', 'price'];

const stmt = {
  list:   conn.prepare(`SELECT * FROM showtimes ORDER BY starts_at ASC`),
  search: conn.prepare(`SELECT * FROM showtimes WHERE movie_title LIKE ? ORDER BY starts_at ASC`),
  byId:   conn.prepare(`SELECT * FROM showtimes WHERE id = ?`),
  insert: conn.prepare(`INSERT INTO showtimes (${COLUMNS.join(',')})
                        VALUES (${COLUMNS.map((c) => ':' + c).join(',')})`),
  update: conn.prepare(`UPDATE showtimes SET
                          ${COLUMNS.map((c) => `${c} = :${c}`).join(', ')},
                          updated_at = CURRENT_TIMESTAMP
                        WHERE id = :id`),
  remove: conn.prepare(`DELETE FROM showtimes WHERE id = ?`),
};

// node:sqlite returns null-prototype objects; spread them into plain ones for JSON
const plain = (row) => (row ? { ...row } : undefined);

module.exports = {
  COLUMNS,
  findAll: (search) => (search ? stmt.search.all(`%${search}%`) : stmt.list.all()).map(plain),
  findById: (id) => plain(stmt.byId.get(id)),
  create: (data) => plain(stmt.byId.get(Number(stmt.insert.run(data).lastInsertRowid))),
  update: (id, data) => (stmt.update.run({ ...data, id }).changes ? plain(stmt.byId.get(id)) : undefined),
  remove: (id) => stmt.remove.run(id).changes > 0,
};
