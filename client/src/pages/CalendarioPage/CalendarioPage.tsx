import React, { useState, useEffect } from 'react';
import GridEventosSemanal from "../../components/GridEventosSemanal/GridEventosSemanal";
import type { Evento, DiaDaSemana  } from '../../types/evento';
import Navbar from "../../components/Navbar/Navbar";
import { EditarEventoModal } from '../../components/EditarEvento/EditarEvento';
import { AdicionarEventoModal, type DadosNovoEvento } from '../../components/AdicionarEventoModal/AdicionarEventoModal'; // Importar o novo modal e tipo
import axios from 'axios'; // Para chamadas API
import { useNavigate } from 'react-router'; // Corrigido para react-router-dom
import { getBlocosSelecionaveis, type BlocoSelecionavel } from '../../types/HorariosConfig'; // Corrigido caminho

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
// Constante para os dias da semana, necessária para derivar o dia ao enviar para a API
const DIAS_SEMANA_OPCOES: DiaDaSemana[] = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];


// Função para transformar evento da API para o formato do frontend
const transformarEventoDaAPI = (eventoAPI: any): Evento | null => {
  // Verifica se eventoAPI existe e se possui uma propriedade 'idEvento' que não seja null ou undefined.
  if (!eventoAPI || typeof eventoAPI.idEvento === 'undefined' || eventoAPI.idEvento === null) {
    console.warn('Evento da API recebido sem ID, ou com ID nulo/undefined:', eventoAPI);
    return null; // Marcar para filtragem
  }

  const idAsString = String(eventoAPI.idEvento).trim(); // Usar idEvento

  if (idAsString === "" || idAsString === "null" || idAsString === "undefined") {
    console.warn('Evento da API resultou em ID problemático para chave React:', eventoAPI, 'ID processado:', idAsString);
    return null; // Marcar para filtragem se o ID for uma string vazia, "null", ou "undefined"
  }
    
  let dataEventoFormatadaParaFrontend: string | null = null;

  if (eventoAPI.dataEvento && typeof eventoAPI.dataEvento === 'string') {
    const dateStr = eventoAPI.dataEvento.trim();
    const parts = dateStr.split('-');

    if (parts.length === 3) {
      let year: string, month: string, day: string;

      // Check if it's YYYY-MM-DD
      if (parts[0].length === 4 && !isNaN(parseInt(parts[0])) &&
          parts[1].length >= 1 && parts[1].length <= 2 && !isNaN(parseInt(parts[1])) &&
          parts[2].length >= 1 && parts[2].length <= 2 && !isNaN(parseInt(parts[2]))) {
        year = parts[0];
        month = parts[1];
        day = parts[2];
      }
      // Else, check if it's dd-MM-YYYY (as expected by @JsonFormat)
      else if (parts[2].length === 4 && !isNaN(parseInt(parts[2])) &&
               parts[1].length >= 1 && parts[1].length <= 2 && !isNaN(parseInt(parts[1])) &&
               parts[0].length >= 1 && parts[0].length <= 2 && !isNaN(parseInt(parts[0]))) {
        year = parts[2];
        month = parts[1];
        day = parts[0];
      } else {
        year = month = day = ""; // Invalid format
      }
      if (year && month && day) {
        const monthNum = parseInt(month, 10);
        const dayNum = parseInt(day, 10);
        if (year.length === 4 && monthNum >= 1 && monthNum <= 12 && dayNum >= 1 && dayNum <= 31) { // Basic validation
          dataEventoFormatadaParaFrontend = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        } else {
          console.warn(`Partes da dataEvento ("${eventoAPI.dataEvento}") inválidas para evento ID ${idAsString}. Usando fallback.`);
        }
      } else {
         console.warn(`Formato de dataEvento ("${eventoAPI.dataEvento}") não reconhecido (esperado dd-MM-yyyy ou YYYY-MM-DD) para evento ID ${idAsString}. Usando fallback.`);
      }
    } else {
      console.warn(`Formato de dataEvento ("${eventoAPI.dataEvento}") não é divisível em 3 partes por '-' para evento ID ${idAsString}. Usando fallback.`);
    }
  } else {
    console.warn(`dataEvento ausente ou não é string na resposta da API para evento ID ${idAsString}. Usando fallback.`);
  }
  
  if (!dataEventoFormatadaParaFrontend) {
    console.warn(`dataEvento ("${eventoAPI.dataEvento}") ausente, inválida ou em formato não reconhecido para evento ID ${idAsString}. Evento será filtrado.`);
    return null; // Se dataEvento é crucial e não pode ser parseada, filtramos o evento.
  }
  
  return {
    id: idAsString, // Usar o ID processado e validado
    titulo: eventoAPI.titulo,
    descricao: eventoAPI.descricao || "",
    dataEvento: dataEventoFormatadaParaFrontend, // Formato "YYYY-MM-DD"
    diasDaSemana: eventoAPI.diasDaSemana ? [eventoAPI.diasDaSemana.toLowerCase() as DiaDaSemana] : [],
    horaInicio: eventoAPI.horarioInicio ? eventoAPI.horarioInicio.substring(0, 5) : "00:00", // "HH:mm:ss" para "HH:mm"
    horaFim: eventoAPI.horarioFim ? eventoAPI.horarioFim.substring(0, 5) : "00:00",       // "HH:mm:ss" para "HH:mm"
    responsavel: eventoAPI.responsavel || null,
    local: eventoAPI.localidade || "", // Mapear localidade para local
    cor: eventoAPI.cor || "#81c784",
    dataCriacao: eventoAPI.dataCriacao || new Date().toISOString(),
  };
};


