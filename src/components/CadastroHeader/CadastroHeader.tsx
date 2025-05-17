// CadastroHeader.tsx
import styles from "./CadastroHeader.module.css";
import { Link } from "react-router";

export const CadastroHeader = () => {
  return (
    <div className={styles.header}>
      <p className={styles.name}>FAST CALENDÁRIO</p>
      <h1>Crie sua conta</h1>
      <p>
        Já tem uma conta? <Link to="/">Entrar</Link>
      </p>
    </div>
  );
};