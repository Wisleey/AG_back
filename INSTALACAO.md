# 📦 Guia de Instalação - Backend

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** 18 ou superior ([Download](https://nodejs.org/))
- **PostgreSQL** 14 ou superior ([Download](https://www.postgresql.org/download/))
- **npm** ou **yarn**
- **Git**

---

## 🚀 Passo a Passo

### 1️⃣ Clonar o Repositório

```bash
git clone https://github.com/seu-usuario/networking-platform.git
cd networking-platform/backend
```

### 2️⃣ Instalar Dependências

```bash
npm install
```

Isso instalará todas as dependências necessárias definidas no `package.json`.

### 3️⃣ Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env
```

**Edite o arquivo `.env` com suas configurações:**

```env
NODE_ENV=development
PORT=3001

# Database - Ajuste conforme seu ambiente
DATABASE_URL="postgresql://postgres:sua_senha@localhost:5432/networking_db"

# JWT - IMPORTANTE: Gere uma chave segura
JWT_SECRET=sua_chave_super_segura_de_pelo_menos_32_caracteres
JWT_EXPIRES_IN=24h

# Admin - Use uma chave forte
ADMIN_KEY=sua_chave_admin_super_secreta_aqui

FRONTEND_URL=http://localhost:3000
```

**⚠️ IMPORTANTE:**
- **JWT_SECRET**: Deve ter pelo menos 32 caracteres. Use um gerador de senhas.
- **ADMIN_KEY**: Mínimo 8 caracteres. Guarde com segurança.
- **DATABASE_URL**: Ajuste usuario, senha e nome do banco conforme seu PostgreSQL.

### 4️⃣ Configurar PostgreSQL

**Opção A: Com Docker (Recomendado)**

```bash
# Na raiz do projeto
docker run --name networking-postgres \
  -e POSTGRES_PASSWORD=postgres123 \
  -e POSTGRES_DB=networking_db \
  -p 5432:5432 \
  -d postgres:14

# Verificar se está rodando
docker ps
```

**Opção B: PostgreSQL Local**

```bash
# Via linha de comando
createdb networking_db

# Ou via psql
psql -U postgres
CREATE DATABASE networking_db;
\q
```

### 5️⃣ Executar Migrações do Prisma

```bash
# Executar migrações (cria as tabelas)
npx prisma migrate dev --name init

# Gerar cliente Prisma
npx prisma generate
```

Isso criará todas as tabelas no banco de dados baseado no schema do Prisma.

### 6️⃣ Popular Banco com Dados Iniciais (Opcional)

```bash
npx prisma db seed
```

Isso criará:
- 1 usuário admin (admin@networking.com / admin123)
- 3 membros de exemplo
- 3 intenções de exemplo
- 3 indicações de exemplo

### 7️⃣ Iniciar Servidor de Desenvolvimento

```bash
npm run dev
```

Você verá:

```
✅ Conexão com PostgreSQL estabelecida com sucesso

🚀 ============================================
   Servidor rodando na porta 3001
   Ambiente: development
   URL: http://localhost:3001
   API: http://localhost:3001/api
   Health: http://localhost:3001/api/health
============================================
```

### 8️⃣ Testar a API

**Opção 1: Navegador**
```
http://localhost:3001/api/health
```

**Opção 2: cURL**
```bash
curl http://localhost:3001/api/health
```

**Opção 3: REST Client (VS Code)**

Instale a extensão "REST Client" e use o arquivo `requests.http`:

```http
### Health Check
GET http://localhost:3001/api/health
```

---

## 🧪 Rodar Testes

```bash
# Todos os testes
npm run test

# Com cobertura
npm run test -- --coverage

# Modo watch
npm run test:watch

# Apenas testes de integração
npm run test:integration
```

**Meta de Cobertura:** 70%+

---

## 🛠️ Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento com hot-reload
npm run build        # Build para produção
npm start            # Produção (após build)
npm run test         # Testes
npm run test:watch   # Testes em modo watch
npm run lint         # Verificar código
npm run format       # Formatar código
```

### Prisma

```bash
npx prisma studio           # Interface visual do banco
npx prisma migrate dev      # Criar/aplicar migrações
npx prisma generate         # Gerar cliente Prisma
npx prisma db seed          # Popular banco
npx prisma db push          # Sincronizar schema (dev only)
```

---

## 🐛 Solução de Problemas

### Erro: "Cannot connect to database"

**Solução:**
1. Verifique se PostgreSQL está rodando:
   ```bash
   # MacOS/Linux
   pg_isready
   
   # Docker
   docker ps | grep postgres
   ```

2. Verifique a `DATABASE_URL` no `.env`
3. Teste a conexão:
   ```bash
   npx prisma db pull
   ```

### Erro: "JWT_SECRET must be at least 32 characters"

**Solução:**
Gere uma chave forte:

```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Online
https://www.random.org/strings/?num=1&len=32&digits=on&upperalpha=on&loweralpha=on
```

### Erro: "Port 3001 is already in use"

**Solução:**
```bash
# Encontrar processo usando a porta
lsof -ti:3001

# Matar processo (Mac/Linux)
kill -9 $(lsof -ti:3001)

# Ou mudar a porta no .env
PORT=3002
```

### Erro nas migrações do Prisma

**Solução:**
```bash
# Resetar banco (ATENÇÃO: apaga todos os dados)
npx prisma migrate reset

# Recriar migrações
npx prisma migrate dev --name init
```

---

## 📊 Verificar Instalação

Execute este checklist:

- [ ] PostgreSQL rodando
- [ ] Dependências instaladas (`node_modules` existe)
- [ ] Arquivo `.env` configurado
- [ ] Migrações executadas (tabelas criadas)
- [ ] Servidor iniciando sem erros
- [ ] `/api/health` retornando status ok
- [ ] Testes passando

---

## 🔗 Próximos Passos

1. ✅ Backend rodando
2. Configurar frontend (veja `frontend/README.md`)
3. Testar fluxo completo
4. Desenvolver novas features

---

## 📞 Suporte

Problemas? Abra uma issue no GitHub ou entre em contato.

**Happy coding!** 🚀


