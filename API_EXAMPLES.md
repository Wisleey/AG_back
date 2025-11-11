# 📡 Exemplos de Uso da API

## 🔹 Base URL

```
http://localhost:3001/api
```

---

## 1️⃣ Health Check

### GET /health

**Request:**
```http
GET http://localhost:3001/api/health
```

**Response:** (200 OK)
```json
{
  "status": "ok",
  "timestamp": "2025-11-07T10:30:00.000Z"
}
```

---

## 2️⃣ Criar Intenção (Público)

### POST /intencoes

**Request:**
```http
POST http://localhost:3001/api/intencoes
Content-Type: application/json

{
  "nome": "João Silva",
  "email": "joao@exemplo.com",
  "telefone": "11987654321",
  "empresa": "Tech Corp",
  "cargo": "CEO",
  "areaAtuacao": "Tecnologia",
  "mensagem": "Quero fazer parte do grupo!"
}
```

**Response:** (201 Created)
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "nome": "João Silva",
    "email": "joao@exemplo.com",
    "telefone": "11987654321",
    "empresa": "Tech Corp",
    "cargo": "CEO",
    "areaAtuacao": "Tecnologia",
    "mensagem": "Quero fazer parte do grupo!",
    "status": "PENDENTE",
    "dataIntencao": "2025-11-07T10:30:00.000Z"
  },
  "message": "Intenção criada com sucesso"
}
```

**Error:** (400 Bad Request)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email inválido"
  }
}
```

---

## 3️⃣ Listar Intenções (Admin)

### GET /intencoes/admin

**Request:**
```http
GET http://localhost:3001/api/intencoes/admin?status=PENDENTE
x-admin-key: admin_super_secret_key_123
```

**Response:** (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "nome": "João Silva",
      "email": "joao@exemplo.com",
      "telefone": "11987654321",
      "empresa": "Tech Corp",
      "cargo": "CEO",
      "areaAtuacao": "Tecnologia",
      "mensagem": "Quero fazer parte do grupo!",
      "status": "PENDENTE",
      "dataIntencao": "2025-11-07T10:30:00.000Z"
    }
  ]
}
```

**Error:** (401 Unauthorized)
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Chave de administrador inválida"
  }
}
```

---

## 4️⃣ Aprovar Intenção (Admin)

### PUT /intencoes/admin/:id/aprovar

**Request:**
```http
PUT http://localhost:3001/api/intencoes/admin/550e8400-e29b-41d4-a716-446655440000/aprovar
x-admin-key: admin_super_secret_key_123
Content-Type: application/json

{}
```

**Response:** (200 OK)
```json
{
  "success": true,
  "data": {
    "intencao": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "status": "APROVADO",
      "dataAvaliacao": "2025-11-07T11:00:00.000Z"
    },
    "tokenConvite": "a1b2c3d4-e5f6-4789-0123-456789abcdef",
    "linkConvite": "http://localhost:3000/cadastro/a1b2c3d4-e5f6-4789-0123-456789abcdef"
  },
  "message": "Intenção aprovada com sucesso"
}
```

---

## 5️⃣ Rejeitar Intenção (Admin)

### PUT /intencoes/admin/:id/rejeitar

**Request:**
```http
PUT http://localhost:3001/api/intencoes/admin/550e8400-e29b-41d4-a716-446655440000/rejeitar
x-admin-key: admin_super_secret_key_123
Content-Type: application/json

{
  "motivo": "Perfil não se encaixa no momento"
}
```

**Response:** (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "REJEITADO",
    "motivoRejeicao": "Perfil não se encaixa no momento",
    "dataAvaliacao": "2025-11-07T11:00:00.000Z"
  },
  "message": "Intenção rejeitada"
}
```

---

## 6️⃣ Validar Token de Convite

### GET /intencoes/token/:token

**Request:**
```http
GET http://localhost:3001/api/intencoes/token/a1b2c3d4-e5f6-4789-0123-456789abcdef
```

**Response:** (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "nome": "João Silva",
    "email": "joao@exemplo.com",
    "telefone": "11987654321",
    "empresa": "Tech Corp",
    "cargo": "CEO",
    "areaAtuacao": "Tecnologia"
  }
}
```

