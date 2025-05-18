import styles from "./LoginForm.module.css";
import { Link } from "react-router";

export const LoginForm = () => {
  return (
    <form className={styles.login_area_input}>
      <div className={styles.input_group}>
        <label className={styles.label} htmlFor="email"><strong>Email</strong></label>
        <input id="email" type="email" placeholder="Seu email" />
      </div>

      <div className={styles.input_group}>
        <label className={styles.label} htmlFor="password"><strong>Senha</strong></label>
        <input id="password" type="password" placeholder="********" />
      </div>

      <button className={styles.signin_button}>
        <Link to="/home">Entrar</Link>
      </button>
    </form>
  );
};