Perfeito! Agora tenho o panorama completo das rotas. Aqui estão
   todas as rotas disponíveis na aplicação para teste de envio de
   mensagens:

  📨 Rotas para Envio de Mensagens (Aplicação Geral):

  1. Envio de Mensagens para Clientes Autorizados:

  POST /webhook-message/enviar
  Headers: x-webhook-token: SEU_TOKEN

  Body exemplo:
  {
    "cnpj": "02.968.465/0001-66",
    "mensagem": {
      "texto": "Olá! Esta é uma mensagem de teste"
    }
  }

  2. Envio de Teste (Apenas em Desenvolvimento):

  POST /webhook-message/teste
  Sem necessidade de token, mas só funciona em modo
  desenvolvimento.

  3. Status e Validação:

  GET /webhook-message/status          - Status do serviço de   mensagens
  GET /webhook-message/health          - Health check rápido
  GET /webhook-message/validar-configuracao - Verifica todas as  configs
  GET /webhook-message/documentacao    - Documentação completa  (dev only)

  🔧 Rotas para Teste de Conectividade (Módulo Scheduled):

  Para WhatsApp:

  GET /scheduled/test/whatsapp         - Testa Evolution API
  GET /scheduled/test/email            - Testa SMTP
  GET /scheduled/test/all              - Testa ambos os serviços     

  Para Estatísticas e Status:

  GET /scheduled/status                - Status geral do cron        
  GET /scheduled/stats                 - Estatísticas detalhadas     
  GET /scheduled/validate-config       - Validação de env vars       

  📋 Exemplos de Uso:

  Teste completo de WhatsApp + Email:

  # Teste de conectividade
  curl http://localhost:3000/scheduled/test/all

  # Envio real de mensagem
  curl -X POST http://localhost:3000/webhook-message/enviar \        
    -H "Content-Type: application/json" \
    -H "x-webhook-token: SEU_TOKEN" \
    -d '{
      "cnpj": "02.968.465/0001-66",
      "mensagem": {
        "texto": "Mensagem de teste"
      }
    }'

  Teste em desenvolvimento (sem token):

  curl -X POST http://localhost:3000/webhook-message/teste \
    -H "Content-Type: application/json" \
    -d '{
      "cnpj": "02.968.465/0001-66",
      "mensagem": {
        "texto": "Teste de desenvolvimento"
      }
    }'

  🎯 Resumo das Rotas Principais:

  - /webhook-message/enviar - Produção: Envio real com  autenticação
  - /webhook-message/teste - Desenvolvimento: Envio sem token        
  - /scheduled/test/all - Conectividade: Testa WhatsApp + Email      
  - /scheduled/stats - Monitoramento: Estatísticas dos serviços      

  Essas são todas as rotas disponíveis para teste e envio de
  mensagens na sua aplicação!