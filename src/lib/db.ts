import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";
import { PRODUCTS } from "@/data/products";

// Database file location (in project root, gitignored)
const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "shreesai.db");

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    initializeSchema(db);
  }
  return db;
}

function initializeSchema(db: Database.Database) {
  db.exec(`
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'customer',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Admin users table
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Products table
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT DEFAULT '',
      category TEXT DEFAULT 'Chandelier',
      price INTEGER NOT NULL DEFAULT 0,
      compare_at_price INTEGER DEFAULT 0,
      discount INTEGER NOT NULL DEFAULT 0,
      rating REAL NOT NULL DEFAULT 5.0,
      dimensions TEXT DEFAULT '',
      material TEXT DEFAULT '',
      finish TEXT DEFAULT '',
      bulbs TEXT DEFAULT '',
      stock INTEGER NOT NULL DEFAULT 0,
      images TEXT NOT NULL DEFAULT '[]',
      features TEXT NOT NULL DEFAULT '[]',
      specifications TEXT NOT NULL DEFAULT '{}',
      related_products TEXT NOT NULL DEFAULT '[]',
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Orders table
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT NOT NULL UNIQUE,
      user_id INTEGER REFERENCES users(id),
      guest_email TEXT,
      status TEXT NOT NULL DEFAULT 'Pending',
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      address_line1 TEXT NOT NULL,
      address_city TEXT NOT NULL,
      address_state TEXT NOT NULL,
      address_pincode TEXT NOT NULL,
      address_country TEXT DEFAULT 'IN',
      subtotal INTEGER NOT NULL DEFAULT 0,
      discount_amount INTEGER NOT NULL DEFAULT 0,
      tax INTEGER NOT NULL DEFAULT 0,
      shipping INTEGER NOT NULL DEFAULT 0,
      grand_total INTEGER NOT NULL DEFAULT 0,
      payment_method TEXT DEFAULT 'cod',
      notes TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Order Items table
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      product_image TEXT DEFAULT '',
      unit_price INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      selected_finish TEXT DEFAULT ''
    );

    -- Contact messages table
    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT DEFAULT '',
      subject TEXT DEFAULT '',
      message TEXT NOT NULL,
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Seed default admin if not exists
  const adminExists = db.prepare("SELECT id FROM admins WHERE email = ?").get("admin@shreesaicreation.com");
  if (!adminExists) {
    const hash = bcrypt.hashSync("Admin123", 12);
    db.prepare("INSERT INTO admins (name, email, password_hash) VALUES (?, ?, ?)").run(
      "Shree Sai Admin",
      "admin@shreesaicreation.com",
      hash
    );
    console.log("✅ Default admin seeded: admin@shreesaicreation.com / Admin@123");
  }

  // Seed default products into database if table is empty
  const productCount = (db.prepare("SELECT COUNT(*) as count FROM products").get() as { count: number }).count;
  if (productCount === 0) {
    const insertStmt = db.prepare(`
      INSERT INTO products (name, slug, description, category, price, compare_at_price, discount, rating, dimensions, material, finish, bulbs, stock, images, features, specifications, related_products)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const p of PRODUCTS) {
      insertStmt.run(
        p.name,
        p.slug,
        p.description || "",
        p.category || "Chandelier",
        p.price || 0,
        0,
        p.discount || 0,
        p.rating || 5.0,
        p.dimensions || "",
        p.material || "",
        p.finish || "",
        p.bulbs || "",
        p.stock || 10,
        JSON.stringify(p.images || []),
        JSON.stringify(p.features || []),
        JSON.stringify(p.specifications || {}),
        JSON.stringify(p.relatedProducts || [])
      );
    }
    console.log(`✅ Seeded ${PRODUCTS.length} default products into SQLite database.`);
  }
}

export default getDb;
