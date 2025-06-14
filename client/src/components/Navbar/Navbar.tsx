import React from 'react';
import styles from './Navbar.module.css';
import { Link, useLocation, useNavigate } from 'react-router';

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear(); // ou localStorage.removeItem('userName'), etc.
    navigate('/', { replace: true }); // redireciona para página inicial
  };

  return (
    <nav className={styles.navbar} style={{ backgroundColor: '#084cf4' }}>
      <div className={styles.navbarLogo}>
        <Link to="/home" className={`${styles.navbarButton} ${location.pathname === '/home' ? styles.active : ''}`}>
          Início
        </Link>
        <Link to="/relatorio-semanal" className={`${styles.navbarButton} ${location.pathname === '/relatorio-semanal' ? styles.active : ''}`}>
          Relatório Semanal
        </Link>
        <Link to="/gerenciar-eventos" className={`${styles.navbarButton} ${location.pathname === '/gerenciar-eventos' ? styles.active : ''}`}>
          Gerenciar Eventos
        </Link>
      </div>

      <div className={styles.navbarUser}>
        <button onClick={handleLogout} className={styles.logoutButton}>
          Sair
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
