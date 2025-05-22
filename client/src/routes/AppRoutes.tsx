import { useRoutes } from "react-router";
import { CadastroPage } from "../pages/CadastroPage/CadastroPage";
import { CalendarioPage } from "../pages/CalendarioPage/calendarioPage";
import { LoginPage } from "../pages/LoginPage/LoginPage";

export default function AppRoutes() {
  return useRoutes([

    { path: '/',       element: <LoginPage /> },
    { path: '/cadastro', element: <CadastroPage /> },
    { path: '/home',     element: <CalendarioPage /> }
  ]
)
};