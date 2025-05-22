import styles from "./CadastroPage.module.css";
import { CadastroHeader } from "../../components/CadastroHeader/CadastroHeader";
import { CadastroForm } from "../../components/CadastroForm/CadastroForm";
import { Link } from "react-router";

export function CadastroPage() {
  return (
    <div className={styles.container}>
      <div className={styles.cadastro_area}>
        <div className={styles.cadastro_form_area}>
          <CadastroHeader />
          <CadastroForm />
          <div className={styles.footer}>
          <div className={styles.line}></div>
          <div className={styles.cadastro_texto}>
            <p>Já possui uma conta?</p> 
            <Link to="/">Entrar</Link>
          </div>
          </div>
        </div>
        <div className={styles.cadastro_img_area}>
          <img src="/img/MulherMapeandoOCalendario.png" alt="Ilustração de calendário" />
        </div>

      </div>
    </div>
  );
}