export const CalendarioPage = () => {
  const [dataBase, setDataBase] = useState<Date>(getMondayOfWeek(new Date()));
  const [todosOsEventos, setTodosOsEventos] = useState<Evento[]>([]); // Novo estado para todos os eventos da API
  const [semanaAtual, setSemanaAtual] = useState<Date[]>(getSemana(new Date()));

  // Estados para o modal de Edição
  const [isEditarModalOpen, setIsEditarModalOpen] = useState(false);
  const [eventoSelecionado, setEventoSelecionado] = useState<Evento | null>(null);
  const navigate = useNavigate(); // Hook para navegação

  // Estados para o modal de Adição
  const [isAdicionarModalOpen, setIsAdicionarModalOpen] = useState(false);
  const [dataHoraPreenchimento, setDataHoraPreenchimento] = useState<{ data?: Date; hora?: string } | null>(null);

  // Atualiza a semana exibida quando dataBase muda
  useEffect(() => {
    setSemanaAtual(getSemana(dataBase));
  }, [dataBase]);

  // Busca eventos da API ao montar o componente
  useEffect(() => {
    const fetchEventosDaAPI = async () => {
      const email = localStorage.getItem('userEmail');
      const password = localStorage.getItem('userPassword');

      if (!email || !password) {
        console.error("Credenciais não encontradas, redirecionando para login.");
        navigate('/'); // Redireciona para a página de login
        return;
      }

      const token = btoa(`${email}:${password}`);

      try {
        const response = await axios.get('https://fastcalendarbd.onrender.com/eventos', {
          headers: {
            'Authorization': `Basic ${token}`,
          }
        });
        const eventosBrutos = Array.isArray(response.data) ? response.data : [];
        const eventosTransformadosComPotenciaisNulos = eventosBrutos.map(transformarEventoDaAPI);
        const eventosValidos = eventosTransformadosComPotenciaisNulos.filter(e => e !== null) as Evento[]; // Filtra nulos e faz type assertion
        setTodosOsEventos(eventosValidos);
      } catch (error: any) {
        console.error('Erro ao buscar eventos:', error.response?.data || error.message);
        if (error.response?.status === 401) {
          localStorage.removeItem('userEmail');
          localStorage.removeItem('userPassword');
          alert("Sessão expirada ou credenciais inválidas. Por favor, faça login novamente.");
          navigate('/');
        }
      }
    };

    fetchEventosDaAPI();
  }, [navigate]); 

  // Handlers para o modal de Edição
  const handleAbrirEditarModal = (evento: Evento) => {
    setEventoSelecionado(evento);
    setIsEditarModalOpen(true);
  };

  const handleFecharEditarModal = () => {
    setIsEditarModalOpen(false);
    setEventoSelecionado(null);
  };

  const handleSalvarEventoEditado = async (eventoEditadoFrontend: Evento) => {
    const email = localStorage.getItem('userEmail');
    const password = localStorage.getItem('userPassword');

    if (!email || !password) {
      alert("Credenciais não encontradas. Faça login novamente.");
      navigate('/');
      return;
    }
    const authToken = btoa(`${email}:${password}`);

    const eventoParaAPI = {
      titulo: eventoEditadoFrontend.titulo,
      descricao: eventoEditadoFrontend.descricao || "",
      dataEvento: eventoEditadoFrontend.dataEvento, // Enviar como YYYY-MM-DD
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

    try {
      const response = await axios.put(
        `https://fastcalendarbd.onrender.com/eventos/${eventoEditadoFrontend.id}`,
        eventoParaAPI,
        {
          headers: {
            'Authorization': `Basic ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      const eventoAtualizadoDoBackend = transformarEventoDaAPI(response.data || { ...eventoParaAPI, idEvento: Number(eventoEditadoFrontend.id), dataCriacao: eventoEditadoFrontend.dataCriacao });

      if (eventoAtualizadoDoBackend) {
        setTodosOsEventos(prevEventos =>
          prevEventos.map((ev: Evento) => (ev.id === eventoAtualizadoDoBackend.id ? eventoAtualizadoDoBackend : ev))
        );
      } else {
        console.error("Falha ao transformar o evento atualizado da API, o estado não foi modificado para este evento.");
      }
      handleFecharEditarModal();
      alert("Evento atualizado com sucesso!");
    } catch (error: any) {
      console.error('Erro ao atualizar evento:', error.response?.data || error.message);
      alert(`Erro ao atualizar evento: ${error.response?.data?.message || error.message}`);
      if (error.response?.status === 401) {
        navigate('/');
      }
    }
  };

  const handleDeletarEvento = async (eventoId: string) => {
    const email = localStorage.getItem('userEmail');
    const password = localStorage.getItem('userPassword');
    if (!email || !password) { 
        alert("Credenciais não encontradas. Faça login novamente.");
        navigate('/'); 
        return; 
    }
    const authToken = btoa(`${email}:${password}`);

    try {
      await axios.delete(`https://fastcalendarbd.onrender.com/eventos/${eventoId}`, {
        headers: { 'Authorization': `Basic ${authToken}` }
      });
      setTodosOsEventos(prevEventos => prevEventos.filter((ev: Evento) => ev.id !== eventoId));
      handleFecharEditarModal();
      alert("Evento deletado com sucesso!");
    } catch (error: any) {
      console.error('Erro ao deletar evento:', error.response?.data || error.message);
      alert(`Erro ao deletar evento: ${error.response?.data?.message || error.message}`);
      if (error.response?.status === 401) navigate('/');
    }
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

  const handleSalvarNovoEvento = async (dadosNovoEventoFrontend: DadosNovoEvento) => {
    const email = localStorage.getItem('userEmail');
    const password = localStorage.getItem('userPassword');

    if (!email || !password) {
      alert("Credenciais não encontradas. Faça login novamente.");
      navigate('/');
      return;
    }
    const authToken = btoa(`${email}:${password}`);

    const novoEventoParaAPI = {
      titulo: dadosNovoEventoFrontend.titulo,
      descricao: dadosNovoEventoFrontend.descricao || "",
      dataEvento: dadosNovoEventoFrontend.dataEvento, // Enviar como YYYY-MM-DD
      diasDaSemana: (() => { 
            if (!dadosNovoEventoFrontend.dataEvento || typeof dadosNovoEventoFrontend.dataEvento !== 'string') {
        console.error("CalendarioPage: dataEvento inválida ou ausente ao tentar gerar diasDaSemana:", dadosNovoEventoFrontend.dataEvento);
        // Retornar um valor que o backend possa identificar como erro ou que seja tratado
        // ou garantir que a validação no modal impeça isso.
        return "INVALID_DATA_EVENTO"; 
    }
        const dataObj = new Date(dadosNovoEventoFrontend.dataEvento + "T00:00:00");
            if (isNaN(dataObj.getTime())) { // Verifica se a data é válida
        console.error("CalendarioPage: dataEvento resultou em Data Inválida:", dadosNovoEventoFrontend.dataEvento);
        return "INVALID_DATE_OBJECT";
    }
        const diaNum = dataObj.getDay();
        const diaSemana = DIAS_SEMANA_OPCOES[(diaNum === 0 ? 6 : diaNum - 1)];
            if (!diaSemana) {
        console.error("CalendarioPage: Não foi possível determinar diaSemana a partir de diaNum:", diaNum, "para data:", dadosNovoEventoFrontend.dataEvento);
        return "UNKNOWN_DAY_OF_WEEK";
    }
        return diaSemana.toUpperCase(); // Ex: "SEGUNDA"
      })(),
      horarioInicio: dadosNovoEventoFrontend.horaInicio + ":00",
      horarioFim: dadosNovoEventoFrontend.horaFim + ":00",
      responsavel: dadosNovoEventoFrontend.responsavel || null,
      localidade: dadosNovoEventoFrontend.local || "",
      recorrencia: "NENHUM",
      recorrenciaFim: null,
      cor: dadosNovoEventoFrontend.cor || "#81c784",
    };

    try {
      const response = await axios.post(
        'https://fastcalendarbd.onrender.com/eventos',
        novoEventoParaAPI,
        {
          headers: {
            'Authorization': `Basic ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const novoEventoDoBackend = transformarEventoDaAPI(response.data);
      if (novoEventoDoBackend) {
        setTodosOsEventos(prevEventos => [...prevEventos, novoEventoDoBackend]);
      }
      handleFecharAdicionarModal();
      alert("Novo evento adicionado com sucesso!");
    } catch (error: any) {
      console.error('Erro ao adicionar evento:', error.response?.data || error.message);
      alert(`Erro ao adicionar evento: ${error.response?.data?.message || error.message}`);
      if (error.response?.status === 401) {
        navigate('/');
      }
    }
  };

  const eventosDaSemanaAtual = todosOsEventos;

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

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
        <button
          onClick={() => handleAbrirAdicionarModal()}
          style={{ padding: '10px 20px', borderRadius: 6, border: 'none', background: '#4CAF50', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Adicionar Novo Evento
        </button>
      </div>

      <GridEventosSemanal
        eventos={eventosDaSemanaAtual}
        semana={semanaAtual}
        onAbrirModalEditar={handleAbrirEditarModal}
        onSlotVazioClick={handleAbrirAdicionarModal}
      />

      {isEditarModalOpen && eventoSelecionado && (
        <EditarEventoModal
          evento={eventoSelecionado}
          isOpen={isEditarModalOpen}
          onClose={handleFecharEditarModal}
          onSave={handleSalvarEventoEditado}
          onDelete={handleDeletarEvento}
        />
      )}

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