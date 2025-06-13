// src/pages/GerenciarEventosPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import type { Evento, DiaDaSemana } from '../types/evento';
import Navbar from '../components/Navbar/Navbar';
import { AdicionarEventoModal, type DadosNovoEvento } from '../components/AdicionarEventoModal/AdicionarEventoModal';
import { EditarEventoModal } from '../components/EditarEvento/EditarEvento';
// Importe o arquivo de configuração de horários se ele contiver DIAS_SEMANA_OPCOES
// ou defina-o aqui se for específico para esta página ou CalendarioPage.
// import { DIAS_SEMANA_OPCOES } from '../config/horariosConfig'; 

// Constante para os dias da semana, necessária para derivar o dia ao enviar para a API
const DIAS_SEMANA_OPCOES: DiaDaSemana[] = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];

// Função para transformar evento da API para o formato do frontend
// (Idealmente, esta função seria movida para um arquivo de utilitários compartilhado)
const transformarEventoDaAPI = (eventoAPI: any): Evento | null => {
  if (!eventoAPI || typeof eventoAPI.idEvento === 'undefined' || eventoAPI.idEvento === null) {
    console.warn('GerenciarEventosPage: Evento da API recebido sem ID, ou com ID nulo/undefined:', eventoAPI);
    return null;
  }
  const idAsString = String(eventoAPI.idEvento).trim();
  if (idAsString === "" || idAsString === "null" || idAsString === "undefined") {
    console.warn('GerenciarEventosPage: Evento da API resultou em ID problemático para chave React:', eventoAPI, 'ID processado:', idAsString);
    return null;
  }

  let dataEventoFormatadaParaFrontend: string | null = null;
  if (eventoAPI.dataEvento && typeof eventoAPI.dataEvento === 'string') {
    const dateStr = eventoAPI.dataEvento.trim();
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      let year: string, month: string, day: string;
      if (parts[0].length === 4 && !isNaN(parseInt(parts[0]))) { // YYYY-MM-DD
        [year, month, day] = parts;
      } else if (parts[2].length === 4 && !isNaN(parseInt(parts[2]))) { // dd-MM-YYYY
        [day, month, year] = parts;
      } else { 
        year = month = day = ""; 
        console.warn(`GerenciarEventosPage: Formato de dataEvento ("${dateStr}") não reconhecido para evento ID ${idAsString}.`);
      }
      
      if (year && month && day) {
        const monthNum = parseInt(month, 10); 
        const dayNum = parseInt(day, 10);
        if (year.length === 4 && monthNum >= 1 && monthNum <= 12 && dayNum >= 1 && dayNum <= 31) {
          dataEventoFormatadaParaFrontend = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        } else {
            console.warn(`GerenciarEventosPage: Partes da dataEvento ("${dateStr}") inválidas para evento ID ${idAsString}.`);
        }
      }
    } else {
        console.warn(`GerenciarEventosPage: Formato de dataEvento ("${dateStr}") não é divisível em 3 partes por '-' para evento ID ${idAsString}.`);
    }
  }
  
  if (!dataEventoFormatadaParaFrontend) {
    console.warn(`GerenciarEventosPage: dataEvento ("${eventoAPI.dataEvento}") ausente, inválida ou em formato não reconhecido para evento ID ${idAsString}. Evento será filtrado.`);
    return null;
  }

  return {
    id: idAsString,
    titulo: eventoAPI.titulo,
    descricao: eventoAPI.descricao || "",
    dataEvento: dataEventoFormatadaParaFrontend,
    diasDaSemana: eventoAPI.diasDaSemana ? [eventoAPI.diasDaSemana.toLowerCase() as DiaDaSemana] : [],
    horaInicio: eventoAPI.horarioInicio ? eventoAPI.horarioInicio.substring(0, 5) : "00:00",
    horaFim: eventoAPI.horarioFim ? eventoAPI.horarioFim.substring(0, 5) : "00:00",
    responsavel: eventoAPI.responsavel || null,
    local: eventoAPI.localidade || "",
    cor: eventoAPI.cor || "#81c784",
    dataCriacao: eventoAPI.dataCriacao || new Date().toISOString(),
  };
};


