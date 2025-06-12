# Sistema de Tradução Assíncrona

Este projeto implementa um sistema de tradução de textos composto por dois serviços que se comunicam de forma assíncrona através de uma fila de mensagens RabbitMQ.

## Arquitetura

- **translation-api**: API REST que recebe requisições de tradução
- **translation-worker**: Serviço worker que processa as traduções
- **MongoDB**: Banco de dados para armazenar o estado das traduções
- **RabbitMQ**: Fila de mensagens para comunicação assíncrona

## Funcionalidades

### API REST (translation-api)

- **POST /api/translations**: Cria uma nova requisição de tradução
- **GET /api/translations/:requestId**: Consulta o status de uma tradução
- **GET /api/translations**: Lista todas as traduções (para debug)

### Worker (translation-worker)

- Escuta a fila RabbitMQ
- Processa traduções de forma assíncrona
- Atualiza o status das traduções no banco de dados
- Suporte a retry em caso de falha

## Estados da Tradução

- **queued**: Aguardando na fila
- **processing**: Sendo traduzida
- **completed**: Tradução concluída com sucesso
- **failed**: Falha no processo

## Como Usar

### 1. Iniciar os serviços

Na raiz do projeto, rode:
```bash
docker-compose up -d --build
```

### 2. Criar uma tradução

```bash
curl -X POST http://localhost:4040/api/translations \
  -H "Content-Type: application/json" \
  -d '{
    "text": "hello world",
    "sourceLanguage": "en",
    "targetLanguage": "pt"
  }'
```

Resposta:
```json
{
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "queued",
  "message": "Translation request received and queued for processing"
}
```

### 3. Consultar status da tradução

```bash
curl http://localhost:4040/api/translations/550e8400-e29b-41d4-a716-446655440000
```

Resposta (quando completada):
```json
{
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "completed",
  "text": "hello world",
  "sourceLanguage": "en",
  "targetLanguage": "pt",
  "translatedText": "olá mundo",
  "createdAt": "2025-06-11T10:00:00.000Z",
  "updatedAt": "2025-06-11T10:00:05.000Z"
}
```

## Idiomas Suportados

- **en** ↔ **pt**: Inglês ↔ Português
- **en** → **es**: Inglês → Espanhol

## Estrutura do Banco de Dados

```javascript
{
  requestId: String,        // UUID único
  text: String,            // Texto original
  text_translated: String, // Texto traduzido
  sourceLanguage: String,  // Idioma de origem
  targetLanguage: String,  // Idioma de destino
  status: String,          // Estado da tradução
  errorMessage: String,    // Mensagem de erro (se falhou)
  createdAt: Date,         // Data de criação
  updatedAt: Date          // Data de atualização
}
```

## Desenvolvimento

### Estrutura do Projeto

```
translation-api/
├── src/
│   ├── controllers/     # Controladores da API
│   ├── models/         # Modelos do banco de dados
│   ├── routes/         # Rotas e validações
│   ├── services/       # Serviços (RabbitMQ)
│   └── config/         # Configurações
│
translation-worker/
├── src/
│   ├── services/       # Serviços de tradução e conexão
│   └── consumer.js     # Consumidor da fila
```

### Executar em modo de desenvolvimento

```bash
# API
cd translation-api
npm run start:watch

# Worker
cd translation-worker  
npm run start:watch
```

## Logs e Monitoramento

- **RabbitMQ Management**: http://localhost:15672 (admin/admin)
- **Swagger Documentation**: http://localhost:4040/swagger

## Tratamento de Erros

- Sistema de retry com Dead Letter Queue
- Logs coloridos para facilitar debug
- Tratamento de erros de conexão e tradução

