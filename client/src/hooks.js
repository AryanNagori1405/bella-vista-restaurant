import { useEffect, useRef, useState } from 'react';

export function useDebounce(value, delay = 200) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function useInView(options = { threshold: 0.15 }) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    if (!('IntersectionObserver' in window)) { setSeen(true); return; }
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setSeen(true); io.disconnect(); }
    }, options);
    io.observe(el);
    return () => io.disconnect();
  }, [seen]);
  return [ref, seen];
}

export function useCountUp(end, start) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!start) return;
    const step = Math.max(1, Math.ceil(end / 30));
    const t = setInterval(() => {
      setN((v) => {
        const next = Math.min(end, v + step);
        if (next === end) clearInterval(t);
        return next;
      });
    }, 40);
    return () => clearInterval(t);
  }, [end, start]);
  return n;
}