const GerenciarEventosPage: React.FC = () => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const [isAdicionarModalOpen, setIsAdicionarModalOpen] = useState(false);
  const [isEditarModalOpen, setIsEditarModalOpen] = useState(false);
  const [eventoParaEditar, setEventoParaEditar] = useState<Evento | null>(null);

  const fetchEventos = async () => {
    setIsLoading(true);
    setError(null);
    const email = localStorage.getItem('userEmail');
    const password = localStorage.getItem('userPassword');
    if (!email || !password) { 
      console.error("GerenciarEventosPage: Credenciais não encontradas, redirecionando para login.");
      navigate('/'); 
      return; 
    }
    const token = btoa(`${email}:${password}`);

    try {
      console.log("GerenciarEventosPage: Buscando eventos da API...");
      const response = await axios.get('https://fastcalendarbd.onrender.com/eventos', {
        headers: { 'Authorization': `Basic ${token}` }
      });
      const eventosBrutos = Array.isArray(response.data) ? response.data : [];
      const eventosValidos = eventosBrutos.map(transformarEventoDaAPI).filter(e => e !== null) as Evento[];
      // Ordenar por data do evento (mais recente primeiro), depois por hora de início
      eventosValidos.sort((a, b) => {
        if (a.dataEvento > b.dataEvento) return -1;
        if (a.dataEvento < b.dataEvento) return 1;
        if (a.horaInicio < b.horaInicio) return -1;
        if (a.horaInicio > b.horaInicio) return 1;
        return 0;
      });
      console.log("GerenciarEventosPage: Eventos recebidos e transformados:", eventosValidos);
      setEventos(eventosValidos);
    } catch (err: any) {
      console.error('GerenciarEventosPage: Erro ao buscar eventos:', err.response || err.message, err);
      setError('Falha ao carregar eventos. Verifique sua conexão ou tente novamente mais tarde.');
      if (err.response?.status === 401) {
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userPassword');
        alert("Sessão expirada ou credenciais inválidas. Por favor, faça login novamente.");
        navigate('/');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEventos();
  }, [navigate]);

  const handleSalvarNovoEvento = async (dadosNovoEventoFrontend: DadosNovoEvento) => {
    const email = localStorage.getItem('userEmail');
    const password = localStorage.getItem('userPassword');
    if (!email || !password) { navigate('/'); return; }
    const authToken = btoa(`${email}:${password}`);

    const novoEventoParaAPI = {
      titulo: dadosNovoEventoFrontend.titulo,
      descricao: dadosNovoEventoFrontend.descricao || "",
      dataEvento: dadosNovoEventoFrontend.dataEvento, // Enviar como YYYY-MM-DD
      diasDaSemana: (() => {
        const dataObj = new Date(dadosNovoEventoFrontend.dataEvento + "T00:00:00");
        const diaNum = dataObj.getDay();
        const diaSemana = DIAS_SEMANA_OPCOES[(diaNum === 0 ? 6 : diaNum - 1)];
        return diaSemana.toUpperCase(); // Ex: "SEXTA"
      })(),
      horarioInicio: dadosNovoEventoFrontend.horaInicio + ":00",
      horarioFim: dadosNovoEventoFrontend.horaFim + ":00",
      responsavel: dadosNovoEventoFrontend.responsavel || null,
      localidade: dadosNovoEventoFrontend.local || "",
      recorrencia: "NENHUM", // Ajuste conforme necessário se tiver UI para isso
      recorrenciaFim: null,  // Ajuste conforme necessário
      cor: dadosNovoEventoFrontend.cor || "#81c784",
    };
    console.log("GerenciarEventosPage: Enviando dados para criar novo evento (POST):", novoEventoParaAPI);
    try {
      const response = await axios.post('https://fastcalendarbd.onrender.com/eventos', novoEventoParaAPI, {
        headers: { 'Authorization': `Basic ${authToken}`, 'Content-Type': 'application/json' }
      });
      console.log("GerenciarEventosPage: Resposta da API (criar evento):", response);
      const eventoCriado = transformarEventoDaAPI(response.data);
      if (eventoCriado) {
        // Adiciona no início da lista para melhor UX ou recarrega a lista
        setEventos(prev => [eventoCriado, ...prev].sort((a, b) => {
            if (a.dataEvento > b.dataEvento) return -1;
            if (a.dataEvento < b.dataEvento) return 1;
            return a.horaInicio.localeCompare(b.horaInicio);
        }));
      }
      setIsAdicionarModalOpen(false);
      alert("Evento adicionado com sucesso!");
    } catch (err: any) {
      console.error('GerenciarEventosPage: Erro ao adicionar evento:', err.response || err.message, err);
      alert(`Erro ao adicionar evento: ${err.response?.data?.message || err.message}`);
      if (err.response?.status === 401) navigate('/');
    }
  };

  const handleSalvarEventoEditado = async (eventoEditadoFrontend: Evento) => {
    const email = localStorage.getItem('userEmail');
    const password = localStorage.getItem('userPassword');
    if (!email || !password) { navigate('/'); return; }
    const authToken = btoa(`${email}:${password}`);
    const eventoParaAPI = {
      titulo: eventoEditadoFrontend.titulo,
      descricao: eventoEditadoFrontend.descricao || "",
      dataEvento: eventoEditadoFrontend.dataEvento.split('-').reverse().join('-'), // YYYY-MM-DD para dd-MM-YYYY
      diasDaSemana: (() => {
        const dataObj = new Date(eventoEditadoFrontend.dataEvento + "T00:00:00");
        const diaNum = dataObj.getDay();
        const diaSemana = DIAS_SEMANA_OPCOES[(diaNum === 0 ? 6 : diaNum - 1)];
        return diaSemana.toUpperCase(); // Ex: "SEXTA"
      })(),
      horarioInicio: eventoEditadoFrontend.horaInicio + ":00",
      horarioFim: eventoEditadoFrontend.horaFim + ":00",
      responsavel: eventoEditadoFrontend.responsavel || null,
      localidade: eventoEditadoFrontend.local || "",
      recorrencia: "NENHUM", 
      recorrenciaFim: null,
      cor: eventoEditadoFrontend.cor || "#81c784",
    };
    console.log("GerenciarEventosPage: Enviando dados para atualizar evento (PUT):", eventoParaAPI, "ID:", eventoEditadoFrontend.id);
    try {
      const response = await axios.put(`https://fastcalendarbd.onrender.com/eventos/${eventoEditadoFrontend.id}`, eventoParaAPI, {
        headers: { 'Authorization': `Basic ${authToken}`, 'Content-Type': 'application/json' }
      });
      console.log("GerenciarEventosPage: Resposta da API (atualizar evento):", response);
      const eventoAtualizado = transformarEventoDaAPI(response.data || { ...eventoParaAPI, idEvento: Number(eventoEditadoFrontend.id), dataCriacao: eventoEditadoFrontend.dataCriacao });
      if (eventoAtualizado) {
        setEventos(prev => prev.map(ev => ev.id === eventoAtualizado.id ? eventoAtualizado : ev).sort((a, b) => {
            if (a.dataEvento > b.dataEvento) return -1;
            if (a.dataEvento < b.dataEvento) return 1;
            return a.horaInicio.localeCompare(b.horaInicio);
        }));
      }
      setIsEditarModalOpen(false);
      setEventoParaEditar(null);
      alert("Evento atualizado com sucesso!");
    } catch (err: any) {
      console.error('GerenciarEventosPage: Erro ao atualizar evento:', err.response || err.message, err);
      alert(`Erro ao atualizar evento: ${err.response?.data?.message || err.message}`);
      if (err.response?.status === 401) navigate('/');
    }
  };

  const handleDeletarEventoApi = async (eventoId: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita.")) return;
    
    const email = localStorage.getItem('userEmail');
    const password = localStorage.getItem('userPassword');
    if (!email || !password) { navigate('/'); return; }
    const authToken = btoa(`${email}:${password}`);
    
    console.log("GerenciarEventosPage: Enviando solicitação para deletar evento ID:", eventoId);
    try {
      await axios.delete(`https://fastcalendarbd.onrender.com/eventos/${eventoId}`, {
        headers: { 'Authorization': `Basic ${authToken}` }
      });
      console.log("GerenciarEventosPage: Evento deletado com sucesso da API.");
      setEventos(prev => prev.filter(ev => ev.id !== eventoId));
      // Se o modal de edição estiver aberto para este evento, feche-o
      if (isEditarModalOpen && eventoParaEditar?.id === eventoId) {
        setIsEditarModalOpen(false);
        setEventoParaEditar(null);
      }
      alert("Evento deletado com sucesso!");
    } catch (err: any) {
      console.error('GerenciarEventosPage: Erro ao deletar evento:', err.response || err.message, err);
      alert(`Erro ao deletar evento: ${err.response?.data?.message || err.message}`);
      if (err.response?.status === 401) navigate('/');
    }
  };

  const abrirModalEdicao = (evento: Evento) => {
    setEventoParaEditar(evento);
    setIsEditarModalOpen(true);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e3e9f9 0%, #f5f7ff 100%)' }}>
      <Navbar />
      <div style={{ maxWidth: 900, margin: '40px auto', background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(8,76,244,0.08)', padding: '32px 24px' }}>
        <h1 style={{ color: '#084cf4', textAlign: 'center', marginBottom: 32, fontWeight: 700, letterSpacing: 1 }}>Gerenciar Eventos</h1>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
          <button 
            onClick={() => setIsAdicionarModalOpen(true)}
            style={{ background: 'linear-gradient(90deg, #084cf4 0%, #1976d2 100%)', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 24px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 2px 8px rgba(8,76,244,0.10)' }}
          >
            Adicionar Novo Evento
          </button>
        </div>

        {isLoading && <p style={{ textAlign: 'center', color: '#084cf4' }}>Carregando eventos...</p>}
        {error && <p style={{ textAlign: 'center', color: 'red' }}>{error}</p>}

        <h2 style={{ color: '#1976d2', marginTop: '30px', marginBottom: 16, fontWeight: 600 }}>Lista de Eventos Cadastrados</h2>
        <div style={{ background: '#f5f7ff', borderRadius: 12, padding: 16, boxShadow: '0 1px 4px rgba(8,76,244,0.06)' }}>
          {!isLoading && eventos.length === 0 && !error && <p style={{ color: '#888', textAlign: 'center', padding: '20px' }}>Nenhum evento cadastrado.</p>}
          {eventos.map(ev => (
            <div key={ev.id} style={{ borderBottom: '1px solid #e3e9f9', padding: '16px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', borderRadius: 8, marginBottom: 12, boxShadow: '0 1px 4px rgba(8,76,244,0.04)' }}>
              <div style={{ flexGrow: 1, marginRight: '10px' }}>
                <strong style={{ color: '#084cf4', display: 'block', marginBottom: '4px' }}>{ev.titulo}</strong>
                <span style={{ color: '#1976d2', fontWeight: 500, fontSize: '0.9em' }}>
                  Data: {new Date(ev.dataEvento + 'T00:00:00').toLocaleDateString('pt-BR')}
                </span><br />
                <span style={{ color: '#444', fontSize: '0.85em' }}>
                  Horário: {ev.horaInicio} - {ev.horaFim}
                </span><br/>
                <span style={{ color: '#444', fontSize: '0.85em' }}>
                  Local: {ev.local || 'N/A'} | Responsável: {ev.responsavel || 'N/A'}
                </span>
                {ev.descricao && <p style={{color: '#555', fontSize: '0.8em', marginTop: '5px', whiteSpace: 'pre-wrap'}}>{ev.descricao}</p>}
              </div>
              <div style={{display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end'}}>
                <button 
                  onClick={() => abrirModalEdicao(ev)}
                  style={{ background: '#ffc107', color: '#212529', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 600, cursor: 'pointer', minWidth: '80px' }}
                >
                  Editar
                </button>
                <button 
                  onClick={() => handleDeletarEventoApi(ev.id)} 
                  style={{ background: '#d32f2f', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 600, cursor: 'pointer', minWidth: '80px' }}
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isAdicionarModalOpen && (
        <AdicionarEventoModal
          isOpen={isAdicionarModalOpen}
          onClose={() => setIsAdicionarModalOpen(false)}
          onSave={handleSalvarNovoEvento}
          // dataSelecionada e horaSelecionada podem ser omitidas ou passadas como undefined
          // já que o modal de adicionar aqui não é aberto a partir de um clique no grid
        />
      )}

      {isEditarModalOpen && eventoParaEditar && (
        <EditarEventoModal
          evento={eventoParaEditar}
          isOpen={isEditarModalOpen}
          onClose={() => { setIsEditarModalOpen(false); setEventoParaEditar(null); }}
          onSave={handleSalvarEventoEditado}
          onDelete={handleDeletarEventoApi} 
        />
      )}
    </div>
  );
};

export default GerenciarEventosPage;
