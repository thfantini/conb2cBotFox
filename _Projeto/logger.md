Criei o arquivo `src/utils/logger.js` com um sistema completo e avançado de logging:

## **Funcionalidades Principais:**

**📊 Níveis de Log:**
- `ERROR` - Erros críticos
- `WARN` - Avisos importantes  
- `INFO` - Informações gerais
- `DEBUG` - Detalhes para desenvolvimento

**📍 Múltiplos Destinos:**
- **Console** - Com cores em desenvolvimento
- **Arquivo** - Para produção com rotação automática
- Configuração dinâmica por ambiente

**🎨 Formatação Rica:**
- Timestamp ISO, PID do processo
- Correlation ID para rastreamento
- Contexto da operação
- Metadados estruturados em JSON

**🔒 Segurança:**
- **Sanitização automática** de dados sensíveis
- Remove: passwords, tokens, CNPJ, telefones, emails
- Sanitização recursiva em objetos complexos

**🔄 Rotação de Logs:**
- Arquivo máximo: 10MB
- Mantém últimos 5 arquivos
- Limpeza automática de logs antigos
- Nomenclatura com timestamp

**🎯 Logs Especializados:**
- `webhook()` - Mensagens WhatsApp (phone sanitizado)
- `database()` - Operações de banco
- `external()` - APIs externas (Evolution)

**⚙️ Configuração Inteligente:**
- Desenvolvimento: DEBUG + cores + console
- Produção: INFO + arquivo + sem cores
- Variáveis de ambiente personalizáveis

**✅ Características Especiais:**
- Instância singleton para consistência
- Criação automática de diretórios
- Fallback robusto em caso de erro
- Integração com correlation IDs
- Suporte a metadados estruturados

**📝 Exemplo de Uso:**
```javascript
logger.info('Bot iniciado', { version: '1.0.0' });
logger.webhook('5531999999999', 'Olá', 'incoming');
logger.database('SELECT', 'vw_botClientes', { cnpj: 'XXX' });
logger.error('Erro na API', { service: 'evolution' });
```

**Qual arquivo gostaria que eu crie em seguida?** Sugiro:
- `src/index.js` (arquivo principal que integra tudo)
- `README.md` (documentação completa)
- `docker-compose.yml` (para ambiente de desenvolvimento)