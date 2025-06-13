import React, { useState, useEffect } from 'react';
import styles from './UsuarioModal.module.css';
import type { User } from '../../types/user';


interface UserModalProps {
  user: User;
  onClose: () => void;
    onSave: (updatedUser: User) => void;
}

const UsuarioModal: React.FC<UserModalProps> = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState<User>({ ...user });
  const [showPassword, setShowPassword] = useState(false);
  // Atualiza o formData se o prop 'user' mudar externamente enquanto o modal está aberto
  useEffect(() => {
    setFormData({ ...user });
  }, [user]);

  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = () => {
    onSave(formData);
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={handleContentClick}>
        <button className={styles.closeButton} onClick={onClose} aria-label="Fechar modal">
          &times;
        </button>
        <h2>Detalhes do Usuário</h2>
        <div className={styles.formGroup}>
          <label htmlFor="name">Nome:</label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" name="email" value={formData.email || ''} onChange={handleChange} />
        </div>
        {/* 
          A edição de senha geralmente requer uma lógica mais complexa 
          (senha atual, nova senha, confirmação).
          Para simplificar, estamos permitindo a edição direta, mas isso não é recomendado para produção.
        */}
        <div className={styles.formGroup}>
          <label htmlFor="senha">Senha:</label>          
          <div className={styles.passwordInputContainer}>
            <input 
              type={showPassword ? "text" : "password"} 
              id="senha" name="senha" value={formData.senha || ''} 
              onChange={handleChange} placeholder="Nova senha (opcional)" />
            <button type="button" onClick={toggleShowPassword} className={styles.togglePasswordButton}>
              {showPassword ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
        </div>
        {/* Adicione mais campos editáveis aqui conforme necessário */}
        <button onClick={handleSaveChanges} className={styles.saveButton}>
          Salvar Alterações
        </button>
      </div>
    </div>
  );
};

export default UsuarioModal;