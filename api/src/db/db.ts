import * as Database from 'better-sqlite3';

export const db = new Database('/videos/db.sqlite');

db.exec(`
  CREATE TABLE IF NOT EXISTS videos (
    id TEXT PRIMARY KEY,
    status TEXT,
    path TEXT
  );
`);
