// c:/Users/User/Desktop/Facul/calendario_ginasio/client/src/components/EventosGridSemanal/EventosGridSemanal.tsx
import React from 'react';
import type { Evento, DiaDaSemana } from '../../types/evento';
import { CardEvento } from '../CardEvento/CardEvento';
import styles from './GridEventosSemanal.module.css';

interface EventosGridSemanalProps {
  eventos: Evento[];
  semana: Date[]; // Array de 7 Date objects, de segunda a domingo para a semana atual
  onAbrirModalEditar: (evento: Evento) => void;
  onSlotVazioClick?: (data: Date, hora: string) => void; // Nova prop para cliques em slots vazios
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

const formatDateHeader = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // getMonth() é 0-indexado
  return `${day}/${month}`;
};

// Interface for the sub-slots within each Bloco
interface SubSlot {
  label: string; // e.g., "07:30 - 08:20"
  startMinutes: number;
  endMinutes: number;
}

// Define block structures with their intended period and time ranges
type BlocoConfig = {
  label: string;
  intendedPeriodo: 'MANHÃ' | 'TARDE' | 'NOITE';
  subSlots: SubSlot[];
}

const ALL_BLOCO_CONFIGS: BlocoConfig[] = [
  // MANHÃ
  {
    label: "AB", intendedPeriodo: "MANHÃ", subSlots: [
      { label: "07:30", startMinutes: timeToMinutes("07:30"), endMinutes: timeToMinutes("08:20") },
      { label: "08:20", startMinutes: timeToMinutes("08:20"), endMinutes: timeToMinutes("09:10") },
    ]
  },
  {
    label: "CD", intendedPeriodo: "MANHÃ", subSlots: [
      { label: "09:30", startMinutes: timeToMinutes("09:30"), endMinutes: timeToMinutes("10:20") },
      { label: "10:20", startMinutes: timeToMinutes("10:20"), endMinutes: timeToMinutes("11:10") },
    ]
  },
  {
    label: "EF", intendedPeriodo: "MANHÃ", subSlots: [
      { label: "11:20", startMinutes: timeToMinutes("11:20"), endMinutes: timeToMinutes("12:10") },
      { label: "12:10", startMinutes: timeToMinutes("12:10"), endMinutes: timeToMinutes("13:00") },
    ]
  },
  // TARDE
  {
    label: "AB", intendedPeriodo: "TARDE", subSlots: [
      { label: "13:30", startMinutes: timeToMinutes("13:30"), endMinutes: timeToMinutes("14:20") },
      { label: "14:20", startMinutes: timeToMinutes("14:20"), endMinutes: timeToMinutes("15:10") },
    ]
  },
  {
    label: "CD", intendedPeriodo: "TARDE", subSlots: [
      { label: "15:30", startMinutes: timeToMinutes("15:30"), endMinutes: timeToMinutes("16:20") },
      { label: "16:20", startMinutes: timeToMinutes("16:20"), endMinutes: timeToMinutes("17:10") },
    ]
  },
  {
    label: "EF", intendedPeriodo: "TARDE", subSlots: [
      { label: "17:20", startMinutes: timeToMinutes("17:20"), endMinutes: timeToMinutes("18:10") },
      { label: "18:10", startMinutes: timeToMinutes("18:10"), endMinutes: timeToMinutes("19:00") },
    ]
  },
  // NOITE
  {
    label: "AB", intendedPeriodo: "NOITE", subSlots: [
      { label: "19:00", startMinutes: timeToMinutes("19:00"), endMinutes: timeToMinutes("19:50") },
      { label: "19:50", startMinutes: timeToMinutes("19:50"), endMinutes: timeToMinutes("20:40") },
    ]
  },
  {
    label: "CD", intendedPeriodo: "NOITE", subSlots: [
      { label: "21:00", startMinutes: timeToMinutes("21:00"), endMinutes: timeToMinutes("21:50") },
      { label: "21:50", startMinutes: timeToMinutes("21:50"), endMinutes: timeToMinutes("22:40") },
    ]
  },
];

type RowItem =
  | { type: 'periodo'; label: string; key: string }
  | { type: 'bloco'; label: string; key: string }
  | { type: 'slot'; subSlot: SubSlot; key: string };

