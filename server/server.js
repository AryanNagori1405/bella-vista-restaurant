const path = require('path');
const fs = require('fs');
const express = require('express');
const Database = require('better-sqlite3');

const PORT = process.env.PORT || 3000;
const TAX_RATE = 0.05;
const db = new Database(process.env.DB_FILE || path.join(__dirname, 'bellavista.db'));
db.pragma('foreign_keys = ON');
db.exec(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));

const menuData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'client', 'public', 'data', 'menu.json'), 'utf8')
);

function seed() {
  if (db.prepare('SELECT COUNT(*) AS n FROM menu_items').get().n > 0) return;
  const addCat = db.prepare('INSERT OR IGNORE INTO categories (name) VALUES (?)');
  const catId = db.prepare('SELECT id FROM categories WHERE name = ?');
  const addItem = db.prepare(
    'INSERT INTO menu_items (id, category_id, name, description, price, veg, emoji) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
  const addTable = db.prepare('INSERT OR IGNORE INTO restaurant_tables (label, capacity) VALUES (?, ?)');
  db.transaction(() => {
    for (const m of menuData) {
      addCat.run(m.category);
      addItem.run(m.id, catId.get(m.category).id, m.name, m.description, m.price, m.veg ? 1 : 0, m.emoji);
    }
    [['T1', 2], ['T2', 2], ['T3', 4], ['T4', 4], ['T5', 6], ['T6', 8], ['T7', 12]].forEach((t) => addTable.run(...t));
  })();
}
seed();

const app = express();
app.use(express.json({ limit: '10kb' }));

const phoneOk = (p) => /^(\+91)?[6-9]\d{9}$/.test(String(p || '').replace(/[\s-]/g, ''));

/* ---------- Menu ---------- */
app.get('/api/menu', (req, res) => {
  const rows = db
    .prepare(
      `SELECT m.id, c.name AS category, m.name, m.description, m.price, m.veg, m.emoji
       FROM menu_items m
       JOIN categories c ON c.id = m.category_id
       ORDER BY c.id, m.id`
    )
    .all()
    .map((r) => ({ ...r, veg: !!r.veg }));
  res.json(rows);
});

/* ---------- Orders (cart checkout) ---------- */
const getItem = db.prepare('SELECT id, price FROM menu_items WHERE id = ?');
const insertOrder = db.prepare(
  'INSERT INTO orders (name, phone, subtotal, tax, total) VALUES (@name, @phone, @subtotal, @tax, @total)'
);
const insertLine = db.prepare(
  'INSERT INTO order_items (order_id, menu_item_id, qty, unit_price) VALUES (?, ?, ?, ?)'
);

app.post('/api/orders', (req, res) => {
  const { name, phone, items } = req.body || {};
  const errors = {};
  if (String(name || '').trim().length < 2) errors.name = 'Enter your name.';
  if (!phoneOk(phone)) errors.phone = 'Enter a valid 10-digit mobile number.';
  if (Object.keys(errors).length) return res.status(400).json({ errors });
  if (!Array.isArray(items) || items.length === 0 || items.length > 30)
    return res.status(400).json({ error: 'Your cart is empty.' });

  // Prices always come from the database, never from the client.
  const lines = [];
  for (const it of items) {
    const qty = Number(it.qty);
    const row = getItem.get(Number(it.id));
    if (!row || !Number.isInteger(qty) || qty < 1 || qty > 20)
      return res.status(400).json({ error: 'One of the items in your cart is invalid.' });
    lines.push({ id: row.id, qty, price: row.price });
  }
  const subtotal = lines.reduce((n, l) => n + l.qty * l.price, 0);
  const tax = Math.round(subtotal * TAX_RATE);

  const place = db.transaction(() => {
    const info = insertOrder.run({
      name: String(name).trim().slice(0, 60),
      phone: String(phone).replace(/[\s-]/g, ''),
      subtotal, tax, total: subtotal + tax,
    });
    lines.forEach((l) => insertLine.run(info.lastInsertRowid, l.id, l.qty, l.price));
    return info.lastInsertRowid;
  });
  const id = place();
  res.status(201).json({ id, subtotal, tax, total: subtotal + tax });
});

app.get('/api/orders', (req, res) => {
  const rows = db
    .prepare(
      `SELECT o.id, o.name, o.total, o.created_at,
              COUNT(oi.id) AS lines, SUM(oi.qty) AS dishes
       FROM orders o
       JOIN order_items oi ON oi.order_id = o.id
       GROUP BY o.id
       ORDER BY o.id DESC
       LIMIT 50`
    )
    .all();
  res.json(rows);
});

app.get('/api/orders/top-dishes', (req, res) => {
  const rows = db
    .prepare(
      `SELECT m.name, SUM(oi.qty) AS sold, SUM(oi.qty * oi.unit_price) AS revenue
       FROM order_items oi
       JOIN menu_items m ON m.id = oi.menu_item_id
       GROUP BY m.id
       ORDER BY sold DESC, revenue DESC
       LIMIT 5`
    )
    .all();
  res.json(rows);
});

/* ---------- Reservations ---------- */
const findTable = db.prepare(
  `SELECT t.id, t.label
   FROM restaurant_tables t
   WHERE t.capacity >= ?
     AND t.id NOT IN (SELECT table_id FROM reservations WHERE res_date = ? AND res_time = ?)
   ORDER BY t.capacity ASC, t.id ASC
   LIMIT 1`
);
const insertRes = db.prepare(
  `INSERT INTO reservations (table_id, name, phone, email, guests, res_date, res_time, notes)
   VALUES (@table_id, @name, @phone, @email, @guests, @res_date, @res_time, @notes)`
);

function validate(b) {
  const errors = {};
  const name = String(b.name || '').trim();
  const email = String(b.email || '').trim();
  const guests = Number(b.guests);
  const date = String(b.date || '');
  const time = String(b.time || '');
  if (name.length < 2 || name.length > 60) errors.name = 'Enter your name (2–60 characters).';
  if (!phoneOk(b.phone)) errors.phone = 'Enter a valid 10-digit Indian mobile number.';
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email address.';
  if (!Number.isInteger(guests) || guests < 1 || guests > 12) errors.guests = 'Guests must be between 1 and 12.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10))
    errors.date = 'Pick today or a future date.';
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time) || time < '11:00' || time > '22:30')
    errors.time = 'We take bookings between 11:00 and 22:30.';
  return {
    errors,
    clean: {
      name, phone: String(b.phone || '').replace(/[\s-]/g, ''), email: email || null, guests,
      res_date: date, res_time: time, notes: String(b.notes || '').trim().slice(0, 200) || null,
    },
  };
}

