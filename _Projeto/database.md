Criei o arquivo `src/config/database.js` com todas as funcionalidades necessárias:

## **Funcionalidades Implementadas:**

**🔧 Configuração:**
- Pool de conexões MySQL otimizado
- Carregamento de variáveis de ambiente
- Configurações de timeout e reconexão

**📊 Funções Principais:**
- `getClienteByCNPJ()` - Busca cliente por CNPJ
- `getClienteByCelular()` - Verificação inicial por celular
- `getBoletosByCNPJ()` - Lista boletos em aberto
- `registrarAtendimento()` - Cria registro de atendimento
- `atualizarConversa()` - Atualiza histórico da conversa

**🛠️ Funções Utilitárias:**
- `executeQuery()` - Execução genérica de queries
- `testConnection()` - Teste de conectividade
- `closePool()` - Fechamento seguro das conexões

**✅ Características:**
- Tratamento completo de erros
- Queries parametrizadas (segurança SQL injection)
- Retorno padronizado `{success, data, error}`
- Suporte a JSON para campo `conversa`

**Qual arquivo gostaria que eu crie em seguida?** Sugiro:
- `src/config/evolution.js` (configuração da API Evolution)
- `src/services/whatsappService.js` (serviços do WhatsApp)
- `src/index.js` (arquivo principal)