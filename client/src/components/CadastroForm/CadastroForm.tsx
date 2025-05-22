// CadastroForm.tsx
import styles from "./CadastroForm.module.css";

export const CadastroForm = () => {
  return (
    <form className={styles.form}>
      <input type="text" placeholder="Seu nome" />
      <input type="email" placeholder="Seu email" />
      <input type="password" placeholder="Senha" />
      <input type="number" placeholder="Idade" />
      <button type="submit">Cadastrar</button>
    </form>
  );
};