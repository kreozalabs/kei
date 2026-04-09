import { PGlite } from '@electric-sql/pglite'

export const db = new PGlite()

// Initialize some tables if needed
export const initDb = async () => {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS transition_logic (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      state JSONB DEFAULT '{}',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `)
}
