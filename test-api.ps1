# Script de Teste da API de Networking
# Execute: .\test-api.ps1

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TESTE DA API DE NETWORKING" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:3001"
$adminKey = "Admin@adminkey2025"

# Funcao para exibir resultados
function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Url,
        [hashtable]$Headers = @{},
        [string]$Body = $null
    )
    
    Write-Host ">> Testando: $Name" -ForegroundColor Yellow
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
            ContentType = "application/json"
        }
        
        if ($Body) {
            $params.Body = $Body
        }
        
        $response = Invoke-WebRequest @params
        
        if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 300) {
            Write-Host "  [OK] PASSOU - Status: $($response.StatusCode)" -ForegroundColor Green
            $content = $response.Content | ConvertFrom-Json
            Write-Host "  Resposta:" -ForegroundColor Gray
            Write-Host "     $($content | ConvertTo-Json -Depth 2 -Compress)" -ForegroundColor Gray
            return $content
        } else {
            Write-Host "  [AVISO] Status inesperado: $($response.StatusCode)" -ForegroundColor Yellow
            return $null
        }
    } catch {
        Write-Host "  [ERRO] FALHOU - Erro: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
    
    Write-Host ""
}

# Verificar se o servidor esta rodando
Write-Host "Verificando se o servidor esta ativo..." -ForegroundColor Cyan
try {
    $null = Invoke-WebRequest -Uri $baseUrl -Method GET -TimeoutSec 2
    Write-Host "[OK] Servidor esta rodando!`n" -ForegroundColor Green
} catch {
    Write-Host "[ERRO] Servidor nao esta rodando na porta 3001!" -ForegroundColor Red
    Write-Host "   Execute: npm run dev`n" -ForegroundColor Yellow
    exit 1
}

# TESTE 1: Health Check
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TESTE 1: Health Check" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Test-Endpoint -Name "Rota Raiz" -Method "GET" -Url "$baseUrl/"
Test-Endpoint -Name "Health Check" -Method "GET" -Url "$baseUrl/api/health"

# TESTE 2: Criar Intencao
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TESTE 2: Criar Intencao (Publico)" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$intencaoBody = @{
    nome = "Maria Santos - Teste"
    email = "maria.teste.$(Get-Random)@exemplo.com"
    telefone = "(11) 99999-8888"
    empresa = "Empresa Teste Ltda"
    cargo = "Gerente Comercial"
    areaAtuacao = "Vendas"
    mensagem = "Interesse em participar da rede - TESTE AUTOMATIZADO"
} | ConvertTo-Json

$intencaoResult = Test-Endpoint `
    -Name "Criar Intencao" `
    -Method "POST" `
    -Url "$baseUrl/api/intencoes" `
    -Body $intencaoBody

$intencaoId = $null
if ($intencaoResult -and $intencaoResult.data.id) {
    $intencaoId = $intencaoResult.data.id
    Write-Host "  [INFO] ID da Intencao: $intencaoId`n" -ForegroundColor Magenta
}

# TESTE 3: Listar e Gerenciar Intencoes (Admin)
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TESTE 3: Gerenciamento de Intencoes (Admin)" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$adminHeaders = @{
    "x-admin-key" = $adminKey
}

Test-Endpoint `
    -Name "Listar Intencoes" `
    -Method "GET" `
    -Url "$baseUrl/api/intencoes/admin" `
    -Headers $adminHeaders

if ($intencaoId) {
    Test-Endpoint `
        -Name "Buscar Intencao por ID" `
        -Method "GET" `
        -Url "$baseUrl/api/intencoes/admin/$intencaoId" `
        -Headers $adminHeaders
    
    # Aprovar Intencao
    $aprovarBody = @{
        observacoes = "Teste automatizado - aprovado"
    } | ConvertTo-Json
    
    $aprovarResult = Test-Endpoint `
        -Name "Aprovar Intencao" `
        -Method "PUT" `
        -Url "$baseUrl/api/intencoes/admin/$intencaoId/aprovar" `
        -Headers $adminHeaders `
        -Body $aprovarBody
    
    if ($aprovarResult -and $aprovarResult.data.tokenConvite) {
        $token = $aprovarResult.data.tokenConvite
        Write-Host "  [INFO] Token de Convite: $token`n" -ForegroundColor Magenta
        
        # TESTE 4: Validar Token
        Write-Host "`n========================================" -ForegroundColor Cyan
        Write-Host "TESTE 4: Validar Token de Convite" -ForegroundColor Cyan
        Write-Host "========================================`n" -ForegroundColor Cyan
        
        Test-Endpoint `
            -Name "Validar Token" `
            -Method "GET" `
            -Url "$baseUrl/api/intencoes/token/$token"
        
        # TESTE 5: Cadastro de Membro
        Write-Host "`n========================================" -ForegroundColor Cyan
        Write-Host "TESTE 5: Cadastro de Membro" -ForegroundColor Cyan
        Write-Host "========================================`n" -ForegroundColor Cyan
        
        $cadastroBody = @{
            senha = "SenhaSegura123!"
            senhaConfirmacao = "SenhaSegura123!"
            telefone = "(11) 99999-8888"
            linkedin = "https://linkedin.com/in/mariateste"
            bio = "Profissional de vendas com experiencia em B2B - TESTE"
        } | ConvertTo-Json
        
        Test-Endpoint `
            -Name "Completar Cadastro" `
            -Method "POST" `
            -Url "$baseUrl/api/membros/cadastro/$token" `
            -Body $cadastroBody
    }
}

# TESTE 6: Estatisticas
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TESTE 6: Estatisticas e Dashboard" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Test-Endpoint `
    -Name "Estatisticas de Intencoes" `
    -Method "GET" `
    -Url "$baseUrl/api/intencoes/admin/estatisticas/geral" `
    -Headers $adminHeaders

Test-Endpoint `
    -Name "Estatisticas de Membros" `
    -Method "GET" `
    -Url "$baseUrl/api/membros/estatisticas" `
    -Headers $adminHeaders

Test-Endpoint `
    -Name "Dashboard Metricas" `
    -Method "GET" `
    -Url "$baseUrl/api/dashboard" `
    -Headers $adminHeaders

Test-Endpoint `
    -Name "Dashboard Graficos" `
    -Method "GET" `
    -Url "$baseUrl/api/dashboard/indicacoes/grafico" `
    -Headers $adminHeaders

Test-Endpoint `
    -Name "Listar Membros" `
    -Method "GET" `
    -Url "$baseUrl/api/membros" `
    -Headers $adminHeaders

# RESUMO
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "[OK] TESTES CONCLUIDOS!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Proximos passos:" -ForegroundColor Yellow
Write-Host "   1. Verifique os resultados acima" -ForegroundColor White
Write-Host "   2. Abra o Prisma Studio: npm run prisma:studio" -ForegroundColor White
Write-Host "   3. Consulte o arquivo TESTES.md para mais detalhes" -ForegroundColor White
Write-Host "   4. Use o arquivo requests.http para testes manuais`n" -ForegroundColor White
