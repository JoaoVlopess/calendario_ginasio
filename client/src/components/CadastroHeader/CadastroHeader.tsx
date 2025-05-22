// CadastroHeader.tsx
import styles from "./CadastroHeader.module.css";

export const CadastroHeader = () => {
  return (
    <div className={styles.header}>
      <p className={styles.name}>FAST CALENDAR</p>
      <p className={styles.name_area}>Área De Cadastro</p>
    </div>
  );
};