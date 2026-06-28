import { sql } from '../../lib/db';

async function sendSMS(phone, message) {
  try {
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;
    if (!cleanPhone.startsWith('+')) cleanPhone = '+' + cleanPhone;

    const response = await fetch('https://textbelt.com/text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: cleanPhone,
        message,
        key: process.env.TEXTBELT_API_KEY || 'textbelt',
      }),
    });
    const data = await response.json();
    console.log('SMS result:', data);
  } catch (e) {
    console.error('SMS send error:', e);
    // Non-fatal — don't fail the checkout if SMS fails
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { customerName, phoneNumber, items, totalBill } = req.body;
  if (!customerName?.trim()) return res.status(400).json({ success: false, message: 'Customer name is required.' });
  if (!phoneNumber?.trim()) return res.status(400).json({ success: false, message: 'Phone number is required.' });
  if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ success: false, message: 'No items in cart.' });

  try {
    // Verify stock
    const ids = items.map(i => i.productId);
    const { rows: prods } = await sql.query(
      `SELECT id, stock_quantity FROM products WHERE id = ANY($1)`,
      [ids]
    );
    if (prods.length !== items.length) return res.status(400).json({ success: false, message: 'One or more products not found.' });

    for (const item of items) {
      const match = prods.find(p => p.id === item.productId);
      if (!match || match.stock_quantity < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for "${item.name}". Available: ${match?.stock_quantity ?? 0}` });
      }
    }

    // Upsert customer
    await sql`
      INSERT INTO customers (customer_name, phone_number)
      VALUES (${customerName.trim()}, ${phoneNumber.trim()})
      ON CONFLICT (phone_number) DO UPDATE SET customer_name = EXCLUDED.customer_name
    `;
    const { rows: custRows } = await sql`SELECT id FROM customers WHERE phone_number = ${phoneNumber.trim()}`;
    const customerId = custRows[0].id;

    // Insert order
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0];
    const { rows: orderRows } = await sql`
      INSERT INTO orders (customer_id, total_bill, order_date, order_time)
      VALUES (${customerId}, ${parseFloat(totalBill)}, ${dateStr}, ${timeStr})
      RETURNING id
    `;
    const orderId = orderRows[0].id;

    // Insert items and deduct stock
    for (const item of items) {
      await sql`
        INSERT INTO order_items (order_id, product_id, quantity_bought, price_at_sale)
        VALUES (${orderId}, ${item.productId}, ${item.quantity}, ${item.price})
      `;
      await sql`UPDATE products SET stock_quantity = stock_quantity - ${item.quantity} WHERE id = ${item.productId}`;
    }

    // Build SMS message — sent after order is saved (non-blocking fail)
    const itemSummary = items.map(i => `${i.name} x${i.quantity}`).join(', ');
    const smsMessage = `Dear ${customerName.trim()}, Thank you for your purchase at Amuthan Cattle Feeds!\nItems: ${itemSummary}\nTotal: Rs.${parseFloat(totalBill).toFixed(2)}\nInvoice #INV-${orderId}\nVisit us again!`;
    await sendSMS(phoneNumber.trim(), smsMessage);

    return res.status(200).json({ success: true, orderId });
  } catch (err) {
    console.error('checkout error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}
