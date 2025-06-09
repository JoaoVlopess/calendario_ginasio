import React, { useState } from 'react';
import styles from './Navbar.module.css';
import { Link, useLocation } from 'react-router';

// O caminho para a sua logo branca (que você já tem funcionando)
const logoBrancaUrl = '/img/unifor_logo.png'; // '/img/12047780359881700749.png' ou o nome que você deu para a logo branca

interface User {
  name: string;
  // Adicione outras propriedades do usuário se necessário, como avatarUrl
}

const Navbar: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const user: User = { name: 'João' }; // Dados do usuário
  const location = useLocation();

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <nav className={styles.navbar} style={{ backgroundColor: '#084cf4' }}>
      <div className={styles.navbarLogo}>
        <Link to="/home" className={`${styles.navbarButton} ${location.pathname === '/home' ? styles.active : ''}`}>Início</Link>
        <Link to="/relatorio-semanal" className={`${styles.navbarButton} ${location.pathname === '/relatorio-semanal' ? styles.active : ''}`}>Relatório Semanal</Link>
        <Link to="/gerenciar-eventos" className={`${styles.navbarButton} ${location.pathname === '/gerenciar-eventos' ? styles.active : ''}`}>Gerenciar Eventos</Link>
      </div>
      <div className={styles.navbarUser}>
        <button onClick={toggleDropdown} className={styles.userButton}>
          {user.name} <span className={`${styles.arrow} ${isDropdownOpen ? styles.up : styles.down}`}></span>
        </button>
        {/* etc. */}
      </div>
    </nav>
  );
};

export default Navbar;