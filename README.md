# 💊 AlertaMed

Bem-vindo ao **AlertaMed**!  
Este projeto é uma aplicação web desenvolvida para auxiliar no controle de pacientes e administração de medicamentos em casas de repouso principalmente e posteriormente podendo subir para ambientes hospitalares.

---

## 📋 Descrição do Projeto

O sistema permite o gerenciamento completo do ciclo de medicação dos pacientes, incluindo:

- **Cadastro de Pacientes:** Adicione novos pacientes, edite suas informações e associe medicamentos conforme a prescrição.
- **Controle de Medicamentos:** Visualize o estoque de medicamentos, adicione novos itens, edite ou remova conforme necessário.
- **Administração de Doses:** Marque quais pacientes já foram medicados, veja quem ainda precisa receber a medicação e acompanhe o histórico de doses administradas.
- **Histórico de Medicados:** Consulte rapidamente o histórico de todos os pacientes que já receberam seus medicamentos.
- **Alertas Automáticos:** Receba alertas automáticos no Telegram quando houver pacientes com medicação atrasada ou estoque baixo.
- **Monitoramento:** Métricas do sistema expostas para Prometheus/Grafana via rota `/metrics`.
- **Interface Intuitiva:** Navegação simples para visualizar pacientes, gerenciar estoque, cadastrar e editar informações.

---

## 🖥️ Tecnologias Utilizadas

- **React.js** — Biblioteca principal para construção da interface.
- **JavaScript (ES6+)** — Linguagem de programação.
- **CSS3** — Estilização customizada para uma experiência visual agradável.
- **React Hooks** — Gerenciamento de estado e efeitos.
- **React Router** — Navegação entre páginas.
- **Express.js** — Backend API REST.
- **Prisma ORM** — Mapeamento objeto-relacional para PostgreSQL/Supabase.
- **Supabase** — Autenticação, banco de dados e storage.
- **Prometheus & Grafana** — Monitoramento e visualização de métricas.
- **Telegram Bot** — Notificações automáticas de alertas.
- **Docker** — Containerização do backend e frontend para fácil deploy.

---

## 🔔 Funcionalidades em Destaque

- Listagem de pacientes a serem medicados, atrasados e já medicados.
- Cadastro, edição e remoção de pacientes.
- Controle visual e funcional do estoque de medicamentos.
- Histórico detalhado de medicações realizadas.
- Alertas automáticos de estoque baixo e pacientes atrasados (visual e Telegram).
- Integração com Prometheus/Grafana para monitoramento.
- Interface responsiva e amigável.
- Deploy facilitado com Docker Compose.

---

## 🐳 Docker

O projeto já está pronto para ser executado com Docker e Docker Compose, facilitando o deploy em qualquer ambiente.

### Como rodar com Docker Compose

1. Certifique-se de ter o Docker e o Docker Compose instalados.
2. No diretório raiz do projeto, execute:
   ```bash
   docker-compose up --build
   ```
3. O backend ficará disponível em `http://localhost:3001` e o frontend em `http://localhost:3000`.
4. As variáveis de ambiente do backend devem ser configuradas no arquivo `.env` dentro de `backend-custom/`.

---

## 🚀 Como acessar o projeto

### Acesse online

Você pode acessar a aplicação diretamente pelo link:  
👉 [https://sistema-medicamentos.vercel.app/](https://sistema-medicamentos.vercel.app/)

### Rodar localmente

1. Clone este repositório:
   ```bash
   git clone https://github.com/Joaobneto1/Sistema_Medicamentos.git
   ```
2. Acesse o diretório do projeto:
   ```bash
   cd sistema-medicamentos
   ```
3. Instale as dependências:
   ```bash
   npm install
   ```
4. Inicie o servidor de desenvolvimento:
   ```bash
   npm start
   ```
5. Acesse o projeto no seu navegador: [http://localhost:3000](http://localhost:3000)

---

## ⚙️ CI/CD

O projeto utiliza integração contínua (CI) e deploy contínuo (CD) via GitHub Actions:

- **CI:** Toda vez que um push ou pull request é feito, o workflow de CI executa testes, lint e validações para garantir a qualidade do código.
- **CD:** O deploy do frontend é feito automaticamente na Vercel a cada push na branch principal. O backend pode ser facilmente publicado em qualquer ambiente Docker.
- O status do CI pode ser acompanhado pelo badge abaixo:

![CI](https://github.com/Joaobneto1/Sistema_Medicamentos/actions/workflows/ci.yml/badge.svg)

---

## 👥 Autores

- **Joao Batista Neto** - [Joaobneto1](https://github.com/Joaobneto1)
- **Leonardo Lima De Vasconcelos** - [leonardorz5 ](https://github.com/leonardorz5)
- **Lucas Daniel Alves Carneiro** - [lukitas900](https://github.com/lukitas900)