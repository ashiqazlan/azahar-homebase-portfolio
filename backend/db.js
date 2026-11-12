const sqlite3 = require('sqlite3')
const { open } = require('sqlite')

async function initDB() {
  const db = await open({
    filename: './azahar.db',
    driver: sqlite3.Database
  })

  await db.exec(`
    CREATE TABLE IF NOT EXISTS requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT,
      title TEXT,
      requester TEXT,
      status TEXT DEFAULT 'Pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  return db
}

module.exports = initDB
