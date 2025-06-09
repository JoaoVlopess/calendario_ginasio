import React from 'react';
import { Link } from 'react-router';
import styles from './Navbar.module.css';

const RelatorioButton: React.FC = () => {
  return (
    <Link to="/relatorio-semanal" className={styles.relatorioButton} tabIndex={0}>
      Relatório Semanal
    </Link>
  );
};

export default RelatorioButton; 