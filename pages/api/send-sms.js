// TextBelt free SMS API — 1 free SMS per day per IP
// Free key = "textbelt" (no signup needed)
// Paid key from textbelt.com for more volume

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { phone, message } = req.body;
  if (!phone || !message) return res.status(400).json({ success: false, message: 'Phone and message are required.' });

  // Clean phone: ensure it has country code for India (+91)
  let cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;
  if (!cleanPhone.startsWith('+')) cleanPhone = '+' + cleanPhone;

  try {
    const response = await fetch('https://textbelt.com/text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: cleanPhone,
        message: message,
        key: process.env.TEXTBELT_API_KEY || 'textbelt', // 'textbelt' = free (1/day), set env var for paid
      }),
    });

    const data = await response.json();

    if (data.success) {
      return res.status(200).json({ success: true, quotaRemaining: data.quotaRemaining });
    } else {
      return res.status(200).json({ success: false, message: data.error || 'SMS failed to send.' });
    }
  } catch (err) {
    console.error('TextBelt error:', err);
    return res.status(500).json({ success: false, message: 'SMS service unreachable.' });
  }
}
