Criei o arquivo `src/controllers/webhookController.js` com todas as funcionalidades para gerenciar webhooks da API Evolution:

## **Funcionalidades Principais:**

**📨 Processamento de Mensagens:**
- `receberMensagem()` - Endpoint principal para webhooks
- Validação completa da estrutura do webhook
- Processamento em lote de múltiplas mensagens
- Logs detalhados para debug

**🔍 Validações Rigorosas:**
- Ignora mensagens do próprio bot (`fromMe`)
- Filtra grupos e status do WhatsApp
- Verifica conteúdo de texto válido
- Rejeita mensagens antigas (>5 minutos)
- Valida formato de números brasileiros

**🔒 Segurança:**
- `validarToken()` - Middleware de autenticação
- Verificação via header ou query parameter
- `logRequest()` - Log de todas as requisições
- Controle de acesso por token

**🛠️ Endpoints Utilitários:**
- `verificarStatus()` - Status do webhook
- `validarConfiguracao()` - Teste de configuração
- `testarConectividade()` - Teste de conectividade
- Informações do servidor e ambiente

**✅ Características Especiais:**
- Suporte a diferentes tipos de mensagem (texto, botões, listas)
- Tratamento individual de erros por mensagem
- Resposta padronizada para Evolution API
- Logs condicionais por ambiente
- Contadores de mensagens processadas

**📊 Tipos Suportados:**
- `conversation` - Mensagens de texto
- `extendedTextMessage` - Texto com formatação
- `buttonsResponseMessage` - Respostas de botões
- `listResponseMessage` - Seleções de lista

**Qual arquivo gostaria que eu crie em seguida?** Sugiro:
- `src/routes/webhook.js` (rotas da API)
- `src/index.js` (arquivo principal)
- `src/middleware/errorHandler.js` (tratamento de erros)