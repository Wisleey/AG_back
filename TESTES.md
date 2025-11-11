# 🧪 Guia de Testes - Backend API

Este guia contém todos os passos para testar e verificar se o backend está funcionando corretamente.

## 📋 Pré-requisitos

Antes de começar os testes, certifique-se de que:

1. ✅ PostgreSQL está rodando
2. ✅ Variáveis de ambiente estão configuradas no arquivo `.env`
3. ✅ Dependências estão instaladas (`npm install`)
4. ✅ Banco de dados foi migrado (`npm run prisma:migrate`)

---

## 🔧 Configuração Inicial

### 1. Verificar Variáveis de Ambiente

Certifique-se de que o arquivo `.env` existe e contém:

```env
NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://usuario:senha@localhost:5432/networking_db?schema=public"
JWT_SECRET="sua_chave_secreta_muito_longa_e_segura_aqui_com_no_minimo_32_caracteres"
JWT_EXPIRES_IN=24h
ADMIN_KEY="admin123456"
FRONTEND_URL=http://localhost:3000
```

### 2. Configurar Banco de Dados

```bash
# Gerar o Prisma Client
npm run prisma:generate

# Executar migrations
npm run prisma:migrate

# (Opcional) Popular banco com dados de teste
npm run prisma:seed
```

---

## 🚀 Teste 1: Iniciar o Servidor

```bash
npm run dev
```

**Resultado Esperado:**

```
🔧 Ambiente: development
🗄️  Banco conectado com sucesso
✅ Servidor rodando na porta 3001
```

Se o servidor iniciar sem erros, **parabéns! ✅** O backend está configurado corretamente.

---

## 📡 Teste 2: Testar Endpoints da API

### 2.1. Health Check (Rota Raiz)

```bash
# Windows PowerShell
Invoke-WebRequest -Uri http://localhost:3001 -Method GET | Select-Object -Expand Content
```

**Resultado Esperado:**

```json
{
  "success": true,
  "data": {
    "message": "🚀 API de Gestão de Networking",
    "version": "1.0.0",
    "documentation": "/api/health",
    "endpoints": {
      "health": "/api/health",
      "intencoes": "/api/intencoes",
      "membros": "/api/membros",
      "dashboard": "/api/dashboard"
    }
  }
}
```

### 2.2. Health Check Detalhado

```bash
Invoke-WebRequest -Uri http://localhost:3001/api/health -Method GET | Select-Object -Expand Content
```

