#!/bin/bash

echo "🚀 Iniciando sistema de tradução..."

# Verificar se o Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Por favor, inicie o Docker Desktop."
    exit 1
fi

# Criar network se não existir
docker network create translation-network 2>/dev/null || true

# Subir os serviços
echo "📦 Construindo e iniciando containers..."
docker-compose up --build -d

# Aguardar serviços ficarem prontos
echo "⏳ Aguardando serviços ficarem prontos..."
sleep 10

# Verificar status dos serviços
echo "🔍 Verificando status dos serviços..."
docker-compose ps

echo ""
echo "✅ Sistema de tradução iniciado com sucesso!"
echo ""
echo "📊 URLs dos serviços:"
echo "  • API de Tradução: http://localhost:4040"
echo "  • Swagger Docs: http://localhost:4040/swagger"
echo "  • RabbitMQ Management: http://localhost:15672 (admin/admin)"
echo "  • MongoDB Express: http://localhost:8081 (admin/admin)"
echo ""
echo "📝 Para visualizar logs:"
echo "  docker-compose logs -f"
echo ""
echo "🛑 Para parar os serviços:"
echo "  docker-compose down"
