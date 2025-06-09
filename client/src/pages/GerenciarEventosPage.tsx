import React, { useState } from 'react';
import type { Evento, DiaDaSemana } from '../types/evento';
import Navbar from '../components/Navbar/Navbar';

const diasSemana: DiaDaSemana[] = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];

// Mock inicial de eventos
const eventosMock: Evento[] = [
  { id: '1', titulo: 'Futsal Treino', descricao: 'Treino de futsal masculino', diasDaSemana: ['segunda', 'quarta'], horaInicio: '07:30', horaFim: '08:30', responsavel: 'Prof. Silva', dataCriacao: new Date().toISOString(), local: 'Quadra A', cor: '#81c784' },
  { id: '2', titulo: 'Vôlei Comp.', descricao: 'Competição de vôlei', diasDaSemana: ['segunda'], horaInicio: '08:00', horaFim: '09:00', responsavel: 'Prof. Ana', dataCriacao: new Date().toISOString(), local: 'Ginásio', cor: '#ffb74d' },
];

const GerenciarEventosPage: React.FC = () => {
  const [eventos, setEventos] = useState<Evento[]>(eventosMock);
  const [novoEvento, setNovoEvento] = useState<Partial<Evento>>({ diasDaSemana: [] });

  // Adicionar evento
  const handleAddEvento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoEvento.titulo || !novoEvento.horaInicio || !novoEvento.horaFim || !novoEvento.diasDaSemana?.length) return;
    const evento: Evento = {
      ...novoEvento,
      id: Date.now().toString(),
      descricao: novoEvento.descricao || '',
      responsavel: novoEvento.responsavel || '',
      dataCriacao: new Date().toISOString(),
      local: novoEvento.local || '',
      cor: novoEvento.cor || '#81c784',
    } as Evento;
    setEventos([...eventos, evento]);
    setNovoEvento({ diasDaSemana: [] });
  };

  // Remover evento
  const handleRemoveEvento = (id: string) => {
    setEventos(eventos.filter(ev => ev.id !== id));
  };

  // Atualizar campos do novo evento
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNovoEvento(prev => ({ ...prev, [name]: value }));
  };

  // Atualizar dias da semana
  const handleDiaSemanaChange = (dia: DiaDaSemana) => {
    setNovoEvento(prev => {
      const dias = prev.diasDaSemana || [];
      return {
        ...prev,
        diasDaSemana: dias.includes(dia) ? dias.filter(d => d !== dia) : [...dias, dia],
      };
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e3e9f9 0%, #f5f7ff 100%)' }}>
      <Navbar />
      <div style={{ maxWidth: 900, margin: '40px auto', background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(8,76,244,0.08)', padding: '32px 24px' }}>
        <h1 style={{ color: '#084cf4', textAlign: 'center', marginBottom: 32, fontWeight: 700, letterSpacing: 1 }}>Gerenciar Eventos</h1>
        <h2 style={{ color: '#1976d2', marginBottom: 16, fontWeight: 600 }}>Adicionar Novo Evento</h2>
        <form onSubmit={handleAddEvento} style={{ background: '#f5f7ff', borderRadius: 12, padding: 24, marginBottom: 32, boxShadow: '0 1px 4px rgba(8,76,244,0.06)', display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
          <input name="titulo" placeholder="Título" value={novoEvento.titulo || ''} onChange={handleChange} required style={{ flex: 1, minWidth: 120, padding: 10, borderRadius: 8, border: '1px solid #ccc' }} />
          <input name="descricao" placeholder="Descrição" value={novoEvento.descricao || ''} onChange={handleChange} style={{ flex: 1, minWidth: 120, padding: 10, borderRadius: 8, border: '1px solid #ccc' }} />
          <input name="horaInicio" type="time" value={novoEvento.horaInicio || ''} onChange={handleChange} required style={{ flex: 1, minWidth: 120, padding: 10, borderRadius: 8, border: '1px solid #ccc' }} />
          <input name="horaFim" type="time" value={novoEvento.horaFim || ''} onChange={handleChange} required style={{ flex: 1, minWidth: 120, padding: 10, borderRadius: 8, border: '1px solid #ccc' }} />
          <input name="local" placeholder="Local" value={novoEvento.local || ''} onChange={handleChange} style={{ flex: 1, minWidth: 120, padding: 10, borderRadius: 8, border: '1px solid #ccc' }} />
          <input name="responsavel" placeholder="Responsável" value={novoEvento.responsavel || ''} onChange={handleChange} style={{ flex: 1, minWidth: 120, padding: 10, borderRadius: 8, border: '1px solid #ccc' }} />
          <input name="cor" type="color" value={novoEvento.cor || '#81c784'} onChange={handleChange} style={{ width: 48, height: 48, border: 'none', background: 'none' }} />
          <div style={{ flexBasis: '100%', marginBottom: 8 }}>
            {diasSemana.map(dia => (
              <label key={dia} style={{ marginRight: 12, fontWeight: 500 }}>
                <input type="checkbox" checked={novoEvento.diasDaSemana?.includes(dia) || false} onChange={() => handleDiaSemanaChange(dia)} /> {dia.charAt(0).toUpperCase() + dia.slice(1)}
              </label>
            ))}
          </div>
          <button type="submit" style={{ background: 'linear-gradient(90deg, #084cf4 0%, #1976d2 100%)', color: '#fff', border: 'none', borderRadius: 12, padding: '14px 36px', fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 2px 8px rgba(8,76,244,0.10)' }}>Adicionar Evento</button>
        </form>
        <h2 style={{ color: '#1976d2', marginBottom: 16, fontWeight: 600 }}>Lista de Eventos</h2>
        <div style={{ background: '#f5f7ff', borderRadius: 12, padding: 16, boxShadow: '0 1px 4px rgba(8,76,244,0.06)' }}>
          {eventos.length === 0 && <p style={{ color: '#888' }}>Nenhum evento cadastrado.</p>}
          {eventos.map(ev => (
            <div key={ev.id} style={{ borderBottom: '1px solid #e3e9f9', padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', borderRadius: 8, marginBottom: 12, boxShadow: '0 1px 4px rgba(8,76,244,0.04)' }}>
              <div>
                <strong style={{ color: '#084cf4' }}>{ev.titulo}</strong> <span style={{ color: '#1976d2', fontWeight: 500 }}>({ev.diasDaSemana.join(', ')})</span><br />
                <span style={{ color: '#444' }}>{ev.horaInicio} - {ev.horaFim} | {ev.local} | Resp: {ev.responsavel}</span>
              </div>
              <button onClick={() => handleRemoveEvento(ev.id)} style={{ background: '#d32f2f', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 28px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 1px 4px rgba(211,47,47,0.10)' }}>Remover</button>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 24, color: '#888', textAlign: 'center' }}><em>Obs: A lista será atualizada automaticamente quando o backend estiver conectado.</em></p>
      </div>
    </div>
  );
};

export default GerenciarEventosPage; 