# Estrutura do Banco de Dados - AlertaMed

Este documento detalha a estrutura do banco de dados utilizado pelo sistema AlertaMed, incluindo tabelas, campos e relações.

## Visão Geral

O sistema AlertaMed utiliza duas abordagens para armazenamento de dados:

1. **PostgreSQL**: Banco de dados relacional tradicional
2. **Supabase**: Serviço de backend que também fornece funcionalidades de banco de dados

## Estrutura PostgreSQL

### Tabela: `pacientes`

Armazena informações básicas dos pacientes.

| Campo | Tipo | Descrição | Chave |
|-------|------|-----------|-------|
| id | SERIAL | Identificador único do paciente | Primária |
| nome | VARCHAR(100) | Nome completo do paciente | |
| idade | INT | Idade do paciente | |
| quarto | VARCHAR(50) | Número/identificação do quarto do paciente | |

### Tabela: `medicamentos`

Armazena informações sobre os medicamentos e sua relação com os pacientes.

| Campo | Tipo | Descrição | Chave |
|-------|------|-----------|-------|
| id | SERIAL | Identificador único do medicamento | Primária |
| nome | VARCHAR(100) | Nome do medicamento | |
| frequencia | VARCHAR(50) | Frequência de administração (ex: "8 em 8 horas") | |
| dosagem | VARCHAR(50) | Dosagem do medicamento | |
| horarios | VARCHAR(100) | Horários de administração | |
| instrucoes | TEXT | Instruções especiais para administração | |
| estoque | INT | Quantidade em estoque | |
| paciente_id | INT | ID do paciente associado ao medicamento | Estrangeira (pacientes.id) |

## Estrutura Supabase

### Tabela: `pacientes`

Versão estendida da tabela de pacientes no PostgreSQL.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | uuid | Identificador único do paciente |
| nome | text | Nome completo do paciente |
| idade | integer | Idade do paciente |
| data_nascimento | date | Data de nascimento do paciente |
| quarto | text | Número/identificação do quarto |
| foto_url | text | URL da foto do paciente (opcional) |
| created_at | timestamp | Data de criação do registro |

### Tabela: `medicamentos`

Informações básicas sobre medicamentos disponíveis no sistema.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | uuid | Identificador único do medicamento |
| nome | text | Nome do medicamento |
| descricao | text | Descrição detalhada do medicamento |
| dose_mg | integer | Dosagem em miligramas |
| created_at | timestamp | Data de criação do registro |

### Tabela: `estoque_medicamentos`

Controle de estoque dos medicamentos.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | uuid | Identificador único do registro de estoque |
| medicamento_id | uuid | Referência ao medicamento |
| quantidade | integer | Quantidade em estoque |
| atualizado_em | timestamp | Data da última atualização do estoque |

### Tabela: `paciente_medicamentos`

Associação entre pacientes e medicamentos, incluindo detalhes de administração.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | uuid | Identificador único da associação |
| paciente_id | uuid | Referência ao paciente |
| medicamento_id | uuid | Referência ao medicamento |
| horario_dose | time | Horário programado para a dose |
| intervalo_horas | integer | Intervalo em horas entre doses |
| medicado | boolean | Indica se o medicamento foi administrado |
| uso_cronico | boolean | Indica se o medicamento é de uso crônico |
| dias_tratamento | integer | Duração do tratamento em dias (para não-crônicos) |
| updated_at | timestamp | Data da última atualização |

## Relações

### PostgreSQL

- Um paciente pode ter vários medicamentos (relação 1:N)
- A tabela `medicamentos` tem uma chave estrangeira `paciente_id` que referencia `pacientes.id`
- A exclusão de um paciente causa a exclusão em cascata de seus medicamentos (`ON DELETE CASCADE`)

### Supabase

- Um paciente pode ter vários medicamentos associados através da tabela `paciente_medicamentos`
- Um medicamento pode estar associado a vários pacientes através da tabela `paciente_medicamentos`
- Um medicamento tem um registro de estoque na tabela `estoque_medicamentos`

## Fluxo de Dados

1. Quando um paciente é cadastrado, seus dados são armazenados na tabela `pacientes`
2. Medicamentos são cadastrados na tabela `medicamentos` e seu estoque é registrado em `estoque_medicamentos`
3. A associação entre pacientes e medicamentos é feita na tabela `paciente_medicamentos`, incluindo detalhes como horário da dose e intervalo
4. Quando um medicamento é administrado:
   - O campo `medicado` é atualizado para `true` na tabela `paciente_medicamentos`
   - O campo `updated_at` é atualizado com a data/hora atual
   - A quantidade em estoque é decrementada na tabela `estoque_medicamentos`
5. O histórico de medicações é consultado a partir da tabela `paciente_medicamentos` filtrando por `medicado = true`

## Índices e Otimizações

- Índices nas chaves estrangeiras para melhorar o desempenho das consultas de junção
- Índice no campo `updated_at` da tabela `paciente_medicamentos` para otimizar consultas de histórico
- Índice no campo `quantidade` da tabela `estoque_medicamentos` para otimizar alertas de estoque baixo

## Considerações de Segurança

- Dados sensíveis dos pacientes são protegidos pelas políticas de segurança do Supabase
- Acesso às tabelas é controlado por autenticação de usuários
- Backups regulares são recomendados para evitar perda de dados
