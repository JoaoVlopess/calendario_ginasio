// components/LoginHeader.tsx

import styles from "./LoginHeader.module.css";

export const LoginHeader = () => {
  return (
    <div className={styles.login_area}>
      <p className={styles.name}>FAST CALENDAR</p>
      <div className={styles.login_area_cadastro}>
        <p>Acesso ao Fast Calendar</p>
      </div>
    </div>
  );
};