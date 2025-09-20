## 📋 **Instruções Completas para Inclusão das Rotas no index.js**

### **1. Importação das Rotas de Grupos**

No arquivo `src/index.js`, adicione a importação das rotas de grupos logo após a importação das rotas de webhook existentes:

**Localizar esta linha (aproximadamente linha 9):**
```javascript
const webhookRoutes = require('./routes/webhook');
```

**Adicionar logo após:**
```javascript
const webhookGroupRoutes = require('./routes/webhookGroup');
```

### **2. Registrar as Rotas no Método setupRoutes()**

No método `setupRoutes()`, adicione o registro das rotas de grupos logo após o registro das rotas de webhook existentes:

**Localizar esta seção (aproximadamente linha 95-98):**
```javascript
// Rotas de webhook
this.app.use('/webhook', webhookRoutes);
```

**Adicionar logo após:**
```javascript
// Rotas de webhook para grupos
this.app.use('/webhook-group', webhookGroupRoutes);
```

### **3. Código Completo das Alterações**

**ANTES (seção de importações):**
```javascript
// Importações dos módulos do projeto
const logger = require('./utils/logger');
const database = require('./config/database');
const evolutionAPI = require('./config/evolution');
const webhookRoutes = require('./routes/webhook');
const { 
    errorHandler, 
    notFoundHandler, 
    addCorrelationId, 
    initializeErrorHandlers 
} = require('./middleware/errorHandler');
```

**DEPOIS (seção de importações):**
```javascript
// Importações dos módulos do projeto
const logger = require('./utils/logger');
const database = require('./config/database');
const evolutionAPI = require('./config/evolution');
const webhookRoutes = require('./routes/webhook');
const webhookGroupRoutes = require('./routes/webhookGroup');
const { 
    errorHandler, 
    notFoundHandler, 
    addCorrelationId, 
    initializeErrorHandlers 
} = require('./middleware/errorHandler');
```

**ANTES (método setupRoutes):**
```javascript
// Rotas de webhook
this.app.use('/webhook', webhookRoutes);

// Rota de health check
this.app.get('/health', async (req, res) => {
```

**DEPOIS (método setupRoutes):**
```javascript
// Rotas de webhook
this.app.use('/webhook', webhookRoutes);

// Rotas de webhook para grupos
this.app.use('/webhook-group', webhookGroupRoutes);

// Rota de health check
this.app.get('/health', async (req, res) => {
```

### **4. Localização Exata das Mudanças**

**📍 Linha ~9 (após importações principais):**
```javascript
+ const webhookGroupRoutes = require('./routes/webhookGroup');
```

**📍 Linha ~98 (após registro webhook principal):**
```javascript
+ // Rotas de webhook para grupos
+ this.app.use('/webhook-group', webhookGroupRoutes);
```

### **5. Verificação das Rotas Ativas**

Após as alterações, as seguintes rotas estarão disponíveis:

**🔹 Webhook Principal (existente):**
- `POST /webhook/mensagem`
- `GET /webhook/status`
- `GET /webhook/validar`

**🔹 Webhook Grupos (novo):**
- `POST /webhook-group/mensagem`
- `GET /webhook-group/status`
- `GET /webhook-group/validar-grupo/:groupId`
- `GET /webhook-group/tabelas-destino`

### **6. Teste de Funcionamento**

Após reiniciar a aplicação, verificar se as rotas estão funcionando:

```bash
# Testar webhook de grupos
curl http://localhost:3000/webhook-group/status

# Resposta esperada:
{
  "success": true,
  "message": "Webhook de grupos ativo",
  "service": "webhook-group-controller"
}
```

### **7. Log de Inicialização**

No console, você deve ver:
```
🛣️ Configurando rotas... 
📡 Rotas de webhook registradas
📡 Rotas de webhook de grupos registradas
```

### **8. Estrutura Final de Rotas**

```
/
├── webhook/
│   ├── mensagem (POST)
│   ├── status (GET)
│   └── validar (GET)
└── webhook-group/
    ├── mensagem (POST)
    ├── status (GET)
    ├── validar-grupo/:id (GET)
    └── tabelas-destino (GET)
```

**✅ As alterações são mínimas e não afetam nenhuma funcionalidade existente!**