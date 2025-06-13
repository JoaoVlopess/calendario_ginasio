import React from 'react';
import { Navigate, Outlet } from 'react-router';

const isAuthenticated = (): boolean => {
  // Verifica se as credenciais para HTTP Basic Auth estão no localStorage
  const email = localStorage.getItem('userEmail');
  const password = localStorage.getItem('userPassword'); // Lembre-se do aviso de segurança sobre armazenar senhas assim
  return !!email && !!password; // Retorna true se ambos existirem
};

const ProtectedRoute: React.FC = () => {
  if (!isAuthenticated()) {
    // Se não estiver "autenticado" (credenciais não presentes), redireciona para a página de login
    return <Navigate to="/" replace />;
  }

  // Se estiver "autenticado", renderiza o componente filho (a rota protegida)
  return <Outlet />;
};

export default ProtectedRoute;