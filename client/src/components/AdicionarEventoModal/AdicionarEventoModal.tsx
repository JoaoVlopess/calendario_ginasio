// src/components/AdicionarEventoModal/AdicionarEventoModal.tsx
import  { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import type { Evento, DiaDaSemana } from '../../types/evento';
// Crie ou reutilize um arquivo CSS para este modal, por exemplo:
// import styles from './AdicionarEventoModal.module.css';
// Por enquanto, vamos assumir que os estilos são similares ao EditarEvento.module.css
import styles from '../EditarEvento/EditarEvento.module.css'; // Reutilizando estilos para exemplo
import { FiCheck } from 'react-icons/fi';
import { getBlocosSelecionaveis, type BlocoSelecionavel } from '../../types/HorariosConfig';


const DIAS_SEMANA_OPCOES: DiaDaSemana[] = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];

// Dados que o modal precisa para criar um evento (sem id e dataCriacao)
export type DadosNovoEvento = Omit<Evento, 'id' | 'dataCriacao'>;

interface AdicionarEventoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (novoEventoData: DadosNovoEvento) => void;
  dataSelecionada?: Date; // Para pré-selecionar o dia
  horaSelecionada?: string; // Para pré-selecionar a hora
}

const blocosDisponiveis = getBlocosSelecionaveis();


// Estado inicial para o formulário de novo evento
const estadoInicialFormulario: Partial<DadosNovoEvento> = {
  titulo: '',
  descricao: '',
    dataEvento: new Date().toISOString().split('T')[0], // Padrão para hoje "YYYY-MM-DD"

  horaInicio: blocosDisponiveis.length > 0 ? blocosDisponiveis[0].horaInicio : '',
  horaFim: blocosDisponiveis.length > 0 ? blocosDisponiveis[0].horaFim : '',
  diasDaSemana: [],
  responsavel: '',
  local: '',
  cor: '#81c784', // Cor padrão
};

