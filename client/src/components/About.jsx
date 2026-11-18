import { useCountUp, useInView } from '../hooks.js';

function Stat({ end, label, start }) {
  const n = useCountUp(end, start);
  return (
    <li><strong>{n}</strong><span>{label}</span></li>
  );
}

export default function About() {
  const [ref, seen] = useInView();
  return (
    <section className={`section reveal${seen ? ' visible' : ''}`} id="about" ref={ref}>
      <div className="container about-grid">
        <div>
          <h2>Our story</h2>
          <p>
            Bella Vista started as a small family kitchen with one rule: use fresh ingredients and never rush a sauce.
            Today we serve slow-cooked classics in a warm, relaxed space made for long dinners and good company.
          </p>
        </div>
        <ul className="stats" aria-label="Highlights">
          <Stat end={12} label="Years of service" start={seen} />
          <Stat end={15} label="Signature dishes" start={seen} />
          <Stat end={7} label="Tables" start={seen} />
        </ul>
      </div>
    </section>
  );
}
