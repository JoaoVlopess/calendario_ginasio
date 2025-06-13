// src/components/AdicionarEventoModal/AdicionarEventoModal.tsx
import  { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import type { Evento, DiaDaSemana } from '../../types/evento';
// Crie ou reutilize um arquivo CSS para este modal, por exemplo:
// import styles from './AdicionarEventoModal.module.css';
// Por enquanto, vamos assumir que os estilos são similares ao EditarEvento.module.css
import styles from '../EditarEvento/EditarEvento.module.css'; // Reutilizando estilos para exemplo
import { FiCheck } from 'react-icons/fi';

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

// Estado inicial para o formulário de novo evento
const estadoInicialFormulario: Partial<DadosNovoEvento> = {
  titulo: '',
  descricao: '',
  horaInicio: '09:00',
  horaFim: '10:00',
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

  // Resetar formulário quando o modal é aberto
  useEffect(() => {
    if (isOpen) {
     let initialState = { ...estadoInicialFormulario }; // Começa com o estado padrão

      if (dataSelecionada) {
        const diaNum = dataSelecionada.getDay(); // 0 (Dom) - 6 (Sab)
        // Ajustar mapeamento para DiaDaSemana[] (segunda, terca, ...)
        // Domingo (0) vira o último (índice 6), Segunda (1) vira o primeiro (índice 0)
        const diaSemana = DIAS_SEMANA_OPCOES[(diaNum === 0 ? 6 : diaNum - 1)];
        initialState = { ...initialState, diasDaSemana: [diaSemana] };
      }

      if (horaSelecionada) {
        // Garante que a hora está no formato HH:MM
        const horaFormatada = horaSelecionada.substring(0, 5);
        initialState = { ...initialState, horaInicio: horaFormatada };
        
        // Opcional: Define horaFim uma hora depois de horaInicio
        // const [h, m] = horaFormatada.split(':').map(Number);
        // const fimDate = new Date();
        // fimDate.setHours(h + 1, m, 0, 0);
        // initialState = { ...initialState, horaFim: fimDate.toTimeString().substring(0,5) };
      }
      setFormData(initialState);
    }
  }, [isOpen, dataSelecionada, horaSelecionada]);


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleDiasSemanaChange = (dia: DiaDaSemana) => {
    setFormData((prevFormData) => {
      const diasAtuais = prevFormData.diasDaSemana ? [...prevFormData.diasDaSemana] : [];
      const novosDias = diasAtuais.includes(dia)
        ? diasAtuais.filter((d) => d !== dia)
        : [...diasAtuais, dia];
      return { ...prevFormData, diasDaSemana: novosDias };
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.titulo || !formData.horaInicio || !formData.horaFim || !formData.diasDaSemana || formData.diasDaSemana.length === 0) {
      alert('Por favor, preencha: Título, Hora Início, Hora Fim e selecione ao menos um Dia da Semana.');
      return;
    }

    const novoEventoData: DadosNovoEvento = {
      titulo: formData.titulo,
      diasDaSemana: formData.diasDaSemana || [],
      horaInicio: formData.horaInicio,
      horaFim: formData.horaFim,
      responsavel: formData.responsavel || null,
      descricao: formData.descricao || '',
      local: formData.local || '',
      cor: formData.cor || '#81c784',
    };
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
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="horaInicio-novo">Hora Início:</label>
              <input type="time" id="horaInicio-novo" name="horaInicio" value={formData.horaInicio || '00:00'} onChange={handleChange} required />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="horaFim-novo">Hora Fim:</label>
              <input type="time" id="horaFim-novo" name="horaFim" value={formData.horaFim || '00:00'} onChange={handleChange} required />
            </div>
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