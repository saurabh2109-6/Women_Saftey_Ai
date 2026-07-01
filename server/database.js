import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, 'data.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err.message);
  } else {
    console.log('✅ Connected to SQLite database at:', dbPath);
    initializeTables();
  }
});

function initializeTables() {
  db.serialize(() => {
    // 1. Users Table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        phone TEXT,
        otp_code TEXT,
        otp_expires INTEGER,
        is_verified INTEGER DEFAULT 0,
        avatar TEXT,
        blood_group TEXT DEFAULT 'O+',
        medical_conditions TEXT DEFAULT 'None'
      )
    `);

    // 2. Contacts Table
    db.run(`
      CREATE TABLE IF NOT EXISTS contacts (
        id TEXT PRIMARY KEY,
        user_email TEXT NOT NULL,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        relation TEXT,
        priority TEXT,
        message_template TEXT
      )
    `);

    // 3. Recordings Table
    db.run(`
      CREATE TABLE IF NOT EXISTS recordings (
        id TEXT PRIMARY KEY,
        user_email TEXT NOT NULL,
        date TEXT,
        time TEXT,
        duration TEXT,
        title TEXT,
        src TEXT
      )
    `);

    // 4. Incidents Table
    db.run(`
      CREATE TABLE IF NOT EXISTS incidents (
        id TEXT PRIMARY KEY,
        user_email TEXT NOT NULL,
        date TEXT,
        time TEXT,
        status TEXT,
        threat_score INTEGER,
        trigger_type TEXT,
        location TEXT
      )
    `);
  });
}

// Promisified database helpers to work easily with async/await
export const dbQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

export const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

export default db;
