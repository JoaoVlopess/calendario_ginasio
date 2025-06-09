// import styles from './CalendarioPage.module.css';
import React, { useState, useEffect } from 'react';
import GridEventosSemanal from "../../components/GridEventosSemanal/GridEventosSemanal";
import type { Evento } from '../../types/evento'; // Importe o tipo Evento
import Navbar from "../../components/Navbar/Navbar";
import { EditarEventoModal } from '../../components/EditarEvento/EditarEvento'; // 1. Importar o modal

function getMondayOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getSemana(date: Date): Date[] {
  const segunda = getMondayOfWeek(date);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(segunda);
    d.setDate(segunda.getDate() + i);
    return d;
  });
}

// Eventos por semana: { [mondayDateString]: Evento[] }
const eventosMockPorSemana: Record<string, Evento[]> = {
  [getMondayOfWeek(new Date()).toISOString().slice(0, 10)]: [
    { id: '1', titulo: 'Futsal Treino', diasDaSemana: ['segunda', 'quarta'], horaInicio: '07:30', horaFim: '08:30', responsavel: 'Prof. Silva', dataCriacao: new Date().toISOString(), descricao: 'Treino de futsal masculino', local: 'Quadra A', cor: '#81c784' },
    { id: '2', titulo: 'Vôlei Comp.', diasDaSemana: ['segunda'], horaInicio: '08:00', horaFim: '09:00', responsavel: 'Prof. Ana', dataCriacao: new Date().toISOString(), descricao: 'Competição de vôlei', local: 'Ginásio', cor: '#ffb74d' },
    { id: '3', titulo: 'Basquete Livre', diasDaSemana: ['terca'], horaInicio: '08:30', horaFim: '09:30', responsavel: null, dataCriacao: new Date().toISOString(), descricao: 'Jogo livre de basquete', local: 'Quadra B', cor: '#64b5f6' },
  ]
};

export const CalendarioPage = () => {
  const [dataBase, setDataBase] = useState<Date>(getMondayOfWeek(new Date()));
  const [eventosPorSemana, setEventosPorSemana] = useState<Record<string, Evento[]>>(eventosMockPorSemana);
  const [semanaAtual, setSemanaAtual] = useState<Date[]>(getSemana(new Date()));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventoSelecionado, setEventoSelecionado] = useState<Evento | null>(null);

  // Atualiza semana ao mudar dataBase
  useEffect(() => {
    setSemanaAtual(getSemana(dataBase));
  }, [dataBase]);

  // Eventos da semana selecionada
  const eventos = eventosPorSemana[getMondayOfWeek(dataBase).toISOString().slice(0, 10)] || [];

  // Modal handlers
  const handleAbrirModal = (evento: Evento) => {
    setEventoSelecionado(evento);
    setIsModalOpen(true);
  };
  const handleFecharModal = () => {
    setIsModalOpen(false);
    setEventoSelecionado(null);
  };
  const handleSalvarEvento = (eventoAtualizado: Evento) => {
    const key = getMondayOfWeek(dataBase).toISOString().slice(0, 10);
    setEventosPorSemana(prev => ({
      ...prev,
      [key]: prev[key].map(ev => (ev.id === eventoAtualizado.id ? eventoAtualizado : ev))
    }));
    handleFecharModal();
  };
  const handleDeletarEvento = (eventoId: string) => {
    const key = getMondayOfWeek(dataBase).toISOString().slice(0, 10);
    setEventosPorSemana(prev => ({
      ...prev,
      [key]: prev[key].filter(ev => ev.id !== eventoId)
    }));
    handleFecharModal();
  };

  // Navegação de semana
  const handleSemanaAnterior = () => {
    const prev = new Date(dataBase);
    prev.setDate(prev.getDate() - 7);
    setDataBase(prev);
  };
  const handleProximaSemana = () => {
    const next = new Date(dataBase);
    next.setDate(next.getDate() + 7);
    setDataBase(next);
  };
  const handleEscolherSemana = (e: React.ChangeEvent<HTMLInputElement>) => {
    const data = new Date(e.target.value);
    setDataBase(getMondayOfWeek(data));
  };

  return (
    <div className=""> {/* Considere usar styles.container se tiver CSS Modules */}
      <Navbar />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, margin: '24px 0' }}>
        <button onClick={handleSemanaAnterior} style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#084cf4', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Semana Anterior</button>
        <input type="date" value={dataBase.toISOString().slice(0, 10)} onChange={handleEscolherSemana} style={{ padding: '8px', borderRadius: 6, border: '1px solid #ccc' }} />
        <button onClick={handleProximaSemana} style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#084cf4', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Próxima Semana</button>
      </div>
      <GridEventosSemanal
        eventos={eventos}
        semana={semanaAtual}
        onAbrirModalEditar={handleAbrirModal} // 4. Passar a função para abrir o modal
      />
      {/* 5. Renderizar o EditarEventoModal condicionalmente */}
      {isModalOpen && eventoSelecionado && (
        <EditarEventoModal
          evento={eventoSelecionado}
          isOpen={isModalOpen}
          onClose={handleFecharModal}
          onSave={handleSalvarEvento}
          onDelete={handleDeletarEvento}
        />
      )}
    </div>
  );
};