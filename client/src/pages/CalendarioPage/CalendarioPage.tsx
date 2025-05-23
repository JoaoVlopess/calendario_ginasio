// import styles from './CalendarioPage.module.css';
import React, { useState, useEffect } from 'react';
import GridEventosSemanal from "../../components/GridEventosSemanal/GridEventosSemanal";
import type { Evento } from '../../types/evento'; // Importe o tipo Evento

// Função para gerar as datas da semana atual (exemplo simples)
const getSemanaAtual = (): Date[] => {
  const hoje = new Date();
  const diaDaSemana = hoje.getDay(); // 0 (Dom) - 6 (Sab)
  // Ajusta para que a semana comece na segunda-feira
  const diffSegunda = hoje.getDate() - diaDaSemana + (diaDaSemana === 0 ? -6 : 1);
  const segunda = new Date(hoje.setDate(diffSegunda));

  const semana: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const dia = new Date(segunda);
    dia.setDate(segunda.getDate() + i);
    semana.push(dia);
  }
  return semana;
};

export const CalendarioPage = () => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [semanaAtual, setSemanaAtual] = useState<Date[]>(getSemanaAtual());

  useEffect(() => {
    // Aqui você buscaria seus eventos de uma API ou fonte de dados
    // Por enquanto, vamos usar dados mock:
    const eventosMock: Evento[] = [
      { id: '1', nome: 'Futsal Treino', diasDaSemana: ['segunda', 'quarta'], horaInicio: '07:30', horaFim: '08:30', responsavel: 'Prof. Silva', dataCriacao: new Date().toISOString(), descricao: 'Treino de futsal masculino', local: 'Quadra A', cor: '#81c784' },
      { id: '2', nome: 'Vôlei Comp.', diasDaSemana: ['segunda'], horaInicio: '08:00', horaFim: '09:00', responsavel: 'Prof. Ana', dataCriacao: new Date().toISOString(), descricao: 'Competição de vôlei', local: 'Ginásio', cor: '#ffb74d' },
      { id: '3', nome: 'Basquete Livre', diasDaSemana: ['terca'], horaInicio: '08:30', horaFim: '09:30', responsavel: null, dataCriacao: new Date().toISOString(), descricao: 'Jogo livre de basquete', local: 'Quadra B', cor: '#64b5f6' },
    ];
    setEventos(eventosMock);
  }, []); // O array vazio como segundo argumento faz o useEffect rodar apenas uma vez, após a montagem inicial

  return (
    <div className="">
      <GridEventosSemanal eventos={eventos} semana={semanaAtual} />
    </div>
  );
};