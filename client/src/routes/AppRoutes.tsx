import { useRoutes } from "react-router";
import { CadastroPage } from "../pages/CadastroPage/CadastroPage";
import { CalendarioPage } from "../pages/CalendarioPage/CalendarioPage";
import { LoginPage } from "../pages/LoginPage/LoginPage";
import RelatorioSemanalPage from "../pages/RelatorioSemanalPage";
import GerenciarEventosPage from "../pages/GerenciarEventosPage";

export default function AppRoutes() {
  return useRoutes([
    { path: '/',       element: <LoginPage /> },
    { path: '/cadastro', element: <CadastroPage /> },
    { path: '/home',     element: <CalendarioPage /> },
    { path: '/relatorio-semanal', element: <RelatorioSemanalPage /> },
    { path: '/gerenciar-eventos', element: <GerenciarEventosPage /> }
  ]
)
};