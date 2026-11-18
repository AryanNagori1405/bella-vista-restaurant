import { useState } from 'react';
import { reservationRules, todayISO, validateAll } from '../utils/validation.js';
import { storage } from '../utils/storage.js';
import { useInView } from '../hooks.js';

const empty = () => ({ name: '', phone: '', email: '', guests: 2, date: todayISO(), time: '', notes: '' });

function Field({ id, label, error, children }) {
  return (
    <div className={`field${error ? ' invalid' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      <small className="err">{error}</small>
    </div>
  );
}

export default function ReservationForm() {
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [ref, seen] = useInView();

  const onChange = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }));
  const onBlur = (e) => {
    const rule = reservationRules[e.target.name];
    if (rule) setErrors((er) => ({ ...er, [e.target.name]: rule(e.target.value) }));
  };
  const props = (name) => ({
    id: name, name, value: values[name], onChange, onBlur, 'aria-invalid': !!errors[name],
  });

  async function onSubmit(e) {
    e.preventDefault();
    const errs = validateAll(values, reservationRules);
    setErrors(errs);
    if (Object.keys(errs).length) {
      setMsg({ ok: false, text: 'Please fix the highlighted fields.' });
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!(res.headers.get('content-type') || '').includes('json')) throw new Error('no-backend');
      const data = await res.json();
      if (res.status === 400 && data.errors) {
        setErrors(data.errors);
        setMsg({ ok: false, text: 'Please fix the highlighted fields.' });
      } else if (!res.ok) {
        setMsg({ ok: false, text: data.error || 'Could not complete the booking.' });
      } else {
        setMsg({ ok: true, text: `Booked! Table ${data.table} for ${data.guests} on ${data.res_date} at ${data.res_time}. Confirmation #${data.id}.` });
        setValues(empty());
      }
    } catch {
      storage.set('bv-reservations', [...storage.get('bv-reservations', []), { ...values, savedAt: new Date().toISOString() }]);
      setMsg({ ok: true, text: 'Request received (demo mode: no server found, saved on this device). Run the Node server to store bookings in the database.' });
      setValues(empty());
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className={`section alt reveal${seen ? ' visible' : ''}`} id="reserve" ref={ref}>
      <div className="container narrow">
        <h2>Reserve a table</h2>
        <form onSubmit={onSubmit} noValidate>
          <div className="grid2">
            <Field id="name" label="Full name *" error={errors.name}><input {...props('name')} autoComplete="name" /></Field>
            <Field id="phone" label="Mobile number *" error={errors.phone}><input {...props('phone')} inputMode="tel" autoComplete="tel" placeholder="9876543210" /></Field>
            <Field id="email" label="Email" error={errors.email}><input {...props('email')} type="email" autoComplete="email" /></Field>
            <Field id="guests" label="Guests *" error={errors.guests}><input {...props('guests')} type="number" min="1" max="12" /></Field>
            <Field id="date" label="Date *" error={errors.date}><input {...props('date')} type="date" min={todayISO()} /></Field>
            <Field id="time" label="Time *" error={errors.time}><input {...props('time')} type="time" min="11:00" max="22:30" step="900" /></Field>
          </div>
          <div className="field">
            <label htmlFor="notes">Special requests <span className="muted">{values.notes.length}/200</span></label>
            <textarea {...props('notes')} rows="3" maxLength={200} />
          </div>
          <button className="btn" type="submit" disabled={busy}>{busy ? 'Booking…' : 'Confirm reservation'}</button>
          {msg && <p className={`form-msg ${msg.ok ? 'ok' : 'bad'}`} role="status" aria-live="polite">{msg.text}</p>}
        </form>
      </div>
    </section>
  );
}
