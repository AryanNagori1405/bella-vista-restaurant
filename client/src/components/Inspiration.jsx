import { useCallback, useEffect, useRef, useState } from 'react';
import { useInView } from '../hooks.js';

export default function Inspiration() {
  const [ref, seen] = useInView({ rootMargin: '200px' });
  const [state, setState] = useState({ status: 'idle', meal: null });
  const started = useRef(false);

  const load = useCallback(async () => {
    setState({ status: 'loading', meal: null });
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    try {
      const res = await fetch('https://www.themealdb.com/api/json/v1/1/random.php', { signal: ctrl.signal });
      if (!res.ok) throw new Error(res.status);
      const meal = (await res.json()).meals?.[0];
      if (!meal) throw new Error('empty');
      setState({ status: 'ready', meal });
    } catch {
      setState({ status: 'error', meal: null });
    } finally {
      clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (seen && !started.current) { started.current = true; load(); }
  }, [seen, load]);

  const { status, meal } = state;
  return (
    <section className={`section reveal${seen ? ' visible' : ''}`} id="inspiration" ref={ref}>
      <div className="container">
        <h2>Chef's inspiration</h2>
        <p className="muted">A random dish from around the world, loaded live from TheMealDB API.</p>
        <div className="insp" aria-live="polite">
          {status === 'loading' && <div className="skeleton" aria-label="Loading" />}
          {status === 'error' && (
            <div className="error-box">Couldn't load a dish right now. Check your connection and tap “Surprise me” to retry.</div>
          )}
          {status === 'ready' && (
            <article className="insp-card">
              <img src={meal.strMealThumb} alt={meal.strMeal} loading="lazy" width="200" height="200" />
              <div>
                <h3>{meal.strMeal}</h3>
                <p className="muted">{meal.strCategory} · {meal.strArea}</p>
                <p>{(meal.strInstructions || '').slice(0, 220)}…</p>
                {meal.strSource && <a href={meal.strSource} target="_blank" rel="noopener noreferrer">Read the full recipe →</a>}
              </div>
            </article>
          )}
        </div>
        <button className="btn" type="button" onClick={load} disabled={status === 'loading'}>Surprise me</button>
      </div>
    </section>
  );
}
