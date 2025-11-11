# 🚀 Início Rápido - Testes Backend

## ⚡ Passos Rápidos para Testar

### 1️⃣ Iniciar o Servidor

Abra um terminal no PowerShell e execute:

```powershell
cd "C:\Users\WISLEY\Desktop\Teste AG\backend"
npm run dev
```

**Você deve ver:**

```
🔧 Ambiente: development
🗄️  Banco conectado com sucesso
✅ Servidor rodando na porta 3001
```

Se der erro, verifique:

- ✅ PostgreSQL está rodando?
- ✅ Arquivo `.env` existe?
- ✅ Executou `npm install`?

---

### 2️⃣ Teste Rápido Manual (Novo Terminal)

Abra **outro terminal** PowerShell e execute:

```powershell
# Teste 1: Health Check
Invoke-WebRequest -Uri http://localhost:3001 -Method GET
```

**Se funcionar, você verá o status 200!** ✅

---

### 3️⃣ Teste Automatizado Completo

No segundo terminal, execute o script de teste:

```powershell
cd "C:\Users\WISLEY\Desktop\Teste AG\backend"
.\test-api.ps1
```

Este script irá:

- ✅ Testar health check
- ✅ Criar uma intenção
- ✅ Aprovar a intenção
- ✅ Gerar token de convite
- ✅ Cadastrar membro
- ✅ Verificar estatísticas

---

### 4️⃣ Verificar Banco de Dados

```powershell
npm run prisma:studio
```

Abrirá uma interface visual em: http://localhost:5555

---

## 🎯 Testes Essenciais

### Teste 1: Criar Intenção (Copie e cole no PowerShell)

```powershell
$body = @{
    nome = "João Silva"
    email = "joao@teste.com"
    telefone = "(11) 98765-4321"
    empresa = "Tech Solutions"
    cargo = "Desenvolvedor"
    areaAtuacao = "Tecnologia"
    mensagem = "Quero participar"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:3001/api/intencoes `
    -Method POST `
    -Body $body `
    -ContentType "application/json" | Select-Object StatusCode, Content
```

### Teste 2: Listar Intenções (Admin)

```powershell
$headers = @{ "x-admin-key" = "admin123456" }

Invoke-WebRequest -Uri http://localhost:3001/api/intencoes `
    -Method GET `
    -Headers $headers | Select-Object StatusCode, Content
```

---

## ✅ Checklist Rápido

Marque conforme testa:

- [ ] Servidor inicia sem erros
- [ ] GET / retorna informações da API
- [ ] POST /api/intencoes cria nova intenção
- [ ] GET /api/intencoes lista intenções (admin)
- [ ] Prisma Studio abre

---

## 🐛 Problemas?

### Erro: "Port 3001 already in use"

```powershell
# Matar processo na porta 3001
$process = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue
if ($process) {
    Stop-Process -Id $process.OwningProcess -Force
}
```

### Erro: "DATABASE_URL not found"

1. Crie arquivo `.env` na pasta backend
2. Adicione:

```
DATABASE_URL="postgresql://usuario:senha@localhost:5432/networking_db"
JWT_SECRET="chave_secreta_longa_com_no_minimo_32_caracteres_aqui"
JWT_EXPIRES_IN=24h
ADMIN_KEY=admin123456
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
PORT=3001
```

### Servidor não inicia?

```powershell
# Verificar logs de erro
npm run dev
# Leia as mensagens de erro com atenção
```

---

## 📚 Documentação Completa

Para testes mais detalhados, consulte: **TESTES.md**

---

**Pronto para testar!** 🚀
Execute o passo 1 e depois o passo 3!
