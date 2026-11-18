import { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { storage } from '../utils/storage.js';

export const TAX_RATE = 0.05;
const CartContext = createContext(null);

function reducer(state, action) {
  switch (action.type) {
    case 'add': {
      const existing = state[action.item.id];
      const qty = Math.min(20, (existing?.qty || 0) + 1);
      return { ...state, [action.item.id]: { ...action.item, qty } };
    }
    case 'setQty': {
      const item = state[action.id];
      if (!item) return state;
      if (action.qty <= 0) {
        const { [action.id]: _removed, ...rest } = state;
        return rest;
      }
      return { ...state, [action.id]: { ...item, qty: Math.min(20, action.qty) } };
    }
    case 'remove': {
      const { [action.id]: _removed, ...rest } = state;
      return rest;
    }
    case 'clear':
      return {};
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(reducer, null, () => storage.get('bv-cart', {}));
  const [open, setOpen] = useState(false);

  useEffect(() => storage.set('bv-cart', items), [items]);

  const value = useMemo(() => {
    const list = Object.values(items);
    const count = list.reduce((n, i) => n + i.qty, 0);
    const subtotal = list.reduce((n, i) => n + i.qty * i.price, 0);
    const tax = Math.round(subtotal * TAX_RATE);
    return {
      list, count, subtotal, tax, total: subtotal + tax, open, setOpen,
      add: (item) => dispatch({ type: 'add', item }),
      setQty: (id, qty) => dispatch({ type: 'setQty', id, qty }),
      remove: (id) => dispatch({ type: 'remove', id }),
      clear: () => dispatch({ type: 'clear' }),
    };
  }, [items, open]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
};
