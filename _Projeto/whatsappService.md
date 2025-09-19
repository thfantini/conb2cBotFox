Criei o arquivo `src/services/whatsappService.js` com toda a lógica de negócio do bot:

## **Funcionalidades Implementadas:**

**🔄 Fluxo Principal:**
- **Verificação inicial** por número de celular (vai direto ao menu se cadastrado)
- **Solicitação de CNPJ** se número não encontrado
- **Validação de CNPJ** com formatação automática
- **Menu com 5 opções** conforme especificado

**📱 Processamento Inteligente:**
- Cache de conversas ativas em memória
- Estados bem definidos (`INICIO`, `AGUARDANDO_CNPJ`, `MENU_PRINCIPAL`)
- Processamento de mensagens do webhook Evolution
- Marcação automática como "lida"

**🎯 Opções do Menu:**
1. **Boletos** - Busca na `vw_boletos`, formata valores e datas
2. **Notas Fiscais** - Estrutura pronta (aguardando view)
3. **Certificados** - Estrutura pronta (aguardando view)
4. **Propostas/Atendente** - Transferência para humanos

**💾 Registro Completo:**
- Histórico JSON na tabela `atendimento`
- Registro inicial com `messageId` do webhook
- Atualização contínua da conversa
- Estrutura: `{tipo: cliente/bot, data, mensagem}`

**✅ Características Especiais:**
- Mensagens personalizadas com nome do cliente
- Formatação rica (emojis, negrito, valores em R$)
- Validações de CNPJ (14 dígitos)
- Suporte a "MENU", "SAIR", "ATENDENTE"
- Limpeza automática de cache

**Qual arquivo gostaria que eu crie em seguida?** Sugiro:
- `src/controllers/webhookController.js` (controlador de webhook)
- `src/routes/webhook.js` (rotas da API)
- `src/index.js` (arquivo principal)