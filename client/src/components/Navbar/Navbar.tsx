import React, { useState } from 'react';
import styles from './Navbar.module.css';

// O caminho para a sua logo branca (que você já tem funcionando)
const logoBrancaUrl = '/img/unifor_logo.png'; // '/img/12047780359881700749.png' ou o nome que você deu para a logo branca

interface User {
  name: string;
  // Adicione outras propriedades do usuário se necessário, como avatarUrl
}

const Navbar: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const user: User = { name: 'João' }; // Dados do usuário

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    // Exemplo
<nav className={styles.navbar} style={{ backgroundColor: '#084cf4' }}>
  <div className={styles.navbarLogo}>
    {/* ... */}
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