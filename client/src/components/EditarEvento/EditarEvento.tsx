// src/components/EditarEventoModal/EditarEventoModal.tsx
import React, { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import type { Evento, DiaDaSemana } from '../../types/evento'; // Certifique-se que o caminho está correto
import styles from './EditarEvento.module.css';
import { FiCheck } from 'react-icons/fi'; // Importando um ícone de "check"

// Interface de Props para o Modal
interface EditarEventoModalProps {
  evento: Evento | null; // O evento a ser editado, ou null se nenhum (embora o modal só abra se houver um evento)
  isOpen: boolean;       // Controla a visibilidade do modal
  onClose: () => void;   // Função para fechar o modal
  onSave: (eventoAtualizado: Evento) => void; // Função para salvar o evento atualizado
  onDelete: (eventoId: string) => void;      // Função para deletar o evento
}

const DIAS_SEMANA_OPCOES: DiaDaSemana[] = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];

export const EditarEventoModal: React.FC<EditarEventoModalProps> = ({
  evento,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  // Estado para os dados do formulário
  // Usamos Partial<Evento> para permitir que o formulário seja construído gradualmente
  // e inicializamos com um objeto vazio para evitar problemas com controlled/uncontrolled inputs
  const [formData, setFormData] = useState<Partial<Evento>>({});

  // Efeito para popular o formulário quando um evento é passado ou o modal é aberto/fechado
  useEffect(() => {
    if (isOpen && evento) {
      setFormData({ ...evento }); // Preenche o formulário com os dados do evento selecionado
    } else if (!isOpen) {
      // Opcional: Limpar o formulário quando o modal é fechado,
      // embora ele seja repopulado quando reaberto com um novo 'evento'.
      // setFormData({});
    }
  }, [evento, isOpen]); // Dependências do efeito

  // Manipulador para mudanças nos inputs de texto, textarea e select
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  // Manipulador para mudanças nos checkboxes de dias da semana
  const handleDiasSemanaChange = (dia: DiaDaSemana) => {
    setFormData((prevFormData) => {
      const diasAtuais = prevFormData.diasDaSemana ? [...prevFormData.diasDaSemana] : [];
      let novosDias: DiaDaSemana[];
      if (diasAtuais.includes(dia)) {
        novosDias = diasAtuais.filter((d) => d !== dia); // Remove o dia
      } else {
        novosDias = [...diasAtuais, dia]; // Adiciona o dia
      }
      return { ...prevFormData, diasDaSemana: novosDias };
    });
  };

  // Manipulador para submeter o formulário (Salvar)
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault(); // Previne o comportamento padrão de submissão do formulário
    if (evento) { // Garante que temos um evento original para pegar o ID e outros dados não editáveis
      // Combina os dados originais do evento com os dados modificados do formulário.
      // Isso é importante para manter campos como 'id' e 'dataCriacao' intactos.
      // E garante que todos os campos de 'Evento' estão presentes.
      const eventoAtualizado: Evento = {
        ...evento,       // Começa com todos os dados do evento original
        ...formData,     // Sobrescreve com os dados do formulário que foram alterados
        id: evento.id,   // Garante que o ID original seja mantido
      };
      onSave(eventoAtualizado);
    }
  };

  // Manipulador para o botão de Deletar
  const handleDelete = () => {
    if (evento && evento.id) { // Garante que temos um ID de evento para deletar
      onDelete(evento.id);
    }
  };

  // Se o modal não estiver aberto ou não houver evento selecionado, não renderiza nada
  if (!isOpen || !evento) {
    return null;
  }

  // JSX do modal
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>Editar Evento</h2> {/* O título poderia ser dinâmico se usado para criar também */}
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="titulo">Título:</label>
            <input
              type="text"
              id="titulo"
              name="titulo"
              value={formData.titulo || ''}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="descricao">Descrição:</label>
            <textarea
              id="descricao"
              name="descricao"
              value={formData.descricao || ''}
              onChange={handleChange}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="horaInicio">Hora Início:</label>
              <input
                type="time"
                id="horaInicio"
                name="horaInicio"
                value={formData.horaInicio || '00:00'}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="horaFim">Hora Fim:</label>
              <input
                type="time"
                id="horaFim"
                name="horaFim"
                value={formData.horaFim || '00:00'}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Dias da Semana:</label>
            <div className={styles.checkboxGroup}>
              {DIAS_SEMANA_OPCOES.map((dia) => {
                const isChecked = formData.diasDaSemana?.includes(dia) || false;
                return (
                  <label key={dia} className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      className={styles.hiddenCheckbox}
                      checked={isChecked}
                      onChange={() => handleDiasSemanaChange(dia)}
                    />
                    <span className={`${styles.customCheckbox} ${isChecked ? styles.checked : ''}`}>
                      {isChecked && <FiCheck className={styles.checkIcon} />}
                    </span>
                    <span className={styles.checkboxText}>
                      {dia.charAt(0).toUpperCase() + dia.slice(1)}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="responsavel">Responsável:</label>
            <input
              type="text"
              id="responsavel"
              name="responsavel"
              value={formData.responsavel || ''}
              onChange={handleChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="local">Local:</label>
            <input
              type="text"
              id="local"
              name="local"
              value={formData.local || ''}
              onChange={handleChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="cor">Cor do Evento:</label>
            <input
              type="color"
              id="cor"
              name="cor"
              value={formData.cor || '#81c784'} // Um valor padrão caso não haja cor
              onChange={handleChange}
              className={styles.colorPicker}
            />
          </div>

          <div className={styles.buttonGroup}>
            <button type="button" className={`${styles.button} ${styles.deleteButton}`} onClick={handleDelete}>
              Excluir Evento
            </button>
            <button type="button" className={`${styles.button} ${styles.cancelButton}`} onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className={`${styles.button} ${styles.saveButton}`}>
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Se você estiver usando export default (ex: export default EditarEventoModal;)
// ajuste conforme necessário. Pelo uso do { EditarEventoModal } na importação,
// o export const é o esperado.