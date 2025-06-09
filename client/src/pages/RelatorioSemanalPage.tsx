import React from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Navbar from '../components/Navbar/Navbar';
import styles from '../components/Navbar/Navbar.module.css';

// Exemplo de eventos mockados (substitua pela sua fonte real de dados se necessário)
const eventosSemana = [
  { dia: 'Segunda', titulo: 'Futsal Treino', hora: '07:30 - 08:30', local: 'Quadra A', responsavel: 'Prof. Silva' },
  { dia: 'Segunda', titulo: 'Vôlei Comp.', hora: '08:00 - 09:00', local: 'Ginásio', responsavel: 'Prof. Ana' },
  { dia: 'Terça', titulo: 'Basquete Livre', hora: '08:30 - 09:30', local: 'Quadra B', responsavel: 'N/A' },
  { dia: 'Quarta', titulo: 'Futsal Treino', hora: '07:30 - 08:30', local: 'Quadra A', responsavel: 'Prof. Silva' },
  // ... adicione mais eventos conforme necessário
];

const gerarPDF = () => {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text('Relatório Semanal de Eventos', 14, 18);
  doc.setFontSize(12);

  autoTable(doc, {
    startY: 28,
    head: [[
      'Dia', 'Evento', 'Horário', 'Local', 'Responsável'
    ]],
    body: eventosSemana.map(ev => [ev.dia, ev.titulo, ev.hora, ev.local, ev.responsavel]),
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

  doc.save('relatorio-semanal.pdf');
};

const RelatorioSemanalPage: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e3e9f9 0%, #f5f7ff 100%)' }}>
      <Navbar />
      <div style={{ maxWidth: 900, margin: '40px auto', background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(8,76,244,0.08)', padding: '32px 24px' }}>
        <h1 style={{ color: '#084cf4', textAlign: 'center', marginBottom: 32, fontWeight: 700, letterSpacing: 1 }}>Relatório Semanal</h1>
        <button onClick={gerarPDF} className={styles.navbarButton} style={{ margin: '0 auto 32px', display: 'block' }}>
          Gerar PDF
        </button>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#f5f7ff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(8,76,244,0.06)' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #084cf4 0%, #1976d2 100%)' }}>
                <th style={{ color: '#fff', padding: 12, fontWeight: 700, fontSize: 16 }}>Dia</th>
                <th style={{ color: '#fff', padding: 12, fontWeight: 700, fontSize: 16 }}>Evento</th>
                <th style={{ color: '#fff', padding: 12, fontWeight: 700, fontSize: 16 }}>Horário</th>
                <th style={{ color: '#fff', padding: 12, fontWeight: 700, fontSize: 16 }}>Local</th>
                <th style={{ color: '#fff', padding: 12, fontWeight: 700, fontSize: 16 }}>Responsável</th>
              </tr>
            </thead>
            <tbody>
              {eventosSemana.map((evento, idx) => (
                <tr key={idx} style={{ background: idx % 2 === 0 ? '#fff' : '#f5f7ff' }}>
                  <td style={{ padding: 10, textAlign: 'center', fontWeight: 600 }}>{evento.dia}</td>
                  <td style={{ padding: 10, textAlign: 'center' }}>{evento.titulo}</td>
                  <td style={{ padding: 10, textAlign: 'center' }}>{evento.hora}</td>
                  <td style={{ padding: 10, textAlign: 'center' }}>{evento.local}</td>
                  <td style={{ padding: 10, textAlign: 'center' }}>{evento.responsavel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RelatorioSemanalPage; 