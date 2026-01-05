import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import styles from './MainNav.module.css';

const navLinks = [
  { label: 'Flights', href: '#flights' },
  { label: 'Education', href: '#education' },
  { label: 'Trends', href: '#trends' },
  { label: 'In-Flight Guide', href: '#guide' },
];

export default function MainNav() {
  const { user } = useContext(AuthContext);
  const primaryCta = user ? '/dashboard' : '/register';

  return (
    <header className={styles.header}>
      <nav className={styles.navbar} aria-label="Primary">
        <Link to="/" className={styles.brand} aria-label="CabinCalm home">
          CabinCalm
        </Link>

        <div className={styles.links} role="list">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} className={styles.navLink}>
              {link.label}
            </a>
          ))}
        </div>

        <div className={styles.actions}>
          <Link to={primaryCta} className={styles.primaryCta}>
            Get Started
          </Link>
        </div>
      </nav>
    </header>
  );
}