**Resultado Esperado:**

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2024-XX-XXTXX:XX:XX.XXXZ",
    "uptime": 10.123,
    "environment": "development"
  }
}
```

---

## 🎯 Teste 3: Fluxo Completo de Intenção

### 3.1. Criar Nova Intenção (Público)

```bash
$body = @{
    nome = "João Silva"
    email = "joao.silva@exemplo.com"
    telefone = "(11) 98765-4321"
    empresa = "Tech Solutions"
    cargo = "Desenvolvedor Sênior"
    areaAtuacao = "Tecnologia"
    mensagem = "Quero participar da rede de networking"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:3001/api/intencoes `
    -Method POST `
    -Body $body `
    -ContentType "application/json" | Select-Object -Expand Content
```

**Resultado Esperado:**

```json
{
  "success": true,
  "message": "Sua intenção foi registrada com sucesso! Aguarde nossa avaliação.",
  "data": {
    "id": "uuid-gerado",
    "status": "PENDENTE"
  }
}
```

### 3.2. Listar Intenções (Admin)

```bash
$headers = @{
    "x-admin-key" = "admin123456"
}

Invoke-WebRequest -Uri http://localhost:3001/api/intencoes `
    -Method GET `
    -Headers $headers | Select-Object -Expand Content
```

### 3.3. Aprovar Intenção (Admin)

```bash
$headers = @{
    "x-admin-key" = "admin123456"
}

$body = @{
    observacoes = "Perfil adequado para a rede"
} | ConvertTo-Json

# Substitua {ID_DA_INTENCAO} pelo ID retornado no passo 3.1
Invoke-WebRequest -Uri "http://localhost:3001/api/intencoes/{ID_DA_INTENCAO}/aprovar" `
    -Method PUT `
    -Headers $headers `
    -Body $body `
    -ContentType "application/json" | Select-Object -Expand Content
```

**Resultado Esperado:**

```json
{
  "success": true,
  "message": "Intenção aprovada com sucesso!",
  "data": {
    "intencao": {...},
    "tokenConvite": "uuid-token",
    "linkConvite": "http://localhost:3000/cadastro/uuid-token"
  }
}
```

---

## 👤 Teste 4: Cadastro de Membro

### 4.1. Validar Token de Convite

```bash
# Substitua {TOKEN} pelo tokenConvite retornado no passo 3.3
Invoke-WebRequest -Uri "http://localhost:3001/api/intencoes/token/{TOKEN}" `
    -Method GET | Select-Object -Expand Content
```

### 4.2. Completar Cadastro

```bash
$body = @{
    senha = "SenhaSegura123!"
    senhaConfirmacao = "SenhaSegura123!"
    telefone = "(11) 98765-4321"
    linkedin = "https://linkedin.com/in/joaosilva"
    bio = "Desenvolvedor com 10 anos de experiência"
} | ConvertTo-Json

# Substitua {TOKEN} pelo tokenConvite
Invoke-WebRequest -Uri "http://localhost:3001/api/membros/cadastro/{TOKEN}" `
    -Method POST `
    -Body $body `
    -ContentType "application/json" | Select-Object -Expand Content
```

**Resultado Esperado:**

```json
{
  "success": true,
  "message": "Cadastro realizado com sucesso! Você já pode fazer login.",
  "data": {
    "usuario": {...},
    "membro": {...}
  }
}
```

---

## 📊 Teste 5: Dashboard e Estatísticas

### 5.1. Estatísticas de Intenções (Admin)

```bash
$headers = @{
    "x-admin-key" = "admin123456"
}

Invoke-WebRequest -Uri http://localhost:3001/api/intencoes/estatisticas `
    -Method GET `
    -Headers $headers | Select-Object -Expand Content
```

### 5.2. Métricas do Dashboard (Admin)

```bash
$headers = @{
    "x-admin-key" = "admin123456"
}

Invoke-WebRequest -Uri http://localhost:3001/api/dashboard `
    -Method GET `
    -Headers $headers | Select-Object -Expand Content
```

---

## 🧪 Teste 6: Testes Automatizados

### 6.1. Executar Todos os Testes

```bash
npm test
```

### 6.2. Executar Testes com Coverage

```bash
npm run test
```

### 6.3. Executar Testes em Modo Watch

```bash
npm run test:watch
```

---

## 🛠️ Teste 7: Ferramentas de Desenvolvimento

### 7.1. Prisma Studio (Interface Visual do Banco)

```bash
npm run prisma:studio
```

Acesse: http://localhost:5555

### 7.2. Verificar Linting

```bash
npm run lint
```

### 7.3. Formatar Código

```bash
npm run format
```

---

## ✅ Checklist de Verificação

Marque cada item conforme você testa:

- [ ] Servidor inicia sem erros
- [ ] Rota raiz (/) retorna informações da API
- [ ] Health check funciona
- [ ] Criar intenção (público) funciona
- [ ] Listar intenções (admin) funciona
- [ ] Aprovar intenção gera token de convite
- [ ] Validar token de convite funciona
- [ ] Cadastro de membro completo funciona
- [ ] Estatísticas retornam dados corretos
- [ ] Dashboard retorna métricas
- [ ] Prisma Studio abre corretamente

---

## 🐛 Problemas Comuns

### Erro: "Port 3001 already in use"

**Solução:**

```bash
# Encontrar processo na porta 3001
netstat -ano | findstr :3001

# Matar o processo (substitua PID pelo número encontrado)
taskkill /PID <PID> /F
```

### Erro: "DATABASE_URL not found"

**Solução:** Verifique se o arquivo `.env` existe e está configurado corretamente.

### Erro: "Prisma Client not generated"

**Solução:**

```bash
npm run prisma:generate
```

### Erro: "Table does not exist"

**Solução:**

```bash
npm run prisma:migrate
```

---

## 📝 Arquivo de Requests HTTP

Use o arquivo `requests.http` na raiz do projeto com a extensão REST Client do VS Code para testar os endpoints de forma visual.

---

## 🎉 Próximos Passos

Se todos os testes passaram:

1. ✅ Backend está funcionando perfeitamente
2. 🚀 Você pode começar a desenvolver o frontend
3. 📱 Ou integrar com aplicações existentes
4. 🔐 Implementar autenticação JWT completa (próxima fase)

---

**Última atualização:** Novembro 2024
**Versão da API:** 1.0.0
