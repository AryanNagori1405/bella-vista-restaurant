CREATE TABLE IF NOT EXISTS categories (
  id   INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS menu_items (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL REFERENCES categories(id),
  name        TEXT NOT NULL,
  description TEXT NOT NULL,
  price       INTEGER NOT NULL CHECK (price > 0),
  veg         INTEGER NOT NULL DEFAULT 1,
  emoji       TEXT NOT NULL DEFAULT '🍽️'
);

CREATE TABLE IF NOT EXISTS restaurant_tables (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  label    TEXT NOT NULL UNIQUE,
  capacity INTEGER NOT NULL CHECK (capacity > 0)
);

CREATE TABLE IF NOT EXISTS reservations (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  table_id   INTEGER NOT NULL REFERENCES restaurant_tables(id),
  name       TEXT NOT NULL,
  phone      TEXT NOT NULL,
  email      TEXT,
  guests     INTEGER NOT NULL CHECK (guests BETWEEN 1 AND 12),
  res_date   TEXT NOT NULL,
  res_time   TEXT NOT NULL,
  notes      TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (table_id, res_date, res_time)
);
CREATE INDEX IF NOT EXISTS idx_res_slot ON reservations(res_date, res_time);

CREATE TABLE IF NOT EXISTS orders (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  phone      TEXT NOT NULL,
  subtotal   INTEGER NOT NULL,
  tax        INTEGER NOT NULL,
  total      INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id     INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id INTEGER NOT NULL REFERENCES menu_items(id),
  qty          INTEGER NOT NULL CHECK (qty BETWEEN 1 AND 20),
  unit_price   INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
