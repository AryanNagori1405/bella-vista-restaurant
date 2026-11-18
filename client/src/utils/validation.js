export const todayISO = () =>
  new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);

export const phoneOk = (v) => /^(\+91)?[6-9]\d{9}$/.test(String(v).replace(/[\s-]/g, ''));

export const reservationRules = {
  name: (v) => (v.trim().length >= 2 && v.trim().length <= 60 ? '' : 'Enter your name (2–60 characters).'),
  phone: (v) => (phoneOk(v) ? '' : 'Enter a valid 10-digit Indian mobile number.'),
  email: (v) => (!v.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Enter a valid email address.'),
  guests: (v) => (Number.isInteger(+v) && +v >= 1 && +v <= 12 ? '' : 'Guests must be between 1 and 12.'),
  date: (v) => (v && v >= todayISO() ? '' : 'Pick today or a future date.'),
  time: (v) => (v && v >= '11:00' && v <= '22:30' ? '' : 'Please choose a time between 11:00 and 22:30.'),
};

export function validateAll(values, rules) {
  const errors = {};
  Object.keys(rules).forEach((k) => {
    const e = rules[k](values[k] ?? '');
    if (e) errors[k] = e;
  });
  return errors;
}
