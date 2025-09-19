Criei o arquivo `src/middleware/errorHandler.js` com um sistema completo de tratamento de erros:

## **Funcionalidades Implementadas:**

**🎯 Middleware Principal:**
- `errorHandler()` - Captura todos os erros da aplicação
- Classificação automática de erros por tipo
- Respostas padronizadas com status codes corretos
- Fallback robusto em caso de erro no próprio handler

**📊 Classificação de Erros:**
- **400** - Validação, JSON inválido
- **401** - Autenticação
- **403** - Autorização
- **404** - Não encontrado
- **422** - Lógica de negócio
- **500** - Erros internos
- **502** - APIs externas (Evolution)
- **503** - Banco de dados

**📝 Logging Detalhado:**
- Timestamp, método, path, IP, User-Agent
- Correlation ID para rastreamento
- Stack trace em desenvolvimento
- Sanitização de dados sensíveis (tokens, passwords)

**🛡️ Handlers Globais:**
- `uncaughtException` - Exceções não capturadas
- `unhandledRejection` - Promises rejeitadas
- Shutdown graceful em caso de erro crítico

**⚙️ Utilitários:**
- `notFoundHandler()` - Middleware para rotas 404
- `addCorrelationId()` - Adiciona ID único por requisição
- `AppError` - Classe para erros operacionais customizados
- `initializeErrorHandlers()` - Inicializa handlers globais

**✅ Características Especiais:**
- Diferenciação entre produção e desenvolvimento
- Prevenção de vazamento de dados sensíveis
- Correlation ID para rastreamento de bugs
- Respostas consistentes em formato JSON
- Headers de resposta apropriados

**🔧 Tipos de Erro Suportados:**
```javascript
VALIDATION, DATABASE, AUTHENTICATION, 
AUTHORIZATION, NOT_FOUND, EXTERNAL_API, 
BUSINESS_LOGIC, INTERNAL
```

**Qual arquivo gostaria que eu crie em seguida?** Sugiro:
- `src/index.js` (arquivo principal do servidor)
- `src/utils/logger.js` (sistema de logs avançado)
- `README.md` (documentação do projeto)