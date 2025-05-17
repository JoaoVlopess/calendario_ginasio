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

//     {
//       path: '/curso/:cursoId',
//       element: <CursoLayout />,
//       children: [
//         { path: 'aula/:aulaId', element: <AulaPage /> },
//         { index: true, element: <Navigate to="aula/1" replace /> }
//         //essa rota será acionada quando o usuário acessar exatamente o caminho da rota pai
//       ]
//     },

//     { path: '*', element: <NotFoundPage /> }
//   ]);
}