app.post('/api/reservations', (req, res) => {
  const { errors, clean } = validate(req.body || {});
  if (Object.keys(errors).length) return res.status(400).json({ errors });
  const table = findTable.get(clean.guests, clean.res_date, clean.res_time);
  if (!table) return res.status(409).json({ error: 'Sorry, no table is free for that slot. Please try another time.' });
  const info = insertRes.run({ ...clean, table_id: table.id });
  res.status(201).json({ id: info.lastInsertRowid, table: table.label, ...clean });
});

app.get('/api/reservations', (req, res) => {
  const rows = db
    .prepare(
      `SELECT r.id, r.name, r.guests, r.res_date, r.res_time, t.label AS table_label, t.capacity
       FROM reservations r
       JOIN restaurant_tables t ON t.id = r.table_id
       WHERE r.res_date >= date('now')
       ORDER BY r.res_date, r.res_time`
    )
    .all();
  res.json(rows);
});

app.get('/api/stats', (req, res) => {
  const rows = db
    .prepare(
      `SELECT res_date, COUNT(*) AS bookings, SUM(guests) AS total_guests
       FROM reservations GROUP BY res_date ORDER BY res_date`
    )
    .all();
  res.json(rows);
});

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

const dist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(dist));
app.get('*', (req, res) => {
  const index = path.join(dist, 'index.html');
  if (fs.existsSync(index)) res.sendFile(index);
  else res.status(404).send('Front-end not built yet. Run "npm run build" in the client folder.');
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong.' });
});

if (require.main === module) app.listen(PORT, () => console.log(`Bella Vista running at http://localhost:${PORT}`));
module.exports = app;
