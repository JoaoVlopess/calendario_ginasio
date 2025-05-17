// components/LoginHeader.tsx
import { Link } from "react-router";
import styles from "./LoginHeader.module.css";

export const LoginHeader = () => {
  return (
    <div className={styles.login_area}>
      <p className={styles.name}>FAST CALENDÁRIO</p>
      <div className={styles.login_area_cadastro}>
        <p>Chegando pela primeira vez?</p>
        <Link to="/cadastro">Cadastre-se!</Link>
      </div>
    </div>
  );
};