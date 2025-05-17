// components/LoginForm.tsx
import styles from "./LoginForm.module.css";
import { Link } from "react-router";

export const LoginForm = () => {
  return (
    <form className={styles.login_area_input}>
      <input type="email" placeholder="Seu email" />
      <input type="password" placeholder="********" />
      <button className={styles.signin_button}>
        <Link to="/home">Entrar</Link>
      </button>
    </form>
  );
};
