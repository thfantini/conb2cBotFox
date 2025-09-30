## 📋 **Instruções Completas para Integração no index.js**

### **1. Adicionar Import das Novas Rotas**

No início do arquivo `src/index.js`, adicione a importação da nova rota após as importações existentes:

```javascript
// Importações dos módulos do projeto
const logger = require('./utils/logger');
const database = require('./config/database');
const evolutionAPI = require('./config/evolution');
const webhookRoutes = require('./routes/webhook');
const webhookMessageRoutes = require('./routes/webhookMessage'); // ← NOVA LINHA
```

### **2. Configurar a Nova Rota**

Na função `setupRoutes()`, adicione a nova rota após a linha existente do webhook:

```javascript
setupRoutes() {
    logger.debug('🛣️ Configurando rotas...', { context: 'setup' });

    // Rota raiz
    this.app.get('/', (req, res) => {
        res.json({
            success: true,
            message: 'WhatsApp Bot API',
            version: require('../package.json').version,
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development'
        });
    });

    // Rotas de webhook
    this.app.use('/webhook', webhookRoutes);
    
    // Rotas de webhook-message (micro-serviço)
    this.app.use('/webhook-message', webhookMessageRoutes); // ← NOVA LINHA

    // Rota de health check
    this.app.get('/health', async (req, res) => {
        // ... resto do código existente
```

### **3. Adicionar Dependência do Nodemailer**

Execute o comando para instalar a dependência necessária:

```bash
npm install nodemailer
```

### **4. Atualizar Variáveis de Ambiente**

Adicione as novas variáveis no arquivo `.env`:

```env
# Configurações SMTP para Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu_email@empresa.com
SMTP_PASS=sua_senha_app
SMTP_FROM=noreply@empresa.com

# Configurações específicas do webhook-message
COMPANY_NAME=Nome da Empresa
```

### **5. Criar Estrutura de Pastas**

Certifique-se que a estrutura de pastas inclui:

```
src/
├── controllers/
│   ├── webhookController.js (existente)
│   └── webhookMessagesController.js (novo)
├── services/
│   ├── whatsappService.js (existente)
│   ├── whatsappMessageService.js (novo)
│   └── emailMessageService.js (novo)
└── routes/
    ├── webhook.js (existente)
    └── webhookMessage.js (novo)
```

### **6. Criar View no Banco de Dados**

Execute o SQL para criar a view necessária:

```sql
-- Criar view whapi_empresas (exemplo baseado na estrutura existente)
CREATE VIEW whapi_empresas AS
SELECT DISTINCT 
    cliente,
    cnpj,
    nome,
    celular as celular,
    email as email,
    1 as status
FROM vw_botClientes
WHERE celular IS NOT NULL 
AND cnpj IS NOT NULL;
```

### **7. Verificar Health Check (Opcional)**

Para validar que tudo está funcionando, adicione verificação dos novos serviços no health check existente:

```javascript
// Na função getHealthStatus() em index.js, adicionar:
async getHealthStatus() {
    const checks = {
        database: false,
        evolution: false,
        whatsapp_service: false, // ← NOVO
        email_service: false     // ← NOVO
    };

    // Checks existentes...
    
    // Check WhatsApp Message Service
    try {
        const WhatsAppMessageService = require('./services/whatsappMessageService');
        checks.whatsapp_service = await WhatsAppMessageService.verificarDisponibilidade();
    } catch (error) {
        logger.debug('Health check whatsapp service falhou', { error: error.message });
    }

    // Check Email Message Service  
    try {
        const EmailMessageService = require('./services/emailMessageService');
        checks.email_service = await EmailMessageService.verificarDisponibilidade();
    } catch (error) {
        logger.debug('Health check email service falhou', { error: error.message });
    }

    // ... resto do código existente
}
```

### **8. Comandos de Teste**

Após implementar, teste com:

```bash
# Verificar se o serviço subiu
curl http://localhost:3000/webhook-message/status

# Testar configurações
curl http://localhost:3000/webhook-message/validar-configuracao

# Teste de envio (desenvolvimento)
curl -X POST http://localhost:3000/webhook-message/teste \
  -H "Content-Type: application/json" \
  -d '{
    "cnpj": "02.968.465/0001-66",
    "mensagem": {
      "texto": "Teste de mensagem"
    }
  }'
```

### **9. Resumo das Modificações**

- ✅ **1 linha** de import no início do `index.js`
- ✅ **1 linha** de rota na função `setupRoutes()`  
- ✅ **1 dependência** npm (nodemailer)
- ✅ **Variáveis** de ambiente para SMTP
- ✅ **View** no banco de dados (whapi_empresas)

### **10. Arquivo Completo das Rotas**

O micro-serviço estará disponível em:
- `POST /webhook-message/enviar` - Envio principal
- `GET /webhook-message/status` - Status dos serviços
- `GET /webhook-message/health` - Health check
- `GET /webhook-message/validar-configuracao` - Validar env vars

**Essas são todas as modificações necessárias para integrar completamente o micro-serviço!**