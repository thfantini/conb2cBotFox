## Instruções para Inclusão das Rotas QR Code no `index.js`

### **1. Importação das Rotas**

**Localização:** Linha ~11, junto com as outras importações de rotas

**Adicionar após a linha:**
```javascript
const webhookRoutes = require('./routes/webhook');
```

**Nova linha a ser adicionada:**
```javascript
const qrcodeRoutes = require('./routes/qrcode');
```

### **2. Configuração das Rotas**

**Localização:** Função `setupRoutes()`, linha ~98, após a configuração das rotas de webhook

**Adicionar após o bloco:**
```javascript
// Rotas de webhook
this.app.use('/webhook', webhookRoutes);
```

**Novo bloco a ser adicionado:**
```javascript
// Rotas de QR Code
this.app.use('/qrcode', qrcodeRoutes);
```

### **3. Atualização da Rota Raiz (Opcional)**

**Localização:** Função `setupRoutes()`, linha ~82, dentro da rota `GET /`

**Modificar o JSON de resposta para incluir informação sobre QR Code:**

**De:**
```javascript
this.app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'WhatsApp Bot API',
        version: require('../package.json').version,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});
```

**Para:**
```javascript
this.app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'WhatsApp Bot API',
        version: require('../package.json').version,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        endpoints: {
            webhook: '/webhook',
            qrcode: '/qrcode',
            health: '/health',
            info: '/info'
        }
    });
});
```

### **4. Modificações Completas no Arquivo**

**Resultado final das seções modificadas:**

```javascript
// Importações dos módulos do projeto (linha ~11)
const logger = require('./utils/logger');
const database = require('./config/database');
const evolutionAPI = require('./config/evolution');
const webhookRoutes = require('./routes/webhook');
const qrcodeRoutes = require('./routes/qrcode');  // ← NOVA LINHA

// ... resto do código ...

/**
 * Configura rotas da aplicação
 */
setupRoutes() {
    logger.debug('🛣️ Configurando rotas...', { context: 'setup' });

    // Rota raiz
    this.app.get('/', (req, res) => {
        res.json({
            success: true,
            message: 'WhatsApp Bot API',
            version: require('../package.json').version,
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
            endpoints: {                                    // ← NOVO BLOCO
                webhook: '/webhook',
                qrcode: '/qrcode',
                health: '/health',
                info: '/info'
            }
        });
    });

    // Rotas de webhook
    this.app.use('/webhook', webhookRoutes);

    // Rotas de QR Code                                    // ← NOVA LINHA
    this.app.use('/qrcode', qrcodeRoutes);                // ← NOVA LINHA

    // ... resto das rotas (health, info) ...
}
```

### **5. Endpoints Disponíveis Após a Implementação**

Após essas modificações, os seguintes endpoints estarão disponíveis:

**QR Code:**
- `GET /qrcode` - Obter QR Code
- `POST /qrcode/conectar` - Iniciar processo de conexão
- `GET /qrcode/status` - Status da conexão
- `POST /qrcode/reiniciar` - Reiniciar instância
- `POST /qrcode/desconectar` - Desconectar
- `GET /qrcode/informacoes` - Informações detalhadas
- `GET /qrcode/monitorar` - Monitorar conexão
- `GET /qrcode/teste` - Teste de disponibilidade
- `GET /qrcode/health` - Health check

**Webhook (existentes):**
- `POST /webhook/mensagem` - Receber mensagens
- `GET /webhook/status` - Status do webhook
- Outros endpoints do webhook...

### **6. Teste Após Implementação**

Para testar se a implementação está funcionando:

```bash
# Teste básico
curl http://localhost:3000/qrcode/teste

# Verificar status
curl http://localhost:3000/qrcode/status

# Verificar rota raiz com novos endpoints
curl http://localhost:3000/
```

### **Resumo das Alterações**

✅ **2 linhas adicionadas** no total
✅ **1 importação** nova: `const qrcodeRoutes = require('./routes/qrcode');`
✅ **1 rota** nova: `this.app.use('/qrcode', qrcodeRoutes);`
✅ **Opcional:** Atualização da rota raiz com informações dos endpoints

As modificações são mínimas e seguem exatamente o padrão já estabelecido no projeto.