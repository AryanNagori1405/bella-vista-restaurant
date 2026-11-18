import { useInView } from '../hooks.js';

export default function Contact() {
  const [ref, seen] = useInView();
  return (
    <section className={`section reveal${seen ? ' visible' : ''}`} id="contact" ref={ref}>
      <div className="container about-grid">
        <div>
          <h2>Visit us</h2>
          <p>
            12 Garden Street, Bengaluru<br />
            Open daily · 11:00 AM – 11:00 PM<br />
            +91 98765 43210 · hello@bellavista.example
          </p>
        </div>
        <div>
          <h3>Opening hours</h3>
          <p>Mon – Fri: 11:00 – 23:00<br />Sat – Sun: 10:00 – 23:30</p>
        </div>
      </div>
    </section>
  );
}
