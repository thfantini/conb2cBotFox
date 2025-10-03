# 🤖 WhatsApp Bot Atendimento

Bot de atendimento automatizado ao cliente integrado ao WhatsApp via API Evolution. Desenvolvido em Node.js com integração MySQL para consulta de boletos, notas fiscais e certificados.

## 📋 Índice

- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Arquitetura](#-arquitetura)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Execução](#-execução)
- [API Endpoints](#-api-endpoints)
- [Fluxo de Atendimento](#-fluxo-de-atendimento)
- [Estrutura do Banco](#-estrutura-do-banco)
- [Logs](#-logs)
- [Troubleshooting](#-troubleshooting)

## 🚀 Funcionalidades

### ✅ Atendimento Automatizado
- **Verificação automática** por número de celular
- **Identificação por CNPJ** para novos números
- **Menu interativo** com 5 opções principais
- **Registro completo** de conversas em formato JSON

### 📱 Integração WhatsApp
- **API Evolution** para envio/recebimento de mensagens
- **Webhook** para processar mensagens em tempo real
- **Marcação automática** como lida
- **Suporte a mensagens de texto, botões e listas**

### 💼 Serviços Oferecidos
1. **Boletos em Aberto** - Consulta com valor, vencimento e linha digitável
2. **Notas Fiscais** - Links para download (estrutura preparada)
3. **Certificados** - Último certificado disponível (estrutura preparada)
4. **Propostas Comerciais** - Transferência para atendimento humano
5. **Falar com Atendente** - Encaminhamento para fila de atendimento

### 🗄️ Integração Banco de Dados
- **MySQL** com view `vw_botBoletos` como fonte principal
- **Pool de conexões** otimizado para performance
- **Queries parametrizadas** para segurança SQL injection
- **Registro de atendimentos** na tabela `atendimento`

## 🛠️ Tecnologias

- **Node.js** 16+ - Runtime JavaScript
- **Express.js** - Framework web
- **MySQL** - Banco de dados
- **Evolution API** - Integração WhatsApp
- **Moment.js** - Manipulação de datas
- **Axios** - Cliente HTTP
- **dotenv** - Gerenciamento de variáveis

## 🏗️ Arquitetura

```
src/
├── config/          # Configurações
│   ├── database.js  # Conexão MySQL
│   └── evolution.js # API Evolution
├── controllers/     # Controladores
│   └── webhookController.js
├── middleware/      # Middlewares
│   └── errorHandler.js
├── routes/          # Rotas da API
│   └── webhook.js
├── services/        # Lógica de negócio
│   └── whatsappService.js
├── utils/           # Utilitários
│   └── logger.js
└── index.js         # Arquivo principal
```

## 📦 Instalação

### Pré-requisitos
- Node.js 16+ instalado
- MySQL 8+ rodando
- API Evolution configurada
- NGROK ou domínio público (para webhook)

### Clonar e Instalar
```bash
git clone <repository-url>
cd whatsapp-bot-atendimento
npm install
```

## ⚙️ Configuração

### 1. Variáveis de Ambiente
Copie o arquivo `.env.example` para `.env` e configure:

```bash
cp .env.example .env
```

### 2. Configurar `.env`
```env
# Servidor
PORT=3000
NODE_ENV=development

# Banco de Dados
DB_HOST=localhost
DB_PORT=3306
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=seu_database

# Evolution API
EVOLUTION_API_URL=https://sua-evolution-api.com
EVOLUTION_API_KEY=sua_chave_api
EVOLUTION_INSTANCE_NAME=sua_instancia

# Webhook
WEBHOOK_URL=https://seu-dominio.com
WEBHOOK_TOKEN=token_seguranca

# Bot
COMPANY_NAME=Sua Empresa
BOT_NAME=Bot Atendimento
```

### 3. Estrutura do Banco
Certifique-se que existam as tabelas:

**View `vw_botBoletos`:**
```sql
SELECT 
    cliente, cnpj, nome, celular, nfse, conta,
    empNome, empCNPJ, dataDoc, dataVencimento,
    numero, valor, codBarras, linhaDigitavel
FROM sua_tabela_base;
```

**Tabela `whapi_atendimento`:**
```sql
CREATE TABLE whapi_atendimento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    messageId VARCHAR(100) NOT NULL,
    cliente INT,
    cnpj VARCHAR(20),
    data DATETIME DEFAULT CURRENT_TIMESTAMP,
    conversa JSON
);
```

## 🚀 Execução

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm start
```

### Verificar Status
```bash
curl http://localhost:3000/health
```

## 📡 API Endpoints

### Webhook
- `POST /webhook/mensagem` - Recebe mensagens do WhatsApp
- `GET /webhook/status` - Status do webhook
- `GET /webhook/validar` - Valida configuração

### Monitoramento
- `GET /` - Informações da API
- `GET /health` - Health check completo
- `GET /info` - Métricas do sistema

### Desenvolvimento
- `POST /webhook/teste-mensagem` - Simula mensagem (apenas dev)

## 🔄 Fluxo de Atendimento

### 1. Recebimento da Mensagem
```
WhatsApp → Evolution API → Webhook → Bot
```

### 2. Verificação do Cliente
```
Número existe na base? 
├── SIM → Menu Principal
└── NÃO → Solicita CNPJ
```

### 3. Identificação por CNPJ
```
CNPJ válido na base?
├── SIM → Menu Principal + Registro Atendimento
└── NÃO → Opção Atendente + Finaliza
```

### 4. Menu de Opções
```
1️⃣ Boletos em Aberto
2️⃣ Notas Fiscais  
3️⃣ Certificados
4️⃣ Propostas Comerciais
5️⃣ Falar com Atendente
```

### 5. Processamento das Opções
- **Opção 1**: Busca boletos em `vw_botBoletos` e formata resposta
- **Opção 2/3**: Mensagem informativa (aguardando implementação)
- **Opção 4/5**: Transfere para atendimento humano

## 🗄️ Estrutura do Banco

### View `vw_botBoletos`
```json
{
  "cliente": 5,
  "cnpj": "02.968.465/0001-66",
  "nome": "LABORATORIO FANTINI LTDA.",
  "celular": "5531994931105",
  "nfse": 190037,
  "conta": 210443,
  "empNome": "AMBIENTEC SOLUCOES EM RESIDUOS LTDA",
  "empCNPJ": "11.399.773/0001-09",
  "dataDoc": "2025-09-02 07:50:45.377",
  "dataVencimento": "2025-09-28 00:00:00.000",
  "numero": "210443-1",
  "valor": 157.79,
  "codBarras": "75692121800000157791314001099317418746595001",
  "linhaDigitavel": "75691.31407 01099.317412 87465.950019 2 12180000015779"
}
```

### Tabela `whapi_atendimento`
```json
{
  "id": 1,
  "messageId": "3EB0C12345678901234567890ABCDEF",
  "cliente": 5,
  "cnpj": "02.968.465/0001-66", 
  "data": "2025-09-19 10:30:00",
  "conversa": [
    {
      "tipo": "cliente",
      "data": "2025-09-19 10:30:00",
      "mensagem": "olá, boa tarde!"
    },
    {
      "tipo": "bot", 
      "data": "2025-09-19 10:30:15",
      "mensagem": "Olá! Bem-vindo ao atendimento..."
    }
  ]
}
```

## 📝 Logs

### Configuração
- **Desenvolvimento**: Console colorido + nível DEBUG
- **Produção**: Arquivo `logs/bot.log` + nível INFO
- **Rotação**: Arquivos de 10MB, mantém últimos 5

### Tipos de Log
```javascript
logger.info('Mensagem geral');
logger.webhook('5531999999999', 'Texto da mensagem', 'incoming');
logger.database('SELECT', 'vw_botClientes', { cnpj: 'XXX' });
logger.external('evolution', 'sendMessage', { status: 'success' });
logger.error('Erro crítico', { context: 'startup' });
```

### Sanitização
Dados sensíveis são automaticamente removidos:
- Senhas, tokens, chaves API
- CNPJ, CPF, telefones, emails
- Campos marcados como sensíveis

## 🔧 Troubleshooting

### Problemas Comuns

**1. Erro de Conexão MySQL**
```bash
# Verificar se MySQL está rodando
systemctl status mysql

# Testar conexão
mysql -h localhost -u usuario -p database
```

**2. Webhook não recebe mensagens**
```bash
# Verificar URL pública
curl https://seu-dominio.com/webhook/status

# Testar Evolution API
curl -X GET "https://evolution-api/instance/connectionState/instancia" \
  -H "apikey: sua_chave"
```

**3. Bot não responde**
```bash
# Verificar logs
tail -f logs/bot.log

# Testar manualmente
curl -X POST "http://localhost:3000/webhook/teste-mensagem" \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "5531999999999", "message": "teste"}'
```

**4. Erro na formatação de boletos**
- Verificar se view `vw_botBoletos` existe
- Confirmar estrutura dos campos
- Validar formato das datas e valores

### Logs de Debug

**Ativar logs detalhados:**
```env
LOG_LEVEL=DEBUG
NODE_ENV=development
```

**Monitorar em tempo real:**
```bash
tail -f logs/bot.log | grep ERROR
```

### Health Check

**Verificar saúde completa:**
```bash
curl http://localhost:3000/health
```

**Resposta esperada:**
```json
{
  "status": "healthy",
  "checks": {
    "database": true,
    "evolution": true
  },
  "uptime": 3600
}
```

## 📄 Licença

Este projeto está sob licença ISC.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📞 Suporte

Para dúvidas e suporte técnico, consulte os logs da aplicação ou entre em contato com a equipe de desenvolvimento.

**Status da Aplicação**: ✅ Pronto para produção
**Última atualização**: Setembro 2025