// c:/Users/User/Desktop/Facul/calendario_ginasio/client/src/components/EventosGridSemanal/EventosGridSemanal.tsx
import React from 'react';
import type { Evento, DiaDaSemana } from '../../types/evento';
import { CardEvento } from '../CardEvento/CardEvento'; // Alterado para importação nomeada
import styles from './GridEventosSemanal.module.css';

interface EventosGridSemanalProps {
  eventos: Evento[];
  semana: Date[]; // Array de 7 Date objects, de segunda a domingo para a semana atual
}

const DIAS_DA_SEMANA_ORDEM: DiaDaSemana[] = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];
const DIAS_DA_SEMANA_DISPLAY_MAP: Record<DiaDaSemana, string> = {
  segunda: 'SEGUNDA',
  terca: 'TERÇA',
  quarta: 'QUARTA',
  quinta: 'QUINTA',
  sexta: 'SEXTA',
  sabado: 'SÁBADO',
  domingo: 'DOMINGO',
};

// Helper para converter "HH:MM" para minutos desde o início do dia
const timeToMinutes = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

// Helper para gerar slots de tempo (ex: 07:00, 07:30, ..., 22:30)
const generateTimeSlots = (startHour: number, endHour: number, intervalMinutes: number): string[] => {
  const slots: string[] = [];
  for (let h = startHour; h < endHour; h++) {
    for (let m = 0; m < 60; m += intervalMinutes) {
      slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
    }
  }
  // Adiciona o último slot se for exatamente endHour:00
  if (endHour * 60 % intervalMinutes === 0 && !slots.includes(`${endHour.toString().padStart(2, '0')}:00`)) {
     // slots.push(`${endHour.toString().padStart(2, '0')}:00`); // Decide if you need up to 23:00 or 22:30
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots(7, 23, 30); // De 07:00 até 22:30

const formatDateHeader = (date: Date): string => {
  return date.getDate().toString().padStart(2, '0');
};

const getPeriodoDoDia = (timeSlot: string): string => {
  const hour = parseInt(timeSlot.split(':')[0], 10);
  if (hour < 12) return 'MANHÃ';
  if (hour < 18) return 'TARDE';
  return 'NOITE';
};

const getBlocoHorario = (timeSlot: string): string | null => {
  const slotTime = timeToMinutes(timeSlot);
  // MANHÃ
  if (slotTime >= timeToMinutes("07:30") && slotTime < timeToMinutes("09:00")) return "AB";
  if (slotTime >= timeToMinutes("09:00") && slotTime < timeToMinutes("11:00")) return "CD";
  if (slotTime >= timeToMinutes("11:00") && slotTime < timeToMinutes("12:00")) return "EF";
  // TARDE (exemplo)
  if (slotTime >= timeToMinutes("13:30") && slotTime < timeToMinutes("15:00")) return "GH";
  if (slotTime >= timeToMinutes("15:00") && slotTime < timeToMinutes("17:00")) return "IJ";
  // NOITE (exemplo)
  if (slotTime >= timeToMinutes("18:30") && slotTime < timeToMinutes("20:00")) return "KL";
  return null;
};

type RowItem = 
  | { type: 'periodo'; label: string; key: string }
  | { type: 'bloco'; label: string; key: string }
  | { type: 'slot'; time: string; key: string };

const EventosGridSemanal: React.FC<EventosGridSemanalProps> = ({ eventos, semana }) => {
  if (semana.length !== 7) {
    console.error("A propriedade 'semana' deve conter exatamente 7 objetos Date.");
    return <div className={styles.errorLoading}>Erro ao carregar calendário: dados da semana inválidos.</div>;
  }

  const getEventosParaSlot = (dia: DiaDaSemana, timeSlot: string): Evento[] => {
    return eventos.filter(evento => {
      if (!evento.diasDaSemana.includes(dia)) {
        return false;
      }
      const slotStartTimeMinutes = timeToMinutes(timeSlot);
      const slotEndTimeMinutes = slotStartTimeMinutes + 30; // Assumindo slots de 30 min

      const eventStartTimeMinutes = timeToMinutes(evento.horaInicio);
      const eventEndTimeMinutes = timeToMinutes(evento.horaFim);

      // Evento sobrepõe o slot se:
      // (início do evento < fim do slot) E (fim do evento > início do slot)
      return eventStartTimeMinutes < slotEndTimeMinutes && eventEndTimeMinutes > slotStartTimeMinutes;
    });
  };
  
  const gridRows: RowItem[] = [];
  let lastEmittedPeriodo: string | null = null;
  let lastEmittedBloco: string | null = null;

  TIME_SLOTS.forEach((slot, index) => {
    const currentPeriodo = getPeriodoDoDia(slot);
    const currentBloco = getBlocoHorario(slot);

    if (currentPeriodo && currentPeriodo !== lastEmittedPeriodo) {
      gridRows.push({ type: 'periodo', label: currentPeriodo, key: `periodo-${currentPeriodo}-${index}` });
      lastEmittedPeriodo = currentPeriodo;
      lastEmittedBloco = null; // Reseta o bloco ao mudar o período
    }

    if (currentBloco && currentBloco !== lastEmittedBloco && currentPeriodo === lastEmittedPeriodo) {
      gridRows.push({ type: 'bloco', label: currentBloco, key: `bloco-${currentBloco}-${index}` });
      lastEmittedBloco = currentBloco;
    }
    
    gridRows.push({ type: 'slot', time: slot, key: `slot-${slot}-${index}` });
  });

  return (
    <div className={styles.gridContainer}>
      {/* Cabeçalho Fixo */}
      <div className={`${styles.headerCell} ${styles.stickyHeaderCol}`}>HORÁRIO</div>
      {DIAS_DA_SEMANA_ORDEM.map((dia, index) => (
        <div key={dia} className={`${styles.headerCell} ${styles.stickyHeaderRow}`}>
          {DIAS_DA_SEMANA_DISPLAY_MAP[dia]} {formatDateHeader(semana[index])}
        </div>
      ))}

      {/* Linhas da Grade (Períodos, Blocos, Slots de Tempo) */}
      {gridRows.map((rowItem) => {
        if (rowItem.type === 'periodo') {
          return (
            <div key={rowItem.key} className={`${styles.periodoHeaderCell} ${styles.fullRow}`}>
              {rowItem.label}
            </div>
          );
        }
        if (rowItem.type === 'bloco') {
          return (
            <div key={rowItem.key} className={`${styles.blocoHeaderCell} ${styles.fullRow}`}>
              {rowItem.label}
            </div>
          );
        }
        if (rowItem.type === 'slot') {
          return (
            <React.Fragment key={rowItem.key}>
              <div className={`${styles.timeSlotCell} ${styles.stickyHeaderCol}`}>{rowItem.time}</div>
              {DIAS_DA_SEMANA_ORDEM.map((diaNome) => {
                const eventosNoSlot = getEventosParaSlot(diaNome, rowItem.time!);
                return (
                  <div key={`${diaNome}-${rowItem.time}`} className={styles.gridCell}>
                    {eventosNoSlot.map(evento => (
                      <CardEvento key={evento.id} evento={evento} />
                    ))}
                  </div>
                );
              })}
            </React.Fragment>
          );
        }
        return null;
      })}
    </div>
  );
};

export default EventosGridSemanal;
