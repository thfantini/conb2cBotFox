Criei o arquivo `src/config/evolution.js` com todas as funcionalidades para integração com a API Evolution:

## **Funcionalidades Implementadas:**

**📱 Envio de Mensagens:**
- `sendTextMessage()` - Mensagens de texto simples
- `sendButtonMessage()` - Mensagens com botões (menu)
- `sendListMessage()` - Listas de opções

**🔧 Configuração:**
- `setWebhook()` - Configura webhook para receber mensagens
- `getInstanceStatus()` - Verifica status da instância
- `connectInstance()` - Conecta instância do WhatsApp

**⚙️ Utilitários:**
- `markMessageAsRead()` - Marca mensagens como lidas
- `testConnection()` - Testa conectividade com API
- `formatPhoneNumber()` - Formata números para padrão brasileiro

**✅ Características:**
- Cliente HTTP configurado com timeout e headers
- Tratamento completo de erros
- Retorno padronizado `{success, data, error}`
- Formatação automática de números brasileiros
- Suporte a eventos de webhook

**🔄 Eventos Configurados:**
- `MESSAGE_RECEIVED` - Mensagens recebidas
- `MESSAGE_SENT` - Mensagens enviadas
- `CONNECTION_UPDATE` - Atualizações de conexão

**Qual arquivo gostaria que eu crie em seguida?** Sugiro:
- `src/services/whatsappService.js` (lógica de negócio do bot)
- `src/controllers/webhookController.js` (controlador de webhook)
- `src/index.js` (arquivo principal)