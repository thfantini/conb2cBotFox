Criei o arquivo `src/routes/webhook.js` com todas as rotas necessárias para o webhook:

## **Rotas Implementadas:**

**📨 Rota Principal:**
- `POST /webhook/mensagem` - Recebe mensagens da Evolution API
- Aplica validação de token antes do processamento
- Utiliza middleware de log para todas as requisições

**🔍 Rotas de Monitoramento:**
- `GET /webhook/status` - Status do webhook (sem autenticação)
- `GET /webhook/validar` - Validação de configuração (com token)
- `GET /webhook/teste` - Teste de conectividade
- `GET /webhook/health` - Health check para load balancers

**🛠️ Desenvolvimento:**
- `POST /webhook/teste-mensagem` - Simula mensagens (apenas dev)
- Estrutura que replica formato do webhook Evolution
- Útil para testes sem enviar via WhatsApp

**⚙️ Middlewares:**
- `logRequest` - Log de todas as requisições
- `validarToken` - Autenticação por token
- Tratamento de erros específico para webhook
- Handler para rotas não encontradas

**✅ Características:**
- Documentação completa das rotas disponíveis
- Logs condicionais por ambiente
- Resposta padronizada para rotas 404
- Health check simples para monitoramento
- Estrutura de teste completa

**📊 Endpoints Disponíveis:**
```
POST /webhook/mensagem     - Receber mensagens
GET  /webhook/status       - Status do serviço
GET  /webhook/validar      - Validar configuração
GET  /webhook/teste        - Teste de conectividade
GET  /webhook/health       - Health check
POST /webhook/teste-mensagem - Simular mensagem (dev)
```

**Qual arquivo gostaria que eu crie em seguida?** Sugiro:
- `src/index.js` (arquivo principal do servidor)
- `src/middleware/errorHandler.js` (tratamento global de erros)
- `src/utils/logger.js` (sistema de logs)