export const AdicionarEventoModal: React.FC<AdicionarEventoModalProps> = ({
  isOpen,
  onClose,
  onSave,
  dataSelecionada,
  horaSelecionada,
}) => {
    const [formData, setFormData] = useState<Partial<DadosNovoEvento>>(estadoInicialFormulario);
  const [blocoSelecionadoValue, setBlocoSelecionadoValue] = useState<string>(blocosDisponiveis.length > 0 ? blocosDisponiveis[0].value : '');

  // Resetar formulário quando o modal é aberto
  useEffect(() => {
    if (isOpen) {
      let initialState = { ...estadoInicialFormulario };
      let initialBlocoValue = blocosDisponiveis.length > 0 ? blocosDisponiveis[0].value : '';
      

      if (dataSelecionada) { // dataSelecionada é um objeto Date do clique no grid
        initialState = { ...initialState, dataEvento: dataSelecionada.toISOString().split('T')[0] };
        const diaNum = dataSelecionada.getDay(); // 0 (Dom) - 6 (Sab)
        // Ajustar mapeamento para DiaDaSemana[] (segunda, terca, ...)
        // Domingo (0) vira o último (índice 6), Segunda (1) vira o primeiro (índice 0)
        const diaSemana = DIAS_SEMANA_OPCOES[(diaNum === 0 ? 6 : diaNum - 1)];

                initialState = { ...initialState, diasDaSemana: [diaSemana] };

       
      }

      if (horaSelecionada) {
        // Garante que a hora está no formato HH:MM
        const horaFormatada = horaSelecionada.substring(0, 5);
               const blocoPreSelecionado = blocosDisponiveis.find(b => b.horaInicio === horaFormatada);
        if (blocoPreSelecionado) {
          initialState = { ...initialState, horaInicio: blocoPreSelecionado.horaInicio, horaFim: blocoPreSelecionado.horaFim };
          initialBlocoValue = blocoPreSelecionado.value;
        }
      }
      setFormData(initialState);
      setBlocoSelecionadoValue(initialBlocoValue);

    }
  }, [isOpen, dataSelecionada, horaSelecionada]);


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "blocoHorario") {
      setBlocoSelecionadoValue(value);
      const blocoEscolhido = blocosDisponiveis.find(b => b.value === value);
      if (blocoEscolhido) {
        setFormData(prev => ({ ...prev, horaInicio: blocoEscolhido.horaInicio, horaFim: blocoEscolhido.horaFim }));
      }
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    }
  };

  const handleDiasSemanaChange = (dia: DiaDaSemana) => {
    setFormData((prevFormData) => {
      // Se o dia clicado já é o único selecionado, desmarca (array vazio).
      // Caso contrário, define o dia clicado como o único selecionado.
      const novosDias = (prevFormData.diasDaSemana?.length === 1 && prevFormData.diasDaSemana[0] === dia)
        ? []
        : [dia];
      return { ...prevFormData, diasDaSemana: novosDias };
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
      if (!formData.titulo || !formData.dataEvento || !blocoSelecionadoValue ) {
      alert('Por favor, preencha: Título, Data do Evento e Bloco de Horário.');
      return;
    }
        // Derivar diasDaSemana a partir da dataEvento para consistência,
    // já que o backend espera um único dia da semana associado à data específica.
    const dataObj = new Date(formData.dataEvento! + "T00:00:00"); // Adiciona T00:00:00 para evitar problemas de fuso
    const diaNum = dataObj.getDay();
    const diaSemanaCalculado = DIAS_SEMANA_OPCOES[(diaNum === 0 ? 6 : diaNum - 1)];

    const novoEventoData: DadosNovoEvento = {
      titulo: formData.titulo,
      dataEvento: formData.dataEvento!,
      diasDaSemana: [diaSemanaCalculado], // Usar o dia da semana derivado da dataEvento
      horaInicio: formData.horaInicio!, // Asseguramos que está definido pela seleção do bloco
      horaFim: formData.horaFim!,
      responsavel: formData.responsavel || null,
      descricao: formData.descricao || '',
      local: formData.local || '',
      cor: formData.cor || '#81c784',
    };
    console.log("AdicionarEventoModal: Enviando dados para onSave:", novoEventoData);

    onSave(novoEventoData);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2>Adicionar Novo Evento</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="titulo-novo">Título:</label>
            <input type="text" id="titulo-novo" name="titulo" value={formData.titulo || ''} onChange={handleChange} required />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="descricao-novo">Descrição:</label>
            <textarea id="descricao-novo" name="descricao" value={formData.descricao || ''} onChange={handleChange} />
          </div>
                    <div className={styles.formGroup}>
            <label htmlFor="blocoHorario-novo">Bloco de Horário:</label>
            <select
              id="blocoHorario-novo"
              name="blocoHorario"
              value={blocoSelecionadoValue}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Selecione um bloco</option>
              {blocosDisponiveis.map(bloco => (
                <option key={bloco.value} value={bloco.value}>{bloco.labelDisplay}</option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>Dias da Semana:</label>
            <div className={styles.checkboxGroup}>
              {DIAS_SEMANA_OPCOES.map((dia) => {
                const isChecked = formData.diasDaSemana?.includes(dia) || false;
                return (
                  <label key={dia} className={styles.checkboxLabel}>
                    <input type="checkbox" className={styles.hiddenCheckbox} checked={isChecked} onChange={() => handleDiasSemanaChange(dia)} />
                    <span className={`${styles.customCheckbox} ${isChecked ? styles.checked : ''}`}>
                      {isChecked && <FiCheck className={styles.checkIcon} />}
                    </span>
                    <span className={styles.checkboxText}>{dia.charAt(0).toUpperCase() + dia.slice(1)}</span>
                  </label>
                );
              })}
            </div>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="responsavel-novo">Responsável:</label>
            <input type="text" id="responsavel-novo" name="responsavel" value={formData.responsavel || ''} onChange={handleChange} />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="local-novo">Local:</label>
            <input type="text" id="local-novo" name="local" value={formData.local || ''} onChange={handleChange} />
          </div>
            <div className={styles.formGroup}>
            <label htmlFor="dataEvento-novo">Data do Evento:</label>
            <input type="date" id="dataEvento-novo" name="dataEvento" value={formData.dataEvento || ''} onChange={handleChange} required />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="cor-novo">Cor do Evento:</label>
            <input type="color" id="cor-novo" name="cor" value={formData.cor || '#81c784'} onChange={handleChange} className={styles.colorPicker} />
          </div>
          <div className={styles.buttonGroup}>
            <button type="button" className={`${styles.button} ${styles.cancelButton}`} onClick={onClose}>Cancelar</button>
            <button type="submit" className={`${styles.button} ${styles.saveButton}`}>Adicionar Evento</button>
          </div>
        </form>
      </div>
    </div>
  );
};