import { useState } from "react";
import styles from "./LoginForm.module.css";
import { Link, useNavigate } from "react-router";

export const LoginForm = () => {
   const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!email || !senha) {
      setError("Por favor, preencha o email e a senha.");
      return;
    }

    // Com HTTP Basic Auth, o "login" no frontend consiste em armazenar
    // as credenciais para uso em requisições futuras.
    // ATENÇÃO: Armazenar a senha em localStorage é um risco de segurança.
    // Isso é feito aqui para seguir o padrão HTTP Basic Auth, onde o cliente
    // precisa reenviar as credenciais em cada requisição protegida.
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userPassword', senha); // CUIDADO COM ISSO EM PRODUÇÃO

    // Limpar campos (opcional)
    // setEmail('');
    // setSenha('');

    // Navegar para a página principal (ex: /home)
    // A ProtectedRoute cuidará de verificar se as credenciais estão no localStorage.
    navigate('/home');
  };
  return (
<form className={styles.login_area_input} onSubmit={handleSubmit}>
      {error && <p className={styles.errorMessage}>{error}</p>} {/* Para exibir mensagens de erro */}      <div className={styles.input_group}>
        <label className={styles.label} htmlFor="email"><strong>Email</strong></label>
        <input id="email" type="email" placeholder="Seu email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>

      <div className={styles.input_group}>
        <label className={styles.label} htmlFor="password"><strong>Senha</strong></label>
        <input id="password" type="password" placeholder="********" value={senha} onChange={(e) => setSenha(e.target.value)} required />
      </div>

      <button type="submit" className={styles.signin_button}>
        Entrar
      </button>
    </form>
  );
};