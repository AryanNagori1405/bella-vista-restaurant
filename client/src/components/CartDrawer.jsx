import { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext.jsx';
import { phoneOk } from '../utils/validation.js';
import { storage } from '../utils/storage.js';

export default function CartDrawer() {
  const { list, subtotal, tax, total, open, setOpen, setQty, remove, clear } = useCart();
  const [form, setForm] = useState({ name: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, setOpen]);

  const update = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((er) => ({ ...er, [name]: '' }));
  };

  async function placeOrder(e) {
    e.preventDefault();
    const errs = {};
    if (form.name.trim().length < 2) errs.name = 'Enter your name.';
    if (!phoneOk(form.phone)) errs.phone = 'Enter a valid 10-digit mobile number.';
    setErrors(errs);
    if (Object.keys(errs).length || !list.length) return;

    setBusy(true);
    const payload = { name: form.name.trim(), phone: form.phone, items: list.map((i) => ({ id: i.id, qty: i.qty })) };
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!(res.headers.get('content-type') || '').includes('json')) throw new Error('no-backend');
      const data = await res.json();
      if (!res.ok) {
        setErrors(data.errors || {});
        setResult({ ok: false, text: data.error || 'Could not place the order.' });
      } else {
        setResult({ ok: true, text: `Order #${data.id} placed! Total ₹${data.total}. We'll call you on ${form.phone}.` });
        clear();
        setForm({ name: '', phone: '' });
      }
    } catch {
      storage.set('bv-orders', [...storage.get('bv-orders', []), { ...payload, total, savedAt: new Date().toISOString() }]);
      setResult({ ok: true, text: `Order received (demo mode: no server found). Total ₹${total}. Run the Node server to store orders in the database.` });
      clear();
      setForm({ name: '', phone: '' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className={`overlay${open ? ' show' : ''}`} onClick={() => setOpen(false)} aria-hidden="true" />
      <aside className={`drawer${open ? ' open' : ''}`} role="dialog" aria-modal="true" aria-label="Your cart" aria-hidden={!open}>
        <div className="drawer-head">
          <h2>Your cart</h2>
          <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Close cart">✕</button>
        </div>

        <div className="drawer-body">
          {result && <p className={`form-msg ${result.ok ? 'ok' : 'bad'}`} role="status">{result.text}</p>}
          {list.length === 0 && !result && <p className="muted">Your cart is empty. Add something tasty from the menu!</p>}

          <ul className="cart-list">
            {list.map((i) => (
              <li key={i.id} className="cart-item">
                <span className="emoji" aria-hidden="true">{i.emoji}</span>
                <div className="cart-info">
                  <strong>{i.name}</strong>
                  <span className="muted">₹{i.price} each</span>
                </div>
                <div className="qty" aria-label={`Quantity of ${i.name}`}>
                  <button onClick={() => setQty(i.id, i.qty - 1)} aria-label="Decrease quantity">−</button>
                  <span>{i.qty}</span>
                  <button onClick={() => setQty(i.id, i.qty + 1)} aria-label="Increase quantity">+</button>
                </div>
                <span className="line-total">₹{i.price * i.qty}</span>
                <button className="icon-btn" onClick={() => remove(i.id)} aria-label={`Remove ${i.name}`}>🗑</button>
              </li>
            ))}
          </ul>
        </div>

        {list.length > 0 && (
          <form className="drawer-foot" onSubmit={placeOrder} noValidate>
            <dl className="totals">
              <div><dt>Subtotal</dt><dd>₹{subtotal}</dd></div>
              <div><dt>GST (5%)</dt><dd>₹{tax}</dd></div>
              <div className="grand"><dt>Total</dt><dd>₹{total}</dd></div>
            </dl>
            <div className={`field${errors.name ? ' invalid' : ''}`}>
              <label htmlFor="c-name">Name</label>
              <input id="c-name" name="name" value={form.name} onChange={update} autoComplete="name" aria-invalid={!!errors.name} />
              <small className="err">{errors.name}</small>
            </div>
            <div className={`field${errors.phone ? ' invalid' : ''}`}>
              <label htmlFor="c-phone">Mobile number</label>
              <input id="c-phone" name="phone" value={form.phone} onChange={update} inputMode="tel" autoComplete="tel" aria-invalid={!!errors.phone} />
              <small className="err">{errors.phone}</small>
            </div>
            <button className="btn full" type="submit" disabled={busy}>{busy ? 'Placing order…' : `Place order · ₹${total}`}</button>
            <button className="link-btn" type="button" onClick={clear}>Clear cart</button>
          </form>
        )}
      </aside>
    </>
  );
}
