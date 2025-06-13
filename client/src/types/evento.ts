// c:/Users/User/Desktop/Facul/calendario_ginasio/client/src/types/evento.ts
export type DiaDaSemana = 'segunda' | 'terca' | 'quarta' | 'quinta' | 'sexta' | 'sabado' | 'domingo';

export type RecorrenciaTipo = 'nenhuma' | 'mensal' | 'semestral';

export interface Evento {
  id: string; // Identificador único para o evento
  titulo: string;
  descricao?: string | null; // Tornando opcional para consistência
  dataEvento: string; // Novo campo: "YYYY-MM-DD"
  diasDaSemana: DiaDaSemana[]; // Ainda pode ser útil para a lógica do frontend ou se o backend derivar/usar
  horaInicio: string; // Formato "HH:MM", ex: "07:30"
  horaFim: string;    // Formato "HH:MM", ex: "08:30"
  recorrencia?: RecorrenciaTipo;
  // duracaoRecorrencia?: Date; // Pode ser uma data de término ou número de ocorrências
  responsavel: string | null;
  dataCriacao: string; // ISO Date string ou Date object
  local?: string; // Opcional: local do evento
  cor?: string;   // Opcional: cor para o card do evento
}
