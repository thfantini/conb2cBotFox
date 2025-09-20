Perfeito! Criei o arquivo `src/controllers/qrcodeController.js` seguindo exatamente o padrão do `webhookController.js`.

**Funcionalidades implementadas:**

✅ **Endpoints principais:**
- `obterQRCode()` - GET/POST para obter QR code
- `verificarStatus()` - Verifica status da conexão WhatsApp
- `reiniciarInstancia()` - Reinicia instância para novo QR
- `desconectar()` - Desconecta instância WhatsApp
- `obterInformacoes()` - Informações detalhadas da instância
- `monitorarConexao()` - Monitora até estabelecer conexão
- `iniciarConexao()` - Processo completo (reinicia + QR)
- `testarDisponibilidade()` - Teste de funcionamento

✅ **Middlewares:**
- `logRequest()` - Log específico para QR Code
- `validarTokenQR()` - Validação de token de segurança

✅ **Padrão seguido:**
- Mesmo formato de resposta JSON
- Status codes apropriados (200, 201, 400, 408, 500, 503)
- Tratamento de erros consistente
- Logs com emojis como outros controllers
- Informações detalhadas apenas em desenvolvimento

O controlador está pronto e integrado com o `QRCodeService` criado anteriormente.

Posso prosseguir criando as **rotas do QR Code** (`src/routes/qrcode.js`)?