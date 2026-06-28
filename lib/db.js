import { sql } from '@vercel/postgres';

export async function initDB() {
  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      product_name TEXT NOT NULL,
      stock_quantity INTEGER NOT NULL DEFAULT 0,
      price_per_sack NUMERIC(10,2) NOT NULL DEFAULT 0
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS customers (
      id SERIAL PRIMARY KEY,
      customer_name TEXT NOT NULL,
      phone_number TEXT UNIQUE NOT NULL
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      customer_id INTEGER NOT NULL REFERENCES customers(id),
      total_bill NUMERIC(10,2) NOT NULL DEFAULT 0,
      order_date TEXT NOT NULL,
      order_time TEXT NOT NULL
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id INTEGER NOT NULL REFERENCES orders(id),
      product_id INTEGER REFERENCES products(id),
      quantity_bought INTEGER NOT NULL,
      price_at_sale NUMERIC(10,2) NOT NULL
    )
  `;
}

export { sql };
