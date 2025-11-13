# 🤝 Plataforma de Gestão de Networking

> Sistema completo de gestão para grupos de networking focados em geração de negócios

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)

---

## 📋 Sobre o Projeto

Esta plataforma digitaliza e automatiza a gestão completa de grupos de networking, substituindo planilhas e controles manuais por um sistema web moderno, escalável e eficiente.

### 🎯 Funcionalidades Principais

#### ✅ Módulo de Admissão de Membros (Implementado)

1. **Página de Intenção** (Pública)

   - Formulário de manifestação de interesse
   - Validação de dados em tempo real
   - Envio via API REST

2. **Área Administrativa** (Protegida)

   - Listagem de intenções pendentes
   - Aprovação/rejeição de candidatos
   - Geração automática de tokens de convite

3. **Cadastro Completo** (Via Token)
   - Formulário estendido de cadastro
   - Upload de foto de perfil
   - Ativação automática do membro

#### 📊 Dashboard de Performance (Implementado)

- Métricas de membros ativos
- Total de indicações do mês
- Obrigados registrados
- Gráficos e estatísticas

---

## 🛠️ Tecnologias Utilizadas

### Backend

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **TypeScript** - Superset JavaScript tipado
- **PostgreSQL** - Banco de dados relacional
- **Prisma** - ORM moderno
- **JWT** - Autenticação
- **Bcrypt** - Hash de senhas
- **Zod** - Validação de schemas

### Frontend

- **Next.js 14** - Framework React (App Router)
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS utilitário
- **Zustand** - Gerenciamento de estado
- **Axios** - Cliente HTTP
- **React Hook Form** - Gerenciamento de formulários

### Testes

- **Jest** - Framework de testes
- **Supertest** - Testes de API
- **React Testing Library** - Testes de componentes

### DevOps

- **Docker** - Containerização
- **GitHub Actions** - CI/CD
- **ESLint** - Linting
- **Prettier** - Formatação de código

---

## 📁 Estrutura do Projeto

```
networking-platform/
├── backend/                    # API Express + TypeScript
│   ├── prisma/
│   │   ├── schema.prisma       # Schema do banco
│   │   └── migrations/         # Migrações
│   ├── src/
│   │   ├── config/             # Configurações
│   │   ├── controllers/        # Controladores
│   │   ├── services/           # Lógica de negócio
│   │   ├── routes/             # Rotas da API
│   │   ├── middlewares/        # Middlewares
│   │   ├── validators/         # Validadores Zod
│   │   ├── utils/              # Utilitários
│   │   ├── app.ts              # Configuração Express
│   │   └── server.ts           # Inicialização
│   ├── tests/                  # Testes
│   │   ├── unit/
│   │   └── integration/
│   └── package.json
│
├── frontend/                   # App Next.js + TypeScript
│   ├── app/                    # App Router
│   │   ├── (public)/           # Rotas públicas
│   │   ├── (dashboard)/        # Rotas protegidas
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/             # Componentes React
│   │   ├── ui/                 # Componentes base
│   │   ├── layout/             # Layout
│   │   └── forms/              # Formulários
│   ├── lib/                    # Bibliotecas
│   ├── hooks/                  # Custom hooks
│   ├── store/                  # Zustand stores
│   ├── types/                  # TypeScript types
│   └── package.json
│
├── ARQUITETURA.md              # Documentação de arquitetura
├── ROADMAP.md                  # Plano de implementação
├── README.md                   # Este arquivo
└── docker-compose.yml          # Setup Docker
```

---

## 🚀 Como Rodar o Projeto