**Error:** (404 Not Found)
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Token inválido ou expirado"
  }
}
```

---

## 7️⃣ Completar Cadastro

### POST /membros/cadastro/:token

**Request:**
```http
POST http://localhost:3001/api/membros/cadastro/a1b2c3d4-e5f6-4789-0123-456789abcdef
Content-Type: application/json

{
  "senha": "Senha123!",
  "cargo": "CEO",
  "areaAtuacao": "Tecnologia",
  "telefone": "11987654321",
  "linkedin": "https://linkedin.com/in/joaosilva",
  "fotoUrl": "https://exemplo.com/foto.jpg",
  "bio": "Empreendedor com 10 anos de experiência"
}
```

**Response:** (201 Created)
```json
{
  "success": true,
  "data": {
    "usuario": {
      "id": "usr-123",
      "email": "joao@exemplo.com",
      "nome": "João Silva",
      "tipo": "MEMBRO"
    },
    "membro": {
      "id": "mbr-123",
      "nomeCompleto": "João Silva",
      "email": "joao@exemplo.com",
      "cargo": "CEO",
      "empresa": "Tech Corp",
      "status": "ATIVO",
      "dataEntrada": "2025-11-07T11:30:00.000Z"
    }
  },
  "message": "Cadastro completado com sucesso"
}
```

---

## 8️⃣ Dashboard - Métricas (Admin)

### GET /dashboard

**Request:**
```http
GET http://localhost:3001/api/dashboard
x-admin-key: admin_super_secret_key_123
```

**Response:** (200 OK)
```json
{
  "success": true,
  "data": {
    "membros": {
      "total": 25,
      "ativos": 23,
      "inativos": 2
    },
    "indicacoes": {
      "total": 150,
      "abertas": 45,
      "emAndamento": 30,
      "fechadas": 50,
      "taxaConversao": 33.33,
      "valorTotalGerado": 1500000.00
    },
    "indicacoesMesAtual": 12,
    "topMembrosIndicadores": [
      {
        "membro": {
          "id": "mbr-123",
          "nomeCompleto": "João Silva",
          "empresa": "Tech Corp",
          "fotoUrl": "https://exemplo.com/foto.jpg"
        },
        "totalIndicacoes": 25
      },
      {
        "membro": {
          "id": "mbr-456",
          "nomeCompleto": "Maria Santos",
          "empresa": "Consulting SA",
          "fotoUrl": "https://exemplo.com/maria.jpg"
        },
        "totalIndicacoes": 20
      }
    ]
  }
}
```

---

## 📊 Códigos de Status HTTP

| Código | Significado | Quando usar |
|--------|-------------|-------------|
| 200 | OK | Requisição bem-sucedida (GET, PUT) |
| 201 | Created | Recurso criado com sucesso (POST) |
| 400 | Bad Request | Dados de entrada inválidos |
| 401 | Unauthorized | Não autenticado ou token inválido |
| 403 | Forbidden | Autenticado mas sem permissão |
| 404 | Not Found | Recurso não encontrado |
| 409 | Conflict | Conflito (ex: email já existe) |
| 500 | Internal Server Error | Erro no servidor |

---

## 🔑 Autenticação

### Admin Key (Header)

Para rotas protegidas admin:

```http
x-admin-key: admin_super_secret_key_123
```

### JWT (Futuro)

Para rotas protegidas de membros:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🧪 Testando com cURL

### Criar Intenção

```bash
curl -X POST http://localhost:3001/api/intencoes \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "email": "joao@exemplo.com",
    "telefone": "11987654321",
    "empresa": "Tech Corp"
  }'
```

### Listar Intenções (Admin)

```bash
curl -X GET "http://localhost:3001/api/intencoes/admin?status=PENDENTE" \
  -H "x-admin-key: admin_super_secret_key_123"
```

### Aprovar Intenção

```bash
curl -X PUT http://localhost:3001/api/intencoes/admin/{ID}/aprovar \
  -H "x-admin-key: admin_super_secret_key_123" \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

## 📝 Notas

- Todos os endpoints retornam JSON
- Timestamps em formato ISO 8601
- IDs em formato UUID v4
- Paginação: usar `?page=1&limit=10` (futuro)
- Ordenação: usar `?sortBy=dataIntencao&order=desc` (futuro)

---

**Para mais exemplos, veja:** `backend/requests.http`




