const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const DB_TYPE = (process.env.DB_TYPE || 'sqlite').toLowerCase();
let dbClient = null;
let dbQuery = {};

console.log(`🔌 Initializing Dynamic Database Connection... Engine: [${DB_TYPE.toUpperCase()}]`);

if (DB_TYPE === 'mysql') {
  const mysql = require('mysql2/promise');

  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'friendz_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  };

  let pool = null;

  async function getMySQLPool() {
    if (pool) return pool;
    try {
      // First connect without DB to ensure DB exists
      const tempConn = await mysql.createConnection({
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.password
      });
      await tempConn.query(`CREATE DATABASE IF NOT EXISTS \`${config.database}\`;`);
      await tempConn.end();

      pool = mysql.createPool(config);
      console.log(`✅ Dynamic DB: Connected to MySQL database [${config.database}] on ${config.host}:${config.port}`);
      return pool;
    } catch (err) {
      console.error('❌ Dynamic DB MySQL Connection Failed:', err.message);
      throw err;
    }
  }

  dbQuery = {
    all: async (sql, params = []) => {
      const p = await getMySQLPool();
      const [rows] = await p.execute(sql, params);
      return rows;
    },

    get: async (sql, params = []) => {
      const p = await getMySQLPool();
      const [rows] = await p.execute(sql, params);
      return rows[0] || null;
    },

    run: async (sql, params = []) => {
      const p = await getMySQLPool();
      const [result] = await p.execute(sql, params);
      return { lastID: result.insertId, changes: result.affectedRows };
    },

    exec: async (sql) => {
      const p = await getMySQLPool();
      // Split multiple SQL statements if any
      const statements = sql.split(';').map(s => s.trim()).filter(Boolean);
      for (const statement of statements) {
        await p.query(statement);
      }
    }
  };

} else {
  // Fallback / Default: SQLite3
  const sqlite3 = require('sqlite3').verbose();
  const dbDir = path.join(__dirname);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const relativePath = process.env.SQLITE_PATH || 'database/friendz.db';
  const dbPath = path.isAbsolute(relativePath) ? relativePath : path.join(__dirname, '..', relativePath);
  
  const sqliteDb = new sqlite3.Database(dbPath);
  console.log(`✅ Dynamic DB: Connected to SQLite database file [${dbPath}]`);

  dbQuery = {
    all: (sql, params = []) => new Promise((resolve, reject) => {
      sqliteDb.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    }),

    get: (sql, params = []) => new Promise((resolve, reject) => {
      sqliteDb.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    }),

    run: (sql, params = []) => new Promise((resolve, reject) => {
      sqliteDb.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    }),

    exec: (sql) => new Promise((resolve, reject) => {
      sqliteDb.exec(sql, (err) => {
        if (err) reject(err);
        else resolve();
      });
    })
  };
}

// Initialize Table Schema dynamically for SQLite / MySQL
async function initSchema() {
  const isMySQL = DB_TYPE === 'mysql';

  const productsSql = isMySQL ? `
    CREATE TABLE IF NOT EXISTS products (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL,
      gender VARCHAR(50) NOT NULL,
      kidGender VARCHAR(50),
      price DECIMAL(10, 2) NOT NULL,
      sizes TEXT,
      colors TEXT,
      material TEXT,
      description TEXT,
      images TEXT,
      featured TINYINT(1) DEFAULT 0,
      newArrival TINYINT(1) DEFAULT 0,
      collection VARCHAR(100),
      stock INT DEFAULT 50,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  ` : `
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      gender TEXT NOT NULL,
      kidGender TEXT,
      price REAL NOT NULL,
      sizes TEXT,
      colors TEXT,
      material TEXT,
      description TEXT,
      images TEXT,
      featured INTEGER DEFAULT 0,
      newArrival INTEGER DEFAULT 0,
      collection TEXT,
      stock INTEGER DEFAULT 50,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const ordersSql = isMySQL ? `
    CREATE TABLE IF NOT EXISTS orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_number VARCHAR(100) UNIQUE NOT NULL,
      customer_name VARCHAR(255) NOT NULL,
      customer_phone VARCHAR(50) NOT NULL,
      address TEXT NOT NULL,
      landmark VARCHAR(255),
      pincode VARCHAR(20) NOT NULL,
      delivery_note TEXT,
      total_amount DECIMAL(10, 2) NOT NULL,
      status VARCHAR(50) DEFAULT 'Pending',
      payment_method VARCHAR(50) DEFAULT 'WhatsApp / COD',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  ` : `
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT UNIQUE NOT NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      address TEXT NOT NULL,
      landmark TEXT,
      pincode TEXT NOT NULL,
      delivery_note TEXT,
      total_amount REAL NOT NULL,
      status TEXT DEFAULT 'Pending',
      payment_method TEXT DEFAULT 'WhatsApp / COD',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const orderItemsSql = isMySQL ? `
    CREATE TABLE IF NOT EXISTS order_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT NOT NULL,
      product_id VARCHAR(50) NOT NULL,
      product_name VARCHAR(255) NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      quantity INT NOT NULL,
      selected_size VARCHAR(50),
      selected_color VARCHAR(50),
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );
  ` : `
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      selected_size TEXT,
      selected_color TEXT,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );
  `;

  const contactSql = isMySQL ? `
    CREATE TABLE IF NOT EXISTS contact_messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      message TEXT NOT NULL,
      status VARCHAR(50) DEFAULT 'Unread',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  ` : `
    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'Unread',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const adminsSql = isMySQL ? `
    CREATE TABLE IF NOT EXISTS admins (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  ` : `
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await dbQuery.exec(productsSql);
  await dbQuery.exec(ordersSql);
  await dbQuery.exec(orderItemsSql);
  await dbQuery.exec(contactSql);
  await dbQuery.exec(adminsSql);
}

// Auto init schema on load
initSchema().catch(err => console.error('Database Schema Initialization Error:', err));

module.exports = {
  dbQuery,
  initSchema,
  DB_TYPE
};