const EventosGridSemanal: React.FC<EventosGridSemanalProps> = ({
  eventos,
  semana,
  onAbrirModalEditar,
  onSlotVazioClick, // Recebendo a nova prop
}) => {
  if (semana.length !== 7) {
    console.error("A propriedade 'semana' deve conter exatamente 7 objetos Date.");
    return <div className={styles.errorLoading}>Erro ao carregar calendário: dados da semana inválidos.</div>;
  }

  // diaDaSemanaNoGrid: 'segunda', 'terca', etc. (nome do dia da coluna)
  // dataDaColuna: objeto Date para o dia específico da coluna
  const getEventosParaSubSlot = (diaDaSemanaNoGrid: DiaDaSemana, dataDaColuna: Date, subSlot: SubSlot): Evento[] => {
    return eventos.filter(evento => {
      // Compara a data do evento ("YYYY-MM-DD") com a data da coluna do grid
      const dataEventoFormatada = evento.dataEvento; // Já está como "YYYY-MM-DD"
      const dataColunaFormatada = dataDaColuna.toISOString().split('T')[0];

      if (dataEventoFormatada !== dataColunaFormatada) {
        return false;
      }
      const slotStartTimeMinutes = subSlot.startMinutes;
      const slotEndTimeMinutes = subSlot.endMinutes;
      const eventStartTimeMinutes = timeToMinutes(evento.horaInicio);
      const eventEndTimeMinutes = timeToMinutes(evento.horaFim);

      return eventStartTimeMinutes < slotEndTimeMinutes && eventEndTimeMinutes > slotStartTimeMinutes;
    });
  };

  const gridRows: RowItem[] = [];
  let lastEmittedPeriodo: string | null = null;

  ALL_BLOCO_CONFIGS.forEach((bloco, blocoIndex) => {
    if (bloco.intendedPeriodo !== lastEmittedPeriodo) {
      gridRows.push({
        type: 'periodo',
        label: bloco.intendedPeriodo,
        key: `periodo-${bloco.intendedPeriodo}-${blocoIndex}`
      });
      lastEmittedPeriodo = bloco.intendedPeriodo;
    }
    gridRows.push({ type: 'bloco', label: bloco.label, key: `bloco-${bloco.label}-${bloco.intendedPeriodo}-${blocoIndex}` });
    bloco.subSlots.forEach((subSlot, subSlotIndex) => {
      gridRows.push({
        type: 'slot', subSlot: subSlot, key: `slot-${bloco.label}-${bloco.intendedPeriodo}-${blocoIndex}-${subSlotIndex}`
      });
    });
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
            <div key={rowItem.key} className={`${styles.periodoHeaderCell} ${styles.fullRow}`} style={{ gridColumn: '1 / -1' }}>
              {rowItem.label}
            </div>
          );
        }
        if (rowItem.type === 'bloco') {
          return (
            <div key={rowItem.key} className={`${styles.blocoHeaderCell} ${styles.fullRow}`} style={{ gridColumn: '1 / -1' }}>
              {rowItem.label}
            </div>
          );
        }
        if (rowItem.type === 'slot') {
          return (
            <React.Fragment key={rowItem.key}>
              {/* Primeira coluna: horário */}
              <div className={`${styles.timeSlotCell} ${styles.stickyHeaderCol}`}>{rowItem.subSlot.label}</div>
              {/* Próximas colunas: eventos */}
              {DIAS_DA_SEMANA_ORDEM.map((diaNome, diaIndex) => { // Adicionado diaIndex para acessar a data correta da semana
                const dataDaCelula = semana[diaIndex]; // Data correspondente à coluna do dia
                const eventosNoSlot = getEventosParaSubSlot(diaNome, dataDaCelula, rowItem.subSlot);
                const horaDaCelula = rowItem.subSlot.label; // Hora do slot (ex: "07:30")
                return (
                  <div
                    key={`${diaNome}-${horaDaCelula}`}
                    className={styles.gridCell}
                    onClick={() => {
                      // Se não há eventos neste slot e a função onSlotVazioClick foi passada, chama ela
                      if (eventosNoSlot.length === 0 && onSlotVazioClick) {
                        onSlotVazioClick(dataDaCelula, horaDaCelula);
                      }
                    }}
                  >
                    {eventosNoSlot.length > 0 ? (
                      eventosNoSlot.map(evento => (
                        // Envolve CardEvento em uma div para aplicar stopPropagation
                        // e passa uma função compatível para o onClick do CardEvento.
                        <div key={evento.id} onClick={(e) => e.stopPropagation()}>
                          <CardEvento
                            evento={evento}
                            onClick={() => onAbrirModalEditar(evento)}
                          />
                        </div>
                      ))
                    ) : (
                      <div className={styles.emptySlotArea}></div> // Área vazia, pode ser estilizada para feedback visual
                    )}
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