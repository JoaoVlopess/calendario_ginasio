import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import axios from 'axios';
import Navbar from '../components/Navbar/Navbar';
import type { Evento, DiaDaSemana } from '../types/evento';

// Funções auxiliares (idealmente movidas para um arquivo utils.ts)
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

const DIAS_SEMANA_MAPA_DISPLAY: Record<number, string> = {
  0: 'Domingo', 1: 'Segunda', 2: 'Terça', 3: 'Quarta', 4: 'Quinta', 5: 'Sexta', 6: 'Sábado',
};

const transformarEventoDaAPI = (eventoAPI: any): Evento | null => {
  if (!eventoAPI || typeof eventoAPI.idEvento === 'undefined' || eventoAPI.idEvento === null) {
    console.warn('Evento da API recebido sem ID, ou com ID nulo/undefined:', eventoAPI);
    return null;
  }
  const idAsString = String(eventoAPI.idEvento).trim();
  if (idAsString === "" || idAsString === "null" || idAsString === "undefined") {
    console.warn('Evento da API resultou em ID problemático para chave React:', eventoAPI, 'ID processado:', idAsString);
    return null;
  }

  let dataEventoFormatadaParaFrontend: string | null = null;
  if (eventoAPI.dataEvento && typeof eventoAPI.dataEvento === 'string') {
    const dateStr = eventoAPI.dataEvento.trim();
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      let year: string, month: string, day: string;
      // Tenta primeiro o formato "dd-MM-yyyy" (esperado pela @JsonFormat)
      // Se o primeiro elemento parecer um ano, assume que é "YYYY-MM-DD"
      if (parts[0].length === 4 && !isNaN(parseInt(parts[0]))) { // YYYY-MM-DD
        [year, month, day] = parts;
      } else if (parts[2].length === 4 && !isNaN(parseInt(parts[2]))) { // dd-MM-YYYY
        [day, month, year] = parts;
      } else { 
        year = month = day = ""; // Formato inválido
        console.warn(`Formato de dataEvento ("${dateStr}") não reconhecido (esperado dd-MM-yyyy ou YYYY-MM-DD) para evento ID ${idAsString}.`);
      }
      
      if (year && month && day) {
        const monthNum = parseInt(month, 10); 
        const dayNum = parseInt(day, 10);
        if (year.length === 4 && monthNum >= 1 && monthNum <= 12 && dayNum >= 1 && dayNum <= 31) {
          dataEventoFormatadaParaFrontend = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        } else {
            console.warn(`Partes da dataEvento ("${dateStr}") inválidas para evento ID ${idAsString}.`);
        }
      }
    } else {
        console.warn(`Formato de dataEvento ("${dateStr}") não é divisível em 3 partes por '-' para evento ID ${idAsString}.`);
    }
  }
  
  if (!dataEventoFormatadaParaFrontend) {
    console.warn(`dataEvento ("${eventoAPI.dataEvento}") ausente, inválida ou em formato não reconhecido para evento ID ${idAsString}. Evento será filtrado.`);
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

const RelatorioSemanalPage: React.FC = () => {
  const [eventosDaSemanaSelecionada, setEventosDaSemanaSelecionada] = useState<Evento[]>([]);
  const [semanaSelecionada, setSemanaSelecionada] = useState<Date[]>(getSemana(new Date())); // Semana atual
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEFiltrarEventos = async () => {
      const email = localStorage.getItem('userEmail');
      const password = localStorage.getItem('userPassword');
      if (!email || !password) {
        console.error("Credenciais não encontradas, redirecionando para login.");
        navigate('/'); 
        return;
      }
      const token = btoa(`${email}:${password}`);
      try {
        const response = await axios.get('https://fastcalendarbd.onrender.com/eventos', {
          headers: { 'Authorization': `Basic ${token}` }
        });
        const eventosBrutos = Array.isArray(response.data) ? response.data : [];
        const todosEventosTransformados = eventosBrutos.map(transformarEventoDaAPI).filter(e => e !== null) as Evento[];

        const inicioSemana = semanaSelecionada[0].toISOString().split('T')[0];
        const fimSemana = semanaSelecionada[6].toISOString().split('T')[0];

        const eventosFiltrados = todosEventosTransformados.filter(evento => {
          return evento.dataEvento >= inicioSemana && evento.dataEvento <= fimSemana;
        });
        
        eventosFiltrados.sort((a, b) => {
            if (a.dataEvento < b.dataEvento) return -1;
            if (a.dataEvento > b.dataEvento) return 1;
            if (a.horaInicio < b.horaInicio) return -1;
            if (a.horaInicio > b.horaInicio) return 1;
            return 0;
        });

        setEventosDaSemanaSelecionada(eventosFiltrados);

      } catch (error: any) {
        console.error('Erro ao buscar eventos para relatório:', error.response?.data || error.message);
        if (error.response?.status === 401) {
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userPassword');
            alert("Sessão expirada ou credenciais inválidas. Por favor, faça login novamente.");
            navigate('/');
        }
      }
    };
    fetchEFiltrarEventos();
  }, [navigate, semanaSelecionada]);


  const gerarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    const dataInicioFormatada = semanaSelecionada[0].toLocaleDateString('pt-BR');
    const dataFimFormatada = semanaSelecionada[6].toLocaleDateString('pt-BR');
    doc.text(`Relatório de Eventos - Semana de ${dataInicioFormatada} a ${dataFimFormatada}`, 14, 18);
    doc.setFontSize(12);

    autoTable(doc, {
      startY: 28,
      head: [['Data', 'Dia da Semana', 'Evento', 'Horário', 'Local', 'Responsável']],
      body: eventosDaSemanaSelecionada.map(ev => {
          const dataObj = new Date(ev.dataEvento + 'T00:00:00'); 
          return [
              new Date(ev.dataEvento + 'T00:00:00').toLocaleDateString('pt-BR'),
              DIAS_SEMANA_MAPA_DISPLAY[dataObj.getDay()] || '',
              ev.titulo, 
              `${ev.horaInicio} - ${ev.horaFim}`, 
              ev.local || 'N/A', 
              ev.responsavel || 'N/A'
          ];
      }),
      styles: {
        halign: 'center',
        valign: 'middle',
        fontSize: 11,
        cellPadding: 4,
      },
      headStyles: {
        fillColor: [8, 76, 244],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 12,
      },
      alternateRowStyles: { fillColor: [245, 247, 255] },
      tableLineColor: [8, 76, 244],
      tableLineWidth: 0.2,
      margin: { left: 8, right: 8 },
    });

    doc.save(`relatorio-eventos-${dataInicioFormatada}_${dataFimFormatada}.pdf`);
  };
  
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e3e9f9 0%, #f5f7ff 100%)' }}>
      <Navbar />
      <div style={{ maxWidth: 900, margin: '40px auto', background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(8,76,244,0.08)', padding: '32px 24px' }}>
        <h1 style={{ color: '#084cf4', textAlign: 'center', marginBottom: 32, fontWeight: 700, letterSpacing: 1 }}>Relatório de Eventos da Semana</h1>
        <button 
          onClick={gerarPDF} 
          disabled={eventosDaSemanaSelecionada.length === 0} 
          style={{ 
            margin: '0 auto 32px', 
            display: 'block', 
            padding: '10px 20px', 
            backgroundColor: '#084cf4', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px', 
            cursor: 'pointer', 
            fontSize: '16px', 
            opacity: eventosDaSemanaSelecionada.length === 0 ? 0.5 : 1 
          }}
        >
          Gerar PDF
        </button>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#f5f7ff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(8,76,244,0.06)' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #084cf4 0%, #1976d2 100%)' }}>
                <th style={{ color: '#fff', padding: 12, fontWeight: 700, fontSize: 16 }}>Dia</th>
                <th style={{ color: '#fff', padding: 12, fontWeight: 700, fontSize: 16 }}>Data</th>
                <th style={{ color: '#fff', padding: 12, fontWeight: 700, fontSize: 16 }}>Evento</th>
                <th style={{ color: '#fff', padding: 12, fontWeight: 700, fontSize: 16 }}>Horário</th>
                <th style={{ color: '#fff', padding: 12, fontWeight: 700, fontSize: 16 }}>Local</th>
                <th style={{ color: '#fff', padding: 12, fontWeight: 700, fontSize: 16 }}>Responsável</th>
              </tr>
            </thead>
            <tbody>
              {eventosDaSemanaSelecionada.length > 0 ? eventosDaSemanaSelecionada.map((evento, idx) => (
                <tr key={evento.id} style={{ background: idx % 2 === 0 ? '#fff' : '#f5f7ff' }}> {/* Usar evento.id como chave */}
                  <td style={{ padding: 10, textAlign: 'center', fontWeight: 600 }}>{DIAS_SEMANA_MAPA_DISPLAY[new Date(evento.dataEvento + 'T00:00:00').getDay()] || ''}</td>
                  <td style={{ padding: 10, textAlign: 'center' }}>{new Date(evento.dataEvento + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                  <td style={{ padding: 10, textAlign: 'center' }}>{evento.titulo}</td>
                  <td style={{ padding: 10, textAlign: 'center' }}>{`${evento.horaInicio} - ${evento.horaFim}`}</td>
                  <td style={{ padding: 10, textAlign: 'center' }}>{evento.local || 'N/A'}</td>
                  <td style={{ padding: 10, textAlign: 'center' }}>{evento.responsavel || 'N/A'}</td>
                </tr>
              )) : (<tr><td colSpan={6} style={{textAlign: 'center', padding: '20px'}}>Nenhum evento encontrado para esta semana.</td></tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RelatorioSemanalPage;