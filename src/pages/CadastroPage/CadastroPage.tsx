// CadastroPage.tsx
import styles from "./CadastroPage.module.css";
import { CadastroHeader } from "../../components/CadastroHeader/CadastroHeader";
import { CadastroForm } from "../../components/CadastroForm/CadastroForm";

export function CadastroPage() {
  return (
    <div className={styles.container}>
      <CadastroHeader />
      <CadastroForm />
    </div>
  );
}