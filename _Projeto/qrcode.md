Perfeito! Criei o arquivo `src/routes/qrcode.js` seguindo exatamente o padrão do projeto.

**Rotas implementadas:**

✅ **Rotas principais:**
- `GET /qrcode` - Obter QR Code para conexão
- `POST /qrcode/conectar` - Processo completo de conexão (principal)
- `GET /qrcode/status` - Verificar status da conexão
- `POST /qrcode/reiniciar` - Reiniciar instância
- `POST /qrcode/desconectar` - Desconectar instância
- `GET /qrcode/informacoes` - Informações detalhadas
- `GET /qrcode/monitorar` - Monitorar até conectar
- `POST /qrcode/obter` - Método POST alternativo
- `GET /qrcode/teste` - Teste de disponibilidade
- `GET /qrcode/health` - Health check

✅ **Desenvolvimento apenas:**
- `GET /qrcode/debug` - Informações de debug
- `POST /qrcode/simular-conexao` - Simulação para testes

✅ **Middlewares:**
- Log de requisições específico para QR Code
- Validação de token de segurança
- Tratamento de erros específico
- Handler para rotas não encontradas

✅ **Padrão seguido:**
- Mesma estrutura do `webhook.js`
- Mesmos padrões de resposta JSON
- Logs com emojis consistentes
- Funcionalidades condicionais para desenvolvimento

Agora preciso **integrar as rotas no `index.js`**. Posso fazer a modificação no arquivo principal para incluir as rotas de QR Code?

A modificação seria simples, apenas importar e usar as rotas QR Code da mesma forma que as rotas de webhook já estão configuradas.