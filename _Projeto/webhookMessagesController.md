Analisando o projeto e as diretrizes, entendo que preciso criar um micro-serviço independente para envio de mensagens para clientes autorizados. Vou seguir a estrutura modular proposta.

Vou começar criando o **webhookMessagesController.js** que será o controlador específico para a rota `/webhook-group`. Este arquivo seguirá o padrão do código existente e implementará as regras de validação e envio.Criei o **webhookMessagesController.js** seguindo o padrão do projeto existente. Este controller implementa:

## ✅ **Funcionalidades Implementadas:**

1. **Validação completa da requisição** - CNPJ e estrutura da mensagem (texto/imagem)
2. **Validação do cliente autorizado** - Consulta na view `whapi_clientes` com status=1
3. **Estrutura preparada** para integração com serviços de WhatsApp e Email
4. **Middleware de segurança** - Token validation e logging específico
5. **Endpoint de status** para monitoramento do micro-serviço

## 🔧 **Principais Métodos:**

- `enviarMensagem()` - Método principal que processa o envio
- `validarRequisicao()` - Valida CNPJ e formato da mensagem  
- `validarClienteAutorizado()` - Consulta e valida cliente na base
- `formatarCNPJ()` - Padronização do formato
- Middlewares de log e token

## 📋 **Regras Implementadas:**

✅ Validação de CNPJ (14 dígitos)  
✅ Verificação na view `whapi_clientes` com `status=1`  
✅ Validação de email e celular do cliente  
✅ Suporte para mensagens texto e imagem  
✅ Logging detalhado e sanitizado  

## 🔄 **Próximos Passos:**

O controller está preparado com TODOs para integração com:
- Serviço específico de WhatsApp 
- Serviço específico de Email

**Posso prosseguir criando o próximo arquivo?** Sugiro criar o **serviço de WhatsApp** (`whatsappMessageService.js`) que será responsável pelo envio das mensagens via Evolution API.

-------------------------------

Perfeito! Atualizei o **webhookMessagesController.js** com as integrações completas:

## ✅ **Atualizações Implementadas:**

### 🔗 **Integrações Adicionadas:**
- **WhatsAppMessageService** - Envio via Evolution API
- **EmailMessageService** - Envio via SMTP  
- **Tratamento de erros** independente para cada serviço
- **Logging detalhado** de sucessos e falhas

### 📊 **Status Check Avançado:**
- **Verificação de disponibilidade** de ambos os serviços
- **Estatísticas** de cada serviço
- **Status consolidado** (healthy/partial/unhealthy)
- **Métricas** em tempo real

### 🚀 **Funcionalidades:**
- **Envio paralelo** WhatsApp + Email
- **Tolerância a falhas** (um serviço pode falhar sem impactar o outro)
- **Resultados detalhados** com status de cada canal
- **Logs específicos** para troubleshooting

## 📋 **Resposta de Exemplo:**

```json
{
  "success": true,
  "message": "Mensagem processada com sucesso",
  "data": {
    "cnpj": "02.968.465/0001-66",
    "cliente": {
      "email": "cliente@empresa.com",
      "celular": "5531999999999"  
    },
    "whatsapp": {
      "success": true,
      "status": "enviado",
      "messageId": "ABC123"
    },
    "email": {
      "success": true, 
      "status": "enviado",
      "messageId": "XYZ789"
    }
  }
}
```

Agora preciso **criar a integração no arquivo principal** para registrar a rota `/webhook-message`. Posso prosseguir criando um arquivo de **atualização para o index.js**?


