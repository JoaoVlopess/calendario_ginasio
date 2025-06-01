// import styles from './CalendarioPage.module.css';
import React, { useState, useEffect } from 'react';
import GridEventosSemanal from "../../components/GridEventosSemanal/GridEventosSemanal";
import type { Evento } from '../../types/evento'; // Importe o tipo Evento
import Navbar from "../../components/Navbar/Navbar";
import { EditarEventoModal } from '../../components/EditarEvento/EditarEvento'; // 1. Importar o modal

// Função para gerar as datas da semana atual (exemplo simples)
const getSemanaAtual = (): Date[] => {
  const hoje = new Date();
  const diaDaSemanaHoje = hoje.getDay(); // 0 (Dom) - 6 (Sab)

  // Calcula a data da segunda-feira da semana atual
  const segundaFeira = new Date(hoje);
  // Ajusta para segunda-feira:
  // Se hoje é domingo (0), subtrai 6 dias.
  // Se hoje é segunda (1), subtrai 0 dias.
  // Se hoje é terça (2), subtrai 1 dia, etc.
  const offset = diaDaSemanaHoje === 0 ? -6 : 1 - diaDaSemanaHoje;
  segundaFeira.setDate(hoje.getDate() + offset);
  segundaFeira.setHours(0, 0, 0, 0); // Normaliza para o início do dia

  const semana: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const dia = new Date(segundaFeira);
    dia.setDate(segundaFeira.getDate() + i);
    semana.push(dia);
  }
  return semana;
};

export const CalendarioPage = () => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [semanaAtual, setSemanaAtual] = useState<Date[]>(getSemanaAtual());

  // 2. Estados para o modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventoSelecionado, setEventoSelecionado] = useState<Evento | null>(null);

  useEffect(() => {
    // Aqui você buscaria seus eventos de uma API ou fonte de dados
    // Por enquanto, vamos usar dados mock:
    const eventosMock: Evento[] = [
      { id: '1', titulo: 'Futsal Treino', diasDaSemana: ['segunda', 'quarta'], horaInicio: '07:30', horaFim: '08:30', responsavel: 'Prof. Silva', dataCriacao: new Date().toISOString(), descricao: 'Treino de futsal masculino', local: 'Quadra A', cor: '#81c784' },
      { id: '2', titulo: 'Vôlei Comp.', diasDaSemana: ['segunda'], horaInicio: '08:00', horaFim: '09:00', responsavel: 'Prof. Ana', dataCriacao: new Date().toISOString(), descricao: 'Competição de vôlei', local: 'Ginásio', cor: '#ffb74d' },
      { id: '3', titulo: 'Basquete Livre', diasDaSemana: ['terca'], horaInicio: '08:30', horaFim: '09:30', responsavel: null, dataCriacao: new Date().toISOString(), descricao: 'Jogo livre de basquete', local: 'Quadra B', cor: '#64b5f6' },
    ];
    setEventos(eventosMock);
  }, []); // O array vazio como segundo argumento faz o useEffect rodar apenas uma vez, após a montagem inicial

  // 3. Funções de handler para o modal
  const handleAbrirModal = (evento: Evento) => {
    setEventoSelecionado(evento);
    setIsModalOpen(true);
  };

  const handleFecharModal = () => {
    setIsModalOpen(false);
    setEventoSelecionado(null); // Limpa o evento selecionado ao fechar
  };

  const handleSalvarEvento = (eventoAtualizado: Evento) => {
    setEventos(prevEventos =>
      prevEventos.map(ev => (ev.id === eventoAtualizado.id ? eventoAtualizado : ev))
    );
    // Adicionar aqui a lógica para persistir a alteração (ex: chamada de API)
    console.log('Evento salvo:', eventoAtualizado);
    handleFecharModal();
  };

  const handleDeletarEvento = (eventoId: string) => {
    setEventos(prevEventos => prevEventos.filter(ev => ev.id !== eventoId));
    // Adicionar aqui a lógica para persistir a exclusão (ex: chamada de API)
    console.log('Evento deletado:', eventoId);
    handleFecharModal();
  };

  return (
    <div className=""> {/* Considere usar styles.container se tiver CSS Modules */}
      <Navbar />
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