import styles from "./LoginPage.module.css";
import { LoginHeader } from "../../components/LoginHeader/LoginHeader";
import { LoginForm } from "../../components/LoginForm/LoginForm";

export const LoginPage = () => {
  return (
    <div className={styles.container}>
      <div className={styles.login_area}>
        <LoginHeader />
        <LoginForm />
      </div>
    </div>
  );
};