### Pré-requisitos

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **PostgreSQL** 14+ ([Download](https://www.postgresql.org/download/))
- **npm** ou **yarn**
- **Git**

### 1️⃣ Clonar o Repositório

```bash
git clone https://github.com/seu-usuario/networking-platform.git
cd networking-platform
```

### 2️⃣ Setup do Backend

```bash
cd backend

# Instalar dependências
npm install

# Copiar arquivo de exemplo
cp .env.example .env

# Editar variáveis de ambiente
# Abra o arquivo .env e configure:
# - DATABASE_URL
# - JWT_SECRET
# - ADMIN_KEY
```

**Arquivo `.env` do Backend:**

```env
NODE_ENV=development
PORT=3001

DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/networking_db"

JWT_SECRET=seu_secret_super_seguro_aqui
JWT_EXPIRES_IN=24h

ADMIN_KEY=admin_super_secret_key_123

FRONTEND_URL=http://localhost:3000
```

### 3️⃣ Configurar Banco de Dados

**Opção A: Docker (Recomendado)**

```bash
# Na raiz do projeto
docker-compose up -d
```

**Opção B: PostgreSQL Local**

```bash
# Criar database manualmente
createdb networking_db

# Ou via psql
psql -U postgres
CREATE DATABASE networking_db;
\q
```

### 4️⃣ Rodar Migrações do Prisma

```bash
cd backend

# Executar migrações
npx prisma migrate dev

# Gerar cliente Prisma
npx prisma generate

# (Opcional) Rodar seeds
npx prisma db seed
```

### 5️⃣ Iniciar Backend

```bash
npm run dev
# Servidor rodando em http://localhost:3001
```

### 6️⃣ Setup do Frontend

**Abra um novo terminal:**

```bash
cd frontend

# Instalar dependências
npm install

# Copiar arquivo de exemplo
cp .env.example .env.local

# Editar variáveis de ambiente
```

**Arquivo `.env.local` do Frontend:**

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 7️⃣ Iniciar Frontend

```bash
npm run dev
# App rodando em http://localhost:3000
```

---

## 🧪 Rodando os Testes

### Backend

```bash
cd backend

# Rodar todos os testes
npm run test

# Rodar com cobertura
npm run test:coverage

# Rodar em modo watch
npm run test:watch

# Rodar apenas testes de integração
npm run test:integration
```

### Frontend

```bash
cd frontend

# Rodar todos os testes
npm run test

# Rodar com cobertura
npm run test:coverage

# Rodar em modo watch
npm run test:watch
```

**Meta de Cobertura:** 70%+ ✅

---

## 📍 Endpoints da API

### Públicos

| Método | Endpoint         | Descrição                      |
| ------ | ---------------- | ------------------------------ |
| POST   | `/api/intencoes` | Criar intenção de participação |
| GET    | `/api/health`    | Health check                   |

### Protegidos (Admin)

| Método | Endpoint                            | Descrição         | Header        |
| ------ | ----------------------------------- | ----------------- | ------------- |
| GET    | `/api/admin/intencoes`              | Listar intenções  | `x-admin-key` |
| PUT    | `/api/admin/intencoes/:id/aprovar`  | Aprovar intenção  | `x-admin-key` |
| PUT    | `/api/admin/intencoes/:id/rejeitar` | Rejeitar intenção | `x-admin-key` |

### Protegidos (JWT)

| Método | Endpoint          | Descrição             | Header          |
| ------ | ----------------- | --------------------- | --------------- |
| POST   | `/api/auth/login` | Login de usuário      | -               |
| GET    | `/api/auth/me`    | Dados do usuário      | `Authorization` |
| GET    | `/api/dashboard`  | Métricas do dashboard | `Authorization` |
| POST   | `/api/indicacoes` | Criar indicação       | `Authorization` |

**Documentação completa:** Veja `ARQUITETURA.md`

---

## 🎨 Páginas do Frontend

### Públicas

- `/` - Landing page
- `/intencao` - Formulário de intenção
- `/cadastro/[token]` - Cadastro completo via token

### Protegidas

- `/dashboard` - Dashboard de performance
- `/admin/intencoes` - Área administrativa
- `/indicacoes` - Gestão de indicações

---

## 🔐 Segurança

- ✅ Autenticação JWT
- ✅ Senhas com hash bcrypt (10 rounds)
- ✅ Validação de dados (Zod)
- ✅ Proteção CORS configurada
- ✅ Helmet.js para headers de segurança
- ✅ Rate limiting (em produção)
- ✅ Sanitização de inputs

---

## 📦 Build para Produção

### Backend

```bash
cd backend

# Build TypeScript
npm run build

# Rodar em produção
npm start
```

### Frontend

```bash
cd frontend

# Build Next.js
npm run build

# Rodar em produção
npm start
```

---

## 🐳 Docker

```bash
# Build e rodar todos os serviços
docker-compose up --build

# Rodar em background
docker-compose up -d

# Parar serviços
docker-compose down

# Ver logs
docker-compose logs -f
```

---

## 🚀 Deploy

### Backend - Railway/Render

1. Criar conta no [Railway](https://railway.app/) ou [Render](https://render.com/)
2. Conectar repositório GitHub
3. Configurar variáveis de ambiente
4. Deploy automático

### Frontend - Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod
```

### Banco de Dados - Supabase

1. Criar projeto em [Supabase](https://supabase.com/)
2. Obter connection string
3. Atualizar `DATABASE_URL` no backend

---

## 📝 Scripts Disponíveis

### Backend

```bash
npm run dev          # Desenvolvimento com nodemon
npm run build        # Build TypeScript
npm start            # Produção
npm run test         # Rodar testes
npm run test:watch   # Testes em watch mode
npm run lint         # Verificar código
npm run format       # Formatar código
```

### Frontend

```bash
npm run dev          # Desenvolvimento
npm run build        # Build de produção
npm start            # Servidor de produção
npm run lint         # ESLint
npm run test         # Testes
```

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

**Padrão de Commits:** [Conventional Commits](https://www.conventionalcommits.org/)

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

## 👥 Autores

- **Seu Nome** - _Desenvolvimento Inicial_ - [@seu-usuario](https://github.com/seu-usuario)

---

## 📚 Documentação Adicional

- [Arquitetura do Sistema](./ARQUITETURA.md)
- [Roadmap de Implementação](./ROADMAP.md)
- [Guia de Contribuição](./CONTRIBUTING.md)
- [Changelog](./CHANGELOG.md)

---

## 🎯 Próximos Passos

- [ ] Sistema de notificações por email
- [ ] Sistema de indicações completo
- [ ] Dashboard avançado com gráficos
- [ ] Sistema de reuniões
- [ ] Controle financeiro de mensalidades
- [ ] App mobile (React Native)

---

## 📞 Suporte

Para suporte, envie um email para suporte@networking.com ou abra uma issue no GitHub.

---

**Feito com ❤️ e TypeScript**
