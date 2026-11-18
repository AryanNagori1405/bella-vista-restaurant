import { useEffect, useMemo, useState } from 'react';
import MenuCard from './MenuCard.jsx';
import { useDebounce, useInView } from '../hooks.js';

async function loadMenu() {
  const sources = ['/api/menu', `${import.meta.env.BASE_URL}data/menu.json`];
  for (const url of sources) {
    try {
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      const type = res.headers.get('content-type') || '';
      if (!res.ok || !type.includes('json')) continue;
      const data = await res.json();
      if (Array.isArray(data) && data.length) return data;
    } catch {
      /* try the next source */
    }
  }
  throw new Error('Menu unavailable');
}

export default function Menu() {
  const [menu, setMenu] = useState([]);
  const [state, setState] = useState('loading');
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const query = useDebounce(search, 200).trim().toLowerCase();
  const [ref, seen] = useInView();

  useEffect(() => {
    let alive = true;
    loadMenu()
      .then((d) => { if (alive) { setMenu(d); setState('ready'); } })
      .catch(() => alive && setState('error'));
    return () => { alive = false; };
  }, []);

  const categories = useMemo(() => ['All', ...new Set(menu.map((m) => m.category))], [menu]);
  const visible = useMemo(
    () =>
      menu.filter(
        (m) =>
          (category === 'All' || m.category === category) &&
          (!vegOnly || m.veg) &&
          (!query || m.name.toLowerCase().includes(query) || m.description.toLowerCase().includes(query))
      ),
    [menu, category, vegOnly, query]
  );

  let status = '';
  if (state === 'loading') status = 'Loading menu…';
  else if (state === 'error') status = 'Could not load the menu. Please refresh and try again.';
  else status = visible.length ? `Showing ${visible.length} of ${menu.length} dishes` : 'No dishes match your search.';

  return (
    <section className={`section alt reveal${seen ? ' visible' : ''}`} id="menu" ref={ref}>
      <div className="container">
        <h2>Our menu</h2>
        <div className="toolbar">
          <div className="filters" role="group" aria-label="Filter by category">
            {categories.map((c) => (
              <button key={c} type="button" className="chip" aria-pressed={c === category} onClick={() => setCategory(c)}>
                {c}
              </button>
            ))}
          </div>
          <div className="tools-right">
            <label className="veg-toggle">
              <input type="checkbox" checked={vegOnly} onChange={(e) => setVegOnly(e.target.checked)} /> Veg only
            </label>
            <input
              type="search"
              placeholder="Search dishes…"
              aria-label="Search dishes"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              id="search"
            />
          </div>
        </div>
        <p className="status" role="status" aria-live="polite">{status}</p>
        <div className="menu-grid">
          {visible.map((item) => <MenuCard key={item.id} item={item} />)}
        </div>
      </div>
    </section>
  );
}
