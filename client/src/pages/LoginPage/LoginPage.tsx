import styles from "./LoginPage.module.css";
import { LoginHeader } from "../../components/LoginHeader/LoginHeader";
import { LoginForm } from "../../components/LoginForm/LoginForm";
import { Link } from "react-router";

export const LoginPage = () => {
  return (
    <div className={styles.container}>
      <div className={styles.login_area}>
        <div className={styles.login_img}>
          <img src="/img/MulherSegurandoCalendario.png" alt="Ilustração" />
        </div>
        <div className={styles.login_content}>
          <LoginHeader />
          <LoginForm />
          <div className={styles.footer}>
            <div className={styles.line}></div>
            <div className={styles.cadastro_mensage}>
              <p>Não tem uma conta?</p>
              <Link to="/cadastro">Cadastre-se!</Link>
            
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};