import { sql } from '../../lib/db';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'PATCH') {
    const { additionalStock } = req.body;
    const qty = parseInt(additionalStock, 10);
    if (isNaN(qty) || qty <= 0) return res.status(400).json({ success: false, message: 'Additional stock must be a positive number.' });
    const { rowCount } = await sql`UPDATE products SET stock_quantity = stock_quantity + ${qty} WHERE id = ${id}`;
    if (rowCount === 0) return res.status(404).json({ success: false, message: 'Product not found.' });
    return res.status(200).json({ success: true });
  }

  if (req.method === 'DELETE') {
    const { rowCount } = await sql`DELETE FROM products WHERE id = ${id}`;
    if (rowCount === 0) return res.status(404).json({ success: false, message: 'Product not found.' });
    return res.status(200).json({ success: true });
  }

  res.status(405).end();
}
