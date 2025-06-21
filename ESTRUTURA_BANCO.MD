# Estrutura do Banco de Dados - AlertaMed

Este documento detalha a estrutura do banco de dados utilizado pelo sistema AlertaMed, incluindo tabelas, campos e relações.

## Visão Geral

O sistema AlertaMed utiliza:

- **PostgreSQL**: Banco de dados relacional principal, gerenciado via Prisma ORM e Supabase.
- **Supabase**: Backend as a Service para autenticação, armazenamento e API REST.

## Estrutura PostgreSQL/Supabase

### Tabela: `pacientes`
| Campo           | Tipo      | Descrição                        |
|-----------------|-----------|----------------------------------|
| id              | uuid      | Identificador único do paciente  |
| nome            | text      | Nome completo do paciente        |
| idade           | decimal   | Idade do paciente                |
| data_nascimento | date      | Data de nascimento               |
| quarto          | decimal   | Número/identificação do quarto   |
| foto_url        | text      | URL da foto do paciente          |
| user_id         | uuid      | Usuário dono do paciente         |

### Tabela: `medicamentos`
| Campo         | Tipo    | Descrição                         |
|---------------|---------|-----------------------------------|
| id            | uuid    | Identificador único do medicamento|
| nome          | text    | Nome do medicamento               |
| descricao     | text    | Descrição detalhada               |
| dose_mg       | decimal | Dosagem em miligramas             |

### Tabela: `estoque_medicamentos`
| Campo          | Tipo    | Descrição                         |
|----------------|---------|-----------------------------------|
| id             | uuid    | Identificador do registro de estoque|
| medicamento_id | uuid    | Referência ao medicamento         |
| quantidade     | int     | Quantidade em estoque             |
| atualizado_em  | date    | Data da última atualização        |

### Tabela: `paciente_medicamentos`
| Campo              | Tipo    | Descrição                        |
|--------------------|---------|----------------------------------|
| id                 | uuid    | Identificador da associação      |
| paciente_id        | uuid    | Referência ao paciente           |
| medicamento_id     | uuid    | Referência ao medicamento        |
| horario_dose       | text    | Horário programado para a dose   |
| intervalo_horas    | int     | Intervalo em horas entre doses   |
| medicado           | boolean | Indica se o medicamento foi dado |
| uso_cronico        | boolean | Uso crônico                      |
| dias_tratamento    | int     | Duração do tratamento            |
| updated_at         | date    | Data da última atualização       |

### Tabela: `historico_doses`
| Campo              | Tipo    | Descrição                        |
|--------------------|---------|----------------------------------|
| id                 | uuid    | Identificador do histórico       |
| paciente_id        | uuid    | Referência ao paciente           |
| medicamento_id     | uuid    | Referência ao medicamento        |
| data_hora_tomada   | date    | Data/hora da dose                |
| quantidade_usada   | int     | Quantidade usada                 |
| observacoes        | text    | Observações                      |

### Tabela: `logs_auditoria`
| Campo      | Tipo    | Descrição                          |
|------------|---------|------------------------------------|
| id         | uuid    | Identificador do log               |
| user_id    | uuid    | Usuário responsável                |
| acao       | text    | Ação realizada                     |
| detalhes   | json    | Detalhes da ação                   |
| criado_em  | date    | Data/hora do log                   |

### Tabela: `perfis`
| Campo      | Tipo    | Descrição                          |
|------------|---------|------------------------------------|
| id         | uuid    | Identificador do perfil            |
| user_id    | uuid    | Usuário                            |
| role       | text    | Papel do usuário (admin/usuario)   |

## Relações
- Um paciente pode ter vários medicamentos (via `paciente_medicamentos`)
- Um medicamento pode estar associado a vários pacientes
- O estoque é controlado por medicamento
- O histórico de doses registra cada administração
- Logs e perfis controlam auditoria e permissões

## Observações
- O banco é gerenciado via Prisma ORM e Supabase.
- A estrutura detalhada está em `backend-custom/prisma/schema.prisma`.
- Alertas e integrações (Telegram, Prometheus) são feitos via backend custom.
