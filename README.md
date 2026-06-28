# Amuthan Cattle Feeds — Enterprise Ledger (Web App)

Next.js web app. Deploys on Vercel with Vercel Postgres (free).

---

## Deploy to Vercel

### Step 1 — Push to GitHub
Replace all old files in your repo with these new files. Commit and push.

### Step 2 — Add Vercel Postgres (free database)
1. Vercel dashboard → your project → **Storage** tab
2. Click **Create Database** → **Postgres** → Name it → **Create**
3. Vercel auto-adds all `POSTGRES_*` environment variables

### Step 3 — Add TextBelt SMS key (optional but recommended)
TextBelt free tier = 1 SMS/day (for testing).
For unlimited SMS, get a paid key at https://textbelt.com (very cheap).

In Vercel → your project → **Settings** → **Environment Variables**:
- Key: `TEXTBELT_API_KEY`
- Value: `textbelt` for free (1/day), OR your paid key from textbelt.com

Without setting this, the app uses `textbelt` key automatically (free, 1 SMS/day).

### Step 4 — Redeploy
Vercel dashboard → Deployments → Redeploy latest.

### Done!
Tables are auto-created on first visit.

---

## Features

### Billing
- Enter phone number → **auto-fills customer name** if they've bought before
- Green highlight shows returning customers
- Add products to cart, generate invoice
- **SMS sent automatically** to customer on every sale (from Amuthan Cattle Feeds)

### Warehouse
- Add, restock, and delete feed products
- Low stock warning (≤5 sacks)

### Analytics
- Full sales history with date filter
- **Click any customer name** → jumps to their monthly CRM report

### Customer CRM
- Search by phone number
- **Monthly Report** button → see purchases grouped by month
- Click any month to expand and see all orders in that month
- Print any invoice from history

---

## SMS Message Format (sent on every billing)
```
Dear [Name], Thank you for your purchase at Amuthan Cattle Feeds!
Items: [product list]
Total: Rs.[amount]
Invoice #INV-[id]
Visit us again!
```

---

## File Structure
```
/pages
  index.js                  ← Full frontend (React)
  /api
    products.js             ← GET all / POST new product
    products/[id].js        ← PATCH restock / DELETE
    customer-lookup.js      ← GET customer by phone (autofill)
    checkout.js             ← POST sale + auto SMS
    order/[id].js           ← GET order detail for invoice
    analytics.js            ← GET sales history
    crm.js                  ← GET customer order list
    crm-monthly.js          ← GET customer monthly report
    send-sms.js             ← POST send SMS via TextBelt
/lib
  db.js                     ← Vercel Postgres + table setup
```
