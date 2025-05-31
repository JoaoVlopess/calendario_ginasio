// src/components/Navbar/Navbar.tsx

import React, { useState } from 'react';
import './Navbar.css'; // Seus estilos para a Navbar

// REMOVA a importação da imagem daqui, pois ela está na pasta 'public'
// import uniforLogo from '../../../public/img/unifor_logo.png';

interface User {
  name: string;
  // Adicione outras propriedades do usuário se necessário, como avatarUrl
}

const Navbar: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const user: User = { name: 'João' }; // Dados do usuário (pode vir de um estado global/contexto)

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Caminho para a imagem na pasta public (relativo à raiz do servidor)
  const logoUrl = '/img/unifor_logo.png';

  return (
    <nav className="navbar" style={{ backgroundColor: '#084cf4' }}>
      <div className="navbar-logo">
        {/* Use o caminho público para a imagem */}
        <img 
          src={logoUrl} 
          alt="Unifor Logo" 
          style={{ height: '40px', display: 'block' }} 
        />
        {/* Se estiver usando um componente SVG: */}
        {/* <Logo style={{ height: '40px', fill: 'white' }} /> */}
        {/* Ou apenas texto se não tiver a imagem pronta: */}
        {/* <a href="/">LOTER</a> */}
      </div>
      <div className="navbar-user">
        <button onClick={toggleDropdown} className="user-button">
          {user.name} <span className={`arrow ${isDropdownOpen ? 'up' : 'down'}`}></span>
        </button>
        {isDropdownOpen && (
          <div className="dropdown-menu">
            <a href="/profile">Meu Perfil</a>
            <a href="/my-courses">Meus Cursos</a>
            <a href="/settings">Configurações</a>
            <hr />
            <a href="/logout">Sair</a>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;