// src/pages/CalendarioPage/CalendarioPage.tsx
import React, { useState, useEffect } from 'react';
import GridEventosSemanal from "../../components/GridEventosSemanal/GridEventosSemanal";
import type { Evento } from '../../types/evento';
import Navbar from "../../components/Navbar/Navbar";
import { EditarEventoModal } from '../../components/EditarEvento/EditarEvento';
import { AdicionarEventoModal, type DadosNovoEvento } from '../../components/AdicionarEventoModal/AdicionarEventoModal'; // Importar o novo modal e tipo

// Funções auxiliares para manipulação de datas
function getMondayOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Ajuste para domingo ser o início da semana no getDay()
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

// Dados mockados de eventos (substitua pela sua lógica de fetch de dados)
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

  // Estados para o modal de Edição
  const [isEditarModalOpen, setIsEditarModalOpen] = useState(false);
  const [eventoSelecionado, setEventoSelecionado] = useState<Evento | null>(null);

  // Estados para o modal de Adição
  const [isAdicionarModalOpen, setIsAdicionarModalOpen] = useState(false);
  const [dataHoraPreenchimento, setDataHoraPreenchimento] = useState<{ data?: Date; hora?: string } | null>(null);

  // Atualiza a semana exibida quando dataBase muda
  useEffect(() => {
    setSemanaAtual(getSemana(dataBase));
  }, [dataBase]);

  // Filtra os eventos para a semana atual
  const eventosDaSemanaAtual = eventosPorSemana[getMondayOfWeek(dataBase).toISOString().slice(0, 10)] || [];

  // Handlers para o modal de Edição
  const handleAbrirEditarModal = (evento: Evento) => {
    setEventoSelecionado(evento);
    setIsEditarModalOpen(true);
  };

  const handleFecharEditarModal = () => {
    setIsEditarModalOpen(false);
    setEventoSelecionado(null);
  };

  const handleSalvarEventoEditado = (eventoAtualizado: Evento) => {
    const key = getMondayOfWeek(dataBase).toISOString().slice(0, 10);
    setEventosPorSemana(prev => ({
      ...prev,
      [key]: (prev[key] || []).map(ev => (ev.id === eventoAtualizado.id ? eventoAtualizado : ev))
    }));
    handleFecharEditarModal();
  };

  const handleDeletarEvento = (eventoId: string) => {
    const key = getMondayOfWeek(dataBase).toISOString().slice(0, 10);
    setEventosPorSemana(prev => ({
      ...prev,
      [key]: (prev[key] || []).filter(ev => ev.id !== eventoId)
    }));
    handleFecharEditarModal();
  };

  // Handlers para o modal de Adição
  const handleAbrirAdicionarModal = (data?: Date, hora?: string) => {
    setDataHoraPreenchimento(data || hora ? { data, hora } : null);
    setIsAdicionarModalOpen(true);
  };

  const handleFecharAdicionarModal = () => {
    setIsAdicionarModalOpen(false);
    setDataHoraPreenchimento(null);
  };

  const handleSalvarNovoEvento = (dadosNovoEvento: DadosNovoEvento) => {
    const key = getMondayOfWeek(dataBase).toISOString().slice(0, 10); // Adiciona à semana atual
    const novoEvento: Evento = {
      ...dadosNovoEvento,
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Gerar ID único (melhorar com UUID em produção)
      dataCriacao: new Date().toISOString(),
    };
    setEventosPorSemana(prev => ({
      ...prev,
      [key]: [...(prev[key] || []), novoEvento]
    }));
    handleFecharAdicionarModal();
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
    // Adiciona o fuso horário local para evitar problemas de um dia a menos
    const dataSelecionada = new Date(e.target.value + 'T00:00:00');
    setDataBase(getMondayOfWeek(dataSelecionada));
  };

  return (
    <div>
      <Navbar />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, margin: '24px 0' }}>
        <button onClick={handleSemanaAnterior} style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#084cf4', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Semana Anterior</button>
        <input
          type="date"
          value={dataBase.toISOString().slice(0, 10)}
          onChange={handleEscolherSemana}
          style={{ padding: '8px', borderRadius: 6, border: '1px solid #ccc', cursor: 'pointer' }}
        />
        <button onClick={handleProximaSemana} style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#084cf4', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Próxima Semana</button>
      </div>

      {/* Botão para abrir o modal de adicionar evento (substituir por clique no grid idealmente) */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
        <button
          onClick={() => handleAbrirAdicionarModal()} // Abre sem pré-preenchimento
          style={{ padding: '10px 20px', borderRadius: 6, border: 'none', background: '#4CAF50', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Adicionar Novo Evento
        </button>
      </div>

      <GridEventosSemanal
        eventos={eventosDaSemanaAtual}
        semana={semanaAtual}
        onAbrirModalEditar={handleAbrirEditarModal}
         // Certifique-se de que GridEventosSemanal.tsx tenha uma prop como onSlotVazioClick
        onSlotVazioClick={handleAbrirAdicionarModal}
      />

      {/* Modal de Edição de Evento */}
      {isEditarModalOpen && eventoSelecionado && (
        <EditarEventoModal
          evento={eventoSelecionado}
          isOpen={isEditarModalOpen}
          onClose={handleFecharEditarModal}
          onSave={handleSalvarEventoEditado}
          onDelete={handleDeletarEvento}
        />
      )}

      {/* Modal de Adição de Novo Evento */}
      {isAdicionarModalOpen && (
        <AdicionarEventoModal
          isOpen={isAdicionarModalOpen}
          onClose={handleFecharAdicionarModal}
          onSave={handleSalvarNovoEvento}
          dataSelecionada={dataHoraPreenchimento?.data}
          horaSelecionada={dataHoraPreenchimento?.hora}
        />
      )}
    </div>
  );
};
