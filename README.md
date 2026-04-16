# 🏟️ UNIFOR Sports: Sistema de Agendamento e Alocação de Espaços

## 📖 Sobre o Projeto
Este projeto nasceu para resolver uma dor real de gestão de recursos físicos dentro do campus da Universidade de Fortaleza (UNIFOR): a dificuldade e a ineficiência do agendamento manual das quadras e ginásios esportivos.

Desenvolvido como uma prova de conceito (PoC), o sistema digitaliza todo o fluxo de reservas, garantindo que não haja choque de horários entre professores e turmas. O grande destaque é a sua ponte com o mundo físico: após a consolidação dos agendamentos, o sistema compila e gera automaticamente relatórios em PDF com a grade completa, prontos para serem impressos e afixados nos murais dos complexos esportivos.

## 🚀 Funcionalidades Principais
* **Alocação de Recursos:** Interface intuitiva para a seleção de datas, horários, quadras e ginásios específicos.
* **Prevenção de Conflitos:** Validação algorítmica no momento da reserva para impedir *double-booking* (agendamentos simultâneos no mesmo espaço).
* **Automação de Relatórios (Exportação PDF):** Motor de geração de documentos estruturados que compila a grade de horários diária/semanal em um formato limpo e legível para impressão rápida.
* **Gestão Centralizada:** Substituição do controle em papel/planilhas descentralizadas por um banco de dados único e confiável.

## 🛠️ Tecnologias Utilizadas
* **[Seu Front-end, ex: React.js / HTML+CSS+JS Vanilla]** (Criação da interface de agendamento).
* **[Seu Back-end, ex: Node.js / Python / Java]** (Lógica de validação de horários e persistência).
* **[Biblioteca de PDF, ex: PDFKit / jsPDF / ReportLab]** (Motor de renderização dos relatórios para impressão).
* **[Seu Banco de Dados, ex: PostgreSQL / MySQL]** (Armazenamento das reservas e recursos físicos).

