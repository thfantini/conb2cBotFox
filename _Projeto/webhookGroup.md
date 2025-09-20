Criei o arquivo de rotas `webhookGroup.js` seguindo exatamente o padrão do projeto. O arquivo implementa:

## ✅ **Rotas Criadas:**

### **📡 Endpoints Principais**
- `POST /webhook-group/mensagem` - Recebe mensagens de grupos
- `GET /webhook-group/status` - Status do serviço  
- `GET /webhook-group/teste` - Teste de conectividade

### **🛠️ Endpoints Administrativos**
- `GET /webhook-group/validar-grupo/:groupId` - Valida grupo específico
- `GET /webhook-group/tabelas-destino` - Lista tabelas disponíveis
- `GET /webhook-group/estatisticas` - Métricas de processamento

### **🧪 Desenvolvimento**
- `POST /webhook-group/teste-mensagem` - Simula mensagens (apenas dev)
- Suporta tipos: `text`, `image`, `document`

### **📊 Monitoramento**
- `GET /webhook-group/health` - Health check específico
- Logs independentes com prefixo "GRUPO"

## ✅ **Características:**

- ✅ **Independência**: Não interfere no sistema principal
- ✅ **Reutilização**: Usa validação de token existente
- ✅ **Padrão**: Segue estrutura do `webhook.js`
- ✅ **Tratamento**: Erros específicos para grupos
- ✅ **Desenvolvimento**: Endpoints de teste e validação

**Próximo passo: Integrar as rotas no `index.js`?** Preciso adicionar a importação e configuração das rotas de grupos no arquivo principal da aplicação para que fiquem acessíveis.