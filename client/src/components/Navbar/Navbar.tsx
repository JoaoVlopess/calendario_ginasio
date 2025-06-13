import React, { useState } from 'react';
import styles from './Navbar.module.css';
import { Link, useLocation } from 'react-router';
import UsuarioModal from '../usuarioModal/UsuarioModal'; // Importar o novo componente de modal
import type { User } from '../../types/user'; // Assumindo que você tem um tipo User compartilhado

// O caminho para a sua logo branca (que você já tem funcionando)
const logoBrancaUrl = '/img/unifor_logo.png'; // '/img/12047780359881700749.png' ou o nome que você deu para a logo branca

// Interface User movida para um arquivo de tipos compartilhado (ex: src/types/user.ts)
// export interface User {
//   name: string;
//   email?: string;
//   id?: string;
//   senha?: string; // Adicionando senha se for parte do objeto User
// }

const Navbar: React.FC = () => {
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  // Gerenciar o usuário com estado para permitir atualizações
  const [currentUser, setCurrentUser] = useState<User>({ name: 'João', email: 'joao.silva@example.com', id: 'USER123', senha: 'password123' }); // Dados do usuário com mais informações
  const location = useLocation();
  const toggleUserModal = () => {
    setIsUserModalOpen(!isUserModalOpen);
  };

  const handleUserUpdate = (updatedUser: User) => {
    // Em uma aplicação real, você faria uma chamada API aqui para salvar os dados
    console.log('Usuário atualizado:', updatedUser);
    setCurrentUser(updatedUser);
    setIsUserModalOpen(false); // Fechar o modal após salvar
  };

  return (
    <>
      <nav className={styles.navbar} style={{ backgroundColor: '#084cf4' }}>
        <div className={styles.navbarLogo}>
          <Link to="/home" className={`${styles.navbarButton} ${location.pathname === '/home' ? styles.active : ''}`}>Início</Link>
          <Link to="/relatorio-semanal" className={`${styles.navbarButton} ${location.pathname === '/relatorio-semanal' ? styles.active : ''}`}>Relatório Semanal</Link>
          <Link to="/gerenciar-eventos" className={`${styles.navbarButton} ${location.pathname === '/gerenciar-eventos' ? styles.active : ''}`}>Gerenciar Eventos</Link>
        </div>
        <div className={styles.navbarUser}>
          <button onClick={toggleUserModal} className={styles.userButton}>
            {currentUser.name}
          </button>
          {/* O conteúdo do dropdown foi removido para dar lugar ao modal */}
        </div>
      </nav>
      {isUserModalOpen && <UsuarioModal user={currentUser} onClose={toggleUserModal} onSave={handleUserUpdate} />}
    </>
  );
};

export default Navbar;