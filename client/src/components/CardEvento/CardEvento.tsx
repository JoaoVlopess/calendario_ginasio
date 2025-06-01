// src/components/CardEvento/CardEvento.tsx
import React from 'react';
import styles from './CardEvento.module.css';
import type { Evento } from '../../types/evento'; // Usando type-only import

type EventoCardProps = {
  evento: Evento;
  onClick: () => void; // <<< ADICIONADA A PROP onClick
}

export const CardEvento: React.FC<EventoCardProps> = ({ evento, onClick }) => { // <<< onClick RECEBIDO AQUI
  return (
    <div
      className={styles.eventoCard}
      style={{ backgroundColor: evento.cor || '#add8e6' }}
      title={evento.descricao || evento.titulo}
      onClick={onClick} // <<< onClick APLICADO AO DIV PRINCIPAL DO CARD
    >
      <h5 className={styles.eventoNome}>{evento.titulo}</h5>
      <p className={styles.eventoHorario}>{evento.horaInicio} - {evento.horaFim}</p>
      {evento.local && <p className={styles.eventoLocal}>{evento.local}</p>}
      <p className={styles.eventoResponsavel}>Responsável: {evento.responsavel || 'N/A'}</p>
    </div>
  );
};