# Documentação do Sistema AlertaMed

Este documento descreve a estrutura e funcionalidade de cada arquivo principal do sistema AlertaMed, um aplicativo para gerenciamento de medicamentos em casas de repouso e ambientes hospitalares.

## Estrutura do Projeto

O projeto está dividido em duas partes principais:

1. **Frontend** (`sistema-medicamentos/`): Aplicação React que fornece a interface do usuário
2. **Backend** (`backend-custom/`): Servidor Express que fornece a API para o frontend, integra com Supabase, PostgreSQL, Prometheus e Telegram.

## Arquivos do Backend

### `backend-custom/server.js`
- **Função**: Servidor Express principal que define as rotas da API
- **Descrição**: Configura o servidor Express, define middleware (CORS, bodyParser, JWT), integra Prometheus para métricas, e implementa rotas para gerenciar pacientes, medicamentos, estoque, histórico e autenticação. Conecta-se ao banco de dados PostgreSQL e Supabase.
- **Rotas Principais**:
  - GET `/pacientes`: Lista todos os pacientes do usuário autenticado
  - POST `/pacientes`: Cria um novo paciente
  - PUT `/pacientes/:id`: Edita paciente e associações
  - POST `/pacientes/marcar-medicado`: Marca medicamento como medicado e atualiza estoque, dispara alerta Telegram se necessário
  - GET `/estoque/alertas`: Lista medicamentos com estoque baixo
  - GET `/metrics`: Exibe métricas para Prometheus

### `backend-custom/prisma/schema.prisma`
- **Função**: Schema do Prisma ORM
- **Descrição**: Define a estrutura do banco de dados PostgreSQL/Supabase, incluindo tabelas de pacientes, medicamentos, estoque, histórico, perfis e logs. Permite geração automática do client Prisma.

### `backend-custom/routes/`
- **Função**: Rotas organizadas do backend
- **Descrição**: Cada arquivo implementa rotas REST para um recurso (pacientes, medicamentos, estoque, histórico, admin). Inclui lógica de negócio, integração com Telegram e validações.

### `backend-custom/utils/telegram.js`
- **Função**: Integração com o bot do Telegram
- **Descrição**: Função utilitária para enviar alertas automáticos para um grupo/canal do Telegram quando há estoque baixo ou pacientes com medicação atrasada.

## Arquivos do Frontend

### Arquivos de Configuração e Inicialização

#### `sistema-medicamentos/src/App.js`
- **Função**: Componente principal da aplicação
- **Descrição**: Define a estrutura de roteamento da aplicação usando React Router. Gerencia autenticação do usuário, renderiza o cabeçalho (Header) e protege rotas.

#### `sistema-medicamentos/src/index.js`
- **Função**: Ponto de entrada da aplicação React
- **Descrição**: Renderiza o componente App no elemento root do DOM.

#### `sistema-medicamentos/src/routesConfig.js`
- **Função**: Configuração de rotas
- **Descrição**: Define as constantes para as rotas da aplicação, facilitando a manutenção.

### Serviços e Hooks

#### `sistema-medicamentos/src/services/supabaseClient.js`
- **Função**: Cliente Supabase
- **Descrição**: Configura e exporta o cliente Supabase para autenticação e armazenamento de dados.

#### `sistema-medicamentos/src/services/api.js`
- **Função**: Cliente Axios para API Express
- **Descrição**: Centraliza as chamadas HTTP para o backend Express.

#### `sistema-medicamentos/src/hooks/useAuth.js`
- **Função**: Hook personalizado para autenticação
- **Descrição**: Fornece funcionalidades de autenticação para os componentes, incluindo login, logout e verificação de estado de autenticação.

### Componentes de Autenticação

#### `sistema-medicamentos/src/components/Auth/login.js`
- **Função**: Componente de login
- **Descrição**: Formulário de login usando Supabase.

#### `sistema-medicamentos/src/components/Auth/signUp.js`
- **Função**: Componente de cadastro
- **Descrição**: Cadastro de novos usuários via Supabase.

### Componentes de Pacientes

