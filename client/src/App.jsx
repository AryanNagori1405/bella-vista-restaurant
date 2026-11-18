import { useEffect, useState } from 'react';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import About from './components/About.jsx';
import Menu from './components/Menu.jsx';
import Inspiration from './components/Inspiration.jsx';
import ReservationForm from './components/ReservationForm.jsx';
import Contact from './components/Contact.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import { storage } from './utils/storage.js';

export default function App() {
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  const [theme, setTheme] = useState(() => storage.get('theme', prefersDark ? 'dark' : 'light'));

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    storage.set('theme', theme);
  }, [theme]);

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <Navbar theme={theme} onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))} />
      <main id="main">
        <Hero />
        <About />
        <Menu />
        <Inspiration />
        <ReservationForm />
        <Contact />
      </main>
      <footer className="site-footer">
        <div className="container">© {new Date().getFullYear()} Bella Vista. A practice project by Aryan Nagori.</div>
      </footer>
      <CartDrawer />
    </>
  );
}
