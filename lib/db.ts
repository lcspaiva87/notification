import Database from 'better-sqlite3';
import path from 'path';

const db = new Database(path.join(process.cwd(), 'notifications.db'));

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS companies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    company_id TEXT NOT NULL,
    FOREIGN KEY (company_id) REFERENCES companies (id)
  );
`);

// Insert default companies if they don't exist
const companies = [
  { id: 'company1', name: 'Company 1' },
  { id: 'company2', name: 'Company 2' },
  { id: 'company3', name: 'Company 3' },
];

const insertCompany = db.prepare(`
  INSERT OR IGNORE INTO companies (id, name)
  VALUES (@id, @name)
`);

companies.forEach(company => {
  insertCompany.run(company);
});

export { db };