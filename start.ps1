Write-Host "🚀 Iniciando sistema de tradução..." -ForegroundColor Green

# Verificar se o Docker está rodando
try {
    docker info | Out-Null
    Write-Host "✅ Docker está rodando" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker não está rodando. Por favor, inicie o Docker Desktop." -ForegroundColor Red
    exit 1
}

# Criar network se não existir
Write-Host "🔗 Criando network..." -ForegroundColor Yellow
docker network create translation-network 2>$null

# Subir os serviços
Write-Host "📦 Construindo e iniciando containers..." -ForegroundColor Yellow
docker-compose up --build -d

# Aguardar serviços ficarem prontos
Write-Host "⏳ Aguardando serviços ficarem prontos..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Verificar status dos serviços
Write-Host "🔍 Verificando status dos serviços..." -ForegroundColor Yellow
docker-compose ps

Write-Host ""
Write-Host "✅ Sistema de tradução iniciado com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 URLs dos serviços:" -ForegroundColor Cyan
Write-Host "  • API de Tradução: http://localhost:4040" -ForegroundColor White
Write-Host "  • Swagger Docs: http://localhost:4040/swagger" -ForegroundColor White
Write-Host "  • RabbitMQ Management: http://localhost:15672 (admin/admin)" -ForegroundColor White
Write-Host "  • MongoDB Express: http://localhost:8081 (admin/admin)" -ForegroundColor White
Write-Host ""
Write-Host "📝 Para visualizar logs:" -ForegroundColor Cyan
Write-Host "  docker-compose logs -f" -ForegroundColor White
Write-Host ""
Write-Host "🛑 Para parar os serviços:" -ForegroundColor Cyan
Write-Host "  docker-compose down" -ForegroundColor White
