# Documentação do Sistema AlertaMed

Este documento descreve a estrutura e funcionalidade de cada arquivo principal do sistema AlertaMed, um aplicativo para gerenciamento de medicamentos em casas de repouso e ambientes hospitalares.

## Estrutura do Projeto

O projeto está dividido em duas partes principais:

1. **Frontend** (`sistema-medicamentos/`): Aplicação React que fornece a interface do usuário
2. **Backend** (`backend/`): Servidor Express que fornece a API para o frontend

## Arquivos do Backend

### `backend/server.js`
- **Função**: Servidor Express principal que define as rotas da API
- **Descrição**: Configura o servidor Express, define middleware (CORS, bodyParser) e implementa rotas para gerenciar pacientes e medicamentos. Conecta-se ao banco de dados PostgreSQL.
- **Rotas Principais**:
  - GET `/pacientes`: Lista todos os pacientes com seus medicamentos
  - POST `/pacientes`: Cria um novo paciente
  - GET `/pacientes/:id/medicamentos`: Lista medicamentos de um paciente específico
  - POST `/medicamentos`: Cria um novo medicamento

### `backend/sistemasql.sql`
- **Função**: Script SQL para criação do banco de dados
- **Descrição**: Define a estrutura do banco de dados PostgreSQL, criando as tabelas `pacientes` e `medicamentos` com seus respectivos campos e relações.

## Arquivos do Frontend

### Arquivos de Configuração e Inicialização

#### `sistema-medicamentos/src/App.js`
- **Função**: Componente principal da aplicação
- **Descrição**: Define a estrutura de roteamento da aplicação usando React Router. Gerencia a autenticação do usuário e renderiza o cabeçalho (Header) quando o usuário está autenticado. Redireciona usuários não autenticados para a página de login.

#### `sistema-medicamentos/src/index.js`
- **Função**: Ponto de entrada da aplicação React
- **Descrição**: Renderiza o componente App no elemento root do DOM.

#### `sistema-medicamentos/src/routesConfig.js`
- **Função**: Configuração de rotas
- **Descrição**: Define as constantes para as rotas da aplicação, facilitando a manutenção e evitando erros de digitação.

### Serviços e Hooks

#### `sistema-medicamentos/src/services/supabaseClient.js`
- **Função**: Cliente Supabase
- **Descrição**: Configura e exporta o cliente Supabase para autenticação e armazenamento de dados. Contém as credenciais de conexão com o Supabase.

#### `sistema-medicamentos/src/hooks/useAuth.js`
- **Função**: Hook personalizado para autenticação
- **Descrição**: Fornece funcionalidades de autenticação para os componentes, incluindo login, logout e verificação de estado de autenticação.

### Componentes de Autenticação

#### `sistema-medicamentos/src/components/Auth/login.js`
- **Função**: Componente de login
- **Descrição**: Fornece um formulário para que os usuários façam login no sistema. Utiliza o Supabase para autenticação.

#### `sistema-medicamentos/src/components/Auth/signUp.js`
- **Função**: Componente de cadastro
- **Descrição**: Permite que novos usuários se cadastrem no sistema. Valida os dados do formulário e cria uma nova conta usando o Supabase.

### Componentes de Pacientes

#### `sistema-medicamentos/src/components/Pacientes/PacienteList.js`
- **Função**: Lista de pacientes para medicação
- **Descrição**: Exibe três categorias de pacientes: disponíveis para medicação, com medicação atrasada e já medicados. Permite marcar pacientes como medicados, o que atualiza o estoque automaticamente. Também exibe alertas de estoque baixo.

#### `sistema-medicamentos/src/components/Pacientes/PacienteManager.js`
- **Função**: Gerenciamento de pacientes
- **Descrição**: Permite adicionar, editar e excluir pacientes. Exibe uma lista de pacientes em formato de cards com suas informações básicas.

#### `sistema-medicamentos/src/components/Pacientes/AdicionarPaciente.js`
- **Função**: Formulário para adicionar pacientes
- **Descrição**: Permite cadastrar novos pacientes no sistema, coletando informações como nome, idade, data de nascimento e quarto.

#### `sistema-medicamentos/src/components/Pacientes/EditarPaciente.js`
- **Função**: Formulário para editar pacientes
- **Descrição**: Permite editar informações de pacientes existentes. Carrega os dados atuais do paciente e permite modificá-los.

### Componentes de Medicamentos

#### `sistema-medicamentos/src/components/Medicamentos/estoqueMedicamentos.js`
- **Função**: Gerenciamento de estoque de medicamentos
- **Descrição**: Permite visualizar, adicionar, editar e excluir medicamentos do estoque. Exibe informações detalhadas sobre cada medicamento.

#### `sistema-medicamentos/src/components/Medicamentos/medicamentoCadastro.js`
- **Função**: Cadastro de medicamentos
- **Descrição**: Formulário para cadastrar novos medicamentos no sistema, incluindo nome, descrição, dosagem e outras informações relevantes.

#### `sistema-medicamentos/src/components/Estoque/estoqueMedicamentos.js`
- **Função**: Gerenciamento de estoque
- **Descrição**: Interface para controle de estoque de medicamentos. Permite adicionar novos medicamentos ao estoque, editar quantidades e visualizar alertas de estoque baixo.

### Componentes de Histórico

#### `sistema-medicamentos/src/components/Historico/HistoricoMedicados.js`
- **Função**: Histórico de medicações
- **Descrição**: Exibe um registro de todas as medicações administradas, agrupadas por dia. Permite filtrar por paciente, medicamento, data e horário.

### Componentes Compartilhados

#### `sistema-medicamentos/src/components/Shared/Header.js`
- **Função**: Cabeçalho da aplicação
- **Descrição**: Exibe o menu de navegação da aplicação, com links para as diferentes seções. Também mostra informações do usuário logado e opção de logout.

#### `sistema-medicamentos/src/components/Horario/horarioAtual.js`
- **Função**: Componente de horário
- **Descrição**: Exibe o horário atual, utilizado para determinar quais pacientes precisam ser medicados.

## Fluxo de Dados

1. O usuário se autentica através dos componentes de login/cadastro
2. Após autenticação, o usuário pode:
   - Visualizar e gerenciar pacientes (PacienteList, PacienteManager)
   - Adicionar ou editar pacientes (AdicionarPaciente, EditarPaciente)
   - Gerenciar o estoque de medicamentos (EstoqueMedicamentos)
   - Marcar pacientes como medicados, o que atualiza o estoque
   - Visualizar o histórico de medicações (HistoricoMedicados)

## Banco de Dados

O sistema utiliza duas abordagens para armazenamento de dados:

1. **PostgreSQL** (conforme definido em `sistemasql.sql`):
   - Tabela `pacientes`: Armazena informações dos pacientes
   - Tabela `medicamentos`: Armazena informações dos medicamentos

2. **Supabase**:
   - Utilizado para autenticação de usuários
   - Armazena dados de pacientes, medicamentos, estoque e histórico de medicações
   - Tabelas incluem: `pacientes`, `medicamentos`, `estoque_medicamentos`, `paciente_medicamentos`

## Tecnologias Utilizadas

- **Frontend**: React.js, React Router, React Hooks
- **Backend**: Express.js, Supabase
- **Banco de Dados**: PostgreSQL, Supabase
- **Estilização**: CSS personalizado
- **Análise**: Vercel Analytics
