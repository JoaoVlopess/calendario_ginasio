// CadastroForm.tsx
import React, { useState } from 'react';
import styles from "./CadastroForm.module.css";
import axios from 'axios'; // Importar axios diretamente
import { useNavigate } from 'react-router'; // 1. Importar useNavigate




export const CadastroForm = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const navigate = useNavigate(); // 2. Inicializar useNavigate
  const [matricula, setMatricula] = useState('');
  const [dataNascimento, setDataNascimento] = useState(''); // Formato YYYY-MM-DD do input date

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
        console.log('handleSubmit chamado!'); // Adicione este log

    setError(null);
    setSuccess(null);

     if (!nome || !email || !senha || !dataNascimento) {
      setError("Por favor, preencha nome, email, senha e data de nascimento.");
      return;
    }

        // Gerar matrícula com 8 números aleatórios
    let matriculaGerada = '';
    for (let i = 0; i < 8; i++) {
      matriculaGerada += Math.floor(Math.random() * 10).toString();
    }

    const userData = {
      nome,
      email,
      senha,
      matricula: matriculaGerada,
      // A API espera um formato ISO. O input date fornece YYYY-MM-DD.
      // new Date(dataNascimento) criará a data à meia-noite no fuso horário local.
      // .toISOString() converterá para UTC.
      dataNascimento: new Date(dataNascimento).toISOString(),
    };
        console.log("CadastroForm: Enviando dados de cadastro para API:", userData);


    try {
            // Usar axios diretamente com a URL completa do backend
      const response = await axios.post('https://fastcalendarbd.onrender.com/usuarios', userData, {
        headers: { 'Content-Type': 'application/json' }
      });
            console.log("CadastroForm: Resposta da API (cadastro):", response);

      console.log('Usuário cadastrado:', response.data);
      setSuccess('Usuário cadastrado com sucesso!');
      // Limpar formulário (opcional)
      setNome('');
      setEmail('');
      setSenha('');
  
      setDataNascimento('');

      navigate('/'); // 3. Redirecionar para a página de login (assumindo que '/' é a rota)

    } catch (err: any) {
      console.error('CadastroForm: Erro ao cadastrar usuário:', err.response || err.message, err);
      setError(err.response?.data?.message || 'Erro ao cadastrar usuário. Tente novamente.');
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {error && <p className={styles.errorMessage}>{error}</p>}
      {success && <p className={styles.successMessage}>{success}</p>}
      <input type="text" placeholder="Seu nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
      <input type="email" placeholder="Seu email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input type="password" placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} required />
      <input type="date" placeholder="Data de Nascimento" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} required title="Data de Nascimento" />
      <button type="submit">Cadastrar</button>
    </form>
  );
}