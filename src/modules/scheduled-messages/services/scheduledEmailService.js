// src/modules/scheduled-messages/services/scheduledEmailService.js
// Adicionar esta configuração melhorada para o SMTP

class ScheduledEmailService {
    constructor() {
        this.transporter = null;
        this.isConfigured = false;
        this.connectionTested = false;
        this.maxRetries = 3;
        this.timeout = parseInt(process.env.SMTP_TIMEOUT) || 10000; // 10s timeout
        this.connectionTimeout = parseInt(process.env.SMTP_CONNECTION_TIMEOUT) || 30000; // 30s connection timeout
        
        this.initSMTP();
    }

    async initSMTP() {
        try {
            console.log('📧 [SCHEDULED-EMAIL] Inicializando configuração SMTP...');
            
            // Skip SMTP se configurado para pular
            if (process.env.SKIP_SMTP_TEST === 'true') {
                console.log('⏭️ [SCHEDULED-EMAIL] SMTP test ignorado por configuração');
                return;
            }

            if (!this.validateSMTPConfig()) {
                console.log('⚠️ [SCHEDULED-EMAIL] Configuração SMTP incompleta, serviço desabilitado');
                return;
            }

            const smtpConfig = {
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT) || 587,
                secure: process.env.SMTP_SECURE === 'true', // false para 587, true para 465
                connectionTimeout: this.connectionTimeout,
                greetingTimeout: this.timeout,
                socketTimeout: this.timeout,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                },
                // Configurações adicionais para ambiente Docker
                tls: {
                    rejectUnauthorized: false, // Para desenvolvimento
                    ciphers: 'SSLv3'
                },
                debug: process.env.NODE_ENV === 'development',
                logger: process.env.NODE_ENV === 'development'
            };

            console.log(`🔍 [SCHEDULED-EMAIL] Testando conexão com ${smtpConfig.host}:${smtpConfig.port}...`);
            console.log(`🔒 [SCHEDULED-EMAIL] Secure: ${smtpConfig.secure}, Timeout: ${this.connectionTimeout}ms`);

            this.transporter = nodemailer.createTransporter(smtpConfig);
            
            // Teste de conexão com timeout
            await this.testConnection();
            
            this.isConfigured = true;
            this.connectionTested = true;
            
            console.log(`✅ [SCHEDULED-EMAIL] SMTP configurado com sucesso: ${smtpConfig.host}:${smtpConfig.port}`);

        } catch (error) {
            console.error('❌ [SCHEDULED-EMAIL] Erro na configuração SMTP:', error.message);
            
            // Log adicional para debug
            if (process.env.NODE_ENV === 'development') {
                console.error('[SCHEDULED-EMAIL] Stack trace:', error.stack);
            }
            
            // Não quebrar a aplicação por erro de SMTP
            this.isConfigured = false;
            this.connectionTested = false;
            
            // Se estiver em produção, apenas avisar mas continuar
            if (process.env.NODE_ENV === 'production') {
                console.log('⚠️ [SCHEDULED-EMAIL] Continuando sem SMTP em produção...');
            }
        }
    }

    validateSMTPConfig() {
        const required = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS'];
        const missing = required.filter(key => !process.env[key]);
        
        if (missing.length > 0) {
            console.log(`⚠️ [SCHEDULED-EMAIL] Variáveis SMTP ausentes: ${missing.join(', ')}`);
            return false;
        }
        
        return true;
    }

    async testConnection() {
        return new Promise((resolve, reject) => {
            // Timeout manual para evitar travamento
            const timeoutId = setTimeout(() => {
                reject(new Error(`Timeout de conexão SMTP após ${this.connectionTimeout}ms`));
            }, this.connectionTimeout);

            this.transporter.verify((error, success) => {
                clearTimeout(timeoutId);
                
                if (error) {
                    console.error('❌ [SCHEDULED-EMAIL] Falha na verificação SMTP:', error.message);
                    reject(error);
                } else {
                    console.log('✅ [SCHEDULED-EMAIL] Conexão SMTP verificada com sucesso');
                    resolve(success);
                }
            });
        });
    }

    async sendEmail(emailData, retryCount = 0) {
        if (!this.isConfigured) {
            throw new Error('SMTP não configurado');
        }

        try {
            const mailOptions = {
                from: process.env.SMTP_FROM || process.env.SMTP_USER,
                to: emailData.to,
                subject: emailData.subject,
                html: emailData.html || emailData.text,
                text: emailData.text
            };

            const info = await this.transporter.sendMail(mailOptions);
            
            console.log('✅ [SCHEDULED-EMAIL] Email enviado:', {
                to: emailData.to.substring(0, 5) + '***',
                subject: emailData.subject,
                messageId: info.messageId
            });

            return {
                success: true,
                messageId: info.messageId,
                response: info.response
            };

        } catch (error) {
            console.error(`❌ [SCHEDULED-EMAIL] Erro ao enviar email (tentativa ${retryCount + 1}):`, error.message);

            // Retry logic
            if (retryCount < this.maxRetries) {
                console.log(`🔄 [SCHEDULED-EMAIL] Tentando reenvio em 2s...`);
                await new Promise(resolve => setTimeout(resolve, 2000));
                return this.sendEmail(emailData, retryCount + 1);
            }

            throw error;
        }
    }

    // Método para reinicializar SMTP se necessário
    async reinitialize() {
        console.log('🔄 [SCHEDULED-EMAIL] Reinicializando SMTP...');
        this.isConfigured = false;
        this.connectionTested = false;
        this.transporter = null;
        
        await this.initSMTP();
    }

    // Health check
    async healthCheck() {
        return {
            configured: this.isConfigured,
            tested: this.connectionTested,
            host: process.env.SMTP_HOST || 'não configurado',
            port: process.env.SMTP_PORT || 'não configurado',
            secure: process.env.SMTP_SECURE === 'true'
        };
    }
}

module.exports = new ScheduledEmailService();