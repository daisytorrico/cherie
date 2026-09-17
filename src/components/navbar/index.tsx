import { NavLink } from 'react-router-dom';
import { House, Heart } from 'lucide-react';
import styles from './style.module.css';

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <ul>
        <li>
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
          >
            <House className={styles.navIcon} strokeWidth={2} />
            <span>Inicio</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/wishlist"
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
          >
            <Heart className={styles.navIcon} strokeWidth={2} />
            <span>Favoritos</span>
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}