#### `sistema-medicamentos/src/components/Pacientes/PacienteList.js`
- **Função**: Lista de pacientes para medicação
- **Descrição**: Exibe pacientes disponíveis, atrasados e já medicados. Permite marcar como medicado, atualiza estoque e dispara alertas visuais e históricos.

#### `sistema-medicamentos/src/components/Pacientes/PacienteManager.js`
- **Função**: Gerenciamento de pacientes
- **Descrição**: Permite adicionar, editar e excluir pacientes. Exibe lista de pacientes em cards.

#### `sistema-medicamentos/src/components/Pacientes/AdicionarPaciente.js`
- **Função**: Formulário para adicionar pacientes
- **Descrição**: Cadastro de novos pacientes.

#### `sistema-medicamentos/src/components/Pacientes/EditarPaciente.js`
- **Função**: Formulário para editar pacientes
- **Descrição**: Permite editar informações e associações de medicamentos do paciente.

### Componentes de Medicamentos e Estoque

#### `sistema-medicamentos/src/components/Medicamentos/estoqueMedicamentos.js`
- **Função**: Gerenciamento de estoque de medicamentos
- **Descrição**: Visualiza, adiciona, edita e exclui medicamentos do estoque. Exibe alertas de estoque baixo.

#### `sistema-medicamentos/src/components/Medicamentos/medicamentoCadastro.js`
- **Função**: Cadastro de medicamentos
- **Descrição**: Formulário para cadastrar novos medicamentos.

#### `sistema-medicamentos/src/components/Estoque/estoqueMedicamentos.js`
- **Função**: Interface para controle de estoque
- **Descrição**: Permite adicionar, editar quantidades e visualizar alertas de estoque baixo.

### Componentes de Histórico

#### `sistema-medicamentos/src/components/Historico/HistoricoMedicados.js`
- **Função**: Histórico de medicações
- **Descrição**: Exibe registro de todas as medicações administradas, agrupadas por dia.

### Componentes Compartilhados

#### `sistema-medicamentos/src/components/Shared/Header.js`
- **Função**: Cabeçalho da aplicação
- **Descrição**: Exibe o menu de navegação, informações do usuário e logout.

#### `sistema-medicamentos/src/components/Horario/horarioAtual.js`
- **Função**: Componente de horário
- **Descrição**: Exibe o horário atual, utilizado para determinar pacientes a serem medicados.

## Integrações, Observabilidade e Deploy

- **Prometheus/Grafana**: Métricas expostas em `/metrics` para monitoramento e visualização do backend.
- **Telegram**: Alertas automáticos de estoque baixo e pacientes atrasados enviados para grupo/canal.
- **Docker**: Projeto pronto para deploy com Docker e Docker Compose, facilitando execução em qualquer ambiente.
- **CI/CD**: Integração contínua e deploy automático via GitHub Actions e Vercel (frontend).

## Fluxo de Dados

1. O usuário se autentica via Supabase
2. Pode visualizar e gerenciar pacientes, medicamentos e estoque
3. Marcar pacientes como medicados atualiza o estoque e pode disparar alertas (Telegram)
4. Alertas de estoque baixo e pacientes atrasados são enviados ao Telegram
5. Métricas do sistema podem ser monitoradas via Prometheus/Grafana
6. O deploy pode ser feito facilmente via Docker Compose

## Banco de Dados

- **PostgreSQL/Supabase**: Estrutura detalhada em `ESTRUTURA_BANCO.MD` e `schema.prisma`.
- Tabelas principais: `pacientes`, `medicamentos`, `estoque_medicamentos`, `paciente_medicamentos`, `historico_doses`, `logs_auditoria`, `perfis`.

## Tecnologias Utilizadas

- **Frontend**: React.js, React Router, React Hooks
- **Backend**: Express.js, Supabase, Prisma ORM, Prometheus, Telegram Bot
- **Banco de Dados**: PostgreSQL, Supabase
- **Estilização**: CSS personalizado
- **Observabilidade**: Prometheus, Grafana
- **Alertas**: Telegram
- **Containerização**: Docker, Docker Compose
- **CI/CD**: GitHub Actions, Vercel
