// src/config/horariosConfig.ts
import type { DiaDaSemana } from '../types/evento'; // Ajuste o caminho se necessário

// Helper para converter "HH:MM" para minutos desde o início do dia
export const timeToMinutes = (timeStr: string): number => {
  if (!timeStr || !timeStr.includes(':')) return 0; // Fallback
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

// Helper para converter minutos para "HH:MM"
export const minutesToTime = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

export interface SubSlot {
  label: string; // e.g., "07:30" (representa o início do slot)
  startMinutes: number;
  endMinutes: number;
}

export type BlocoConfig = {
  label: string; // AB, CD, EF
  intendedPeriodo: 'MANHÃ' | 'TARDE' | 'NOITE';
  subSlots: SubSlot[];
}

export const ALL_BLOCO_CONFIGS: BlocoConfig[] = [
  // MANHÃ
  { label: "AB", intendedPeriodo: "MANHÃ", subSlots: [
    { label: "07:30", startMinutes: timeToMinutes("07:30"), endMinutes: timeToMinutes("08:20") },
    { label: "08:20", startMinutes: timeToMinutes("08:20"), endMinutes: timeToMinutes("09:10") },
  ]},
  { label: "CD", intendedPeriodo: "MANHÃ", subSlots: [
    { label: "09:30", startMinutes: timeToMinutes("09:30"), endMinutes: timeToMinutes("10:20") },
    { label: "10:20", startMinutes: timeToMinutes("10:20"), endMinutes: timeToMinutes("11:10") },
  ]},
  { label: "EF", intendedPeriodo: "MANHÃ", subSlots: [
    { label: "11:20", startMinutes: timeToMinutes("11:20"), endMinutes: timeToMinutes("12:10") },
    { label: "12:10", startMinutes: timeToMinutes("12:10"), endMinutes: timeToMinutes("13:00") },
  ]},
  // TARDE
  { label: "AB", intendedPeriodo: "TARDE", subSlots: [
    { label: "13:30", startMinutes: timeToMinutes("13:30"), endMinutes: timeToMinutes("14:20") },
    { label: "14:20", startMinutes: timeToMinutes("14:20"), endMinutes: timeToMinutes("15:10") },
  ]},
  { label: "CD", intendedPeriodo: "TARDE", subSlots: [
    { label: "15:30", startMinutes: timeToMinutes("15:30"), endMinutes: timeToMinutes("16:20") },
    { label: "16:20", startMinutes: timeToMinutes("16:20"), endMinutes: timeToMinutes("17:10") },
  ]},
  { label: "EF", intendedPeriodo: "TARDE", subSlots: [
    { label: "17:20", startMinutes: timeToMinutes("17:20"), endMinutes: timeToMinutes("18:10") },
    { label: "18:10", startMinutes: timeToMinutes("18:10"), endMinutes: timeToMinutes("19:00") },
  ]},
  // NOITE
  { label: "AB", intendedPeriodo: "NOITE", subSlots: [
    { label: "19:00", startMinutes: timeToMinutes("19:00"), endMinutes: timeToMinutes("19:50") },
    { label: "19:50", startMinutes: timeToMinutes("19:50"), endMinutes: timeToMinutes("20:40") },
  ]},
  { label: "CD", intendedPeriodo: "NOITE", subSlots: [
    { label: "21:00", startMinutes: timeToMinutes("21:00"), endMinutes: timeToMinutes("21:50") },
    { label: "21:50", startMinutes: timeToMinutes("21:50"), endMinutes: timeToMinutes("22:40") },
  ]},
];

export interface BlocoSelecionavel {
  value: string; // Ex: "MANHA_AB"
  labelDisplay: string; // Ex: "AB - Manhã (07:30 - 09:10)"
  horaInicio: string; // Ex: "07:30"
  horaFim: string;    // Ex: "09:10"
}

export const getBlocosSelecionaveis = (): BlocoSelecionavel[] => {
  const opcoes: BlocoSelecionavel[] = [];
  ALL_BLOCO_CONFIGS.forEach(bloco => {
    if (bloco.subSlots.length > 0) {
      const value = `${bloco.intendedPeriodo}_${bloco.label}`;
      const horaInicio = minutesToTime(bloco.subSlots[0].startMinutes);
      const horaFim = minutesToTime(bloco.subSlots[bloco.subSlots.length - 1].endMinutes);
      const labelDisplay = `${bloco.label} - ${bloco.intendedPeriodo.charAt(0) + bloco.intendedPeriodo.slice(1).toLowerCase()} (${horaInicio} - ${horaFim})`;
      
      opcoes.push({ value, labelDisplay, horaInicio, horaFim });
    }
  });
  // Ordenar por período e depois por hora de início do bloco
  return opcoes.sort((a, b) => {
    const periodoOrdem = { "MANHÃ": 1, "TARDE": 2, "NOITE": 3 };
    const periodoA = a.value.split('_')[0] as keyof typeof periodoOrdem;
    const periodoB = b.value.split('_')[0] as keyof typeof periodoOrdem;
    if (periodoOrdem[periodoA] !== periodoOrdem[periodoB]) return periodoOrdem[periodoA] - periodoOrdem[periodoB];
    return timeToMinutes(a.horaInicio) - timeToMinutes(b.horaInicio);
  });
};
