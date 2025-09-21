Pronto! Agora você tem as seguintes rotas para testar as
  conexões:

  🔧 Rotas para Teste de Conectividade:

  1. Teste WhatsApp Evolution API:

  GET /scheduled/test/whatsapp
  - Testa a conectividade com a Evolution API
  - Verifica status da instância WhatsApp
  - Retorna detalhes da conexão

  2. Teste SMTP Email:

  GET /scheduled/test/email
  - Testa a conectividade SMTP
  - Verifica configurações de email
  - Valida credenciais SMTP

  3. Teste Geral (Ambos):

  GET /scheduled/test/all
  - Testa WhatsApp e Email simultaneamente
  - Retorna status consolidado
  - Ideal para verificação rápida

  4. Estatísticas dos Serviços:

  GET /scheduled/stats
  - Estatísticas detalhadas de todos os serviços
  - Contadores de envios, falhas, sucessos
  - Informações de uptime e performance

  5. Outras rotas úteis:

  GET /scheduled/status          - Status geral do serviço
  GET /scheduled/health          - Health check completo
  GET /scheduled/config          - Configuração atual
  GET /scheduled/validate-config - Validação de variáveis de
  ambiente
  POST /scheduled/trigger        - Executar cron manualmente
  (requer token)

  📝 Exemplos de uso:

  # Testar WhatsApp
  curl http://localhost:3000/scheduled/test/whatsapp

  # Testar Email
  curl http://localhost:3000/scheduled/test/email

  # Testar ambos
  curl http://localhost:3000/scheduled/test/all

  # Ver estatísticas
  curl http://localhost:3000/scheduled/stats

  As rotas agora estão integradas com os serviços reais e vão        
  mostrar o status verdadeiro das conexões!
