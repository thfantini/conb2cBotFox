const nodemailer = require('nodemailer');
const moment = require('moment');

/**
 * Serviço específico para envio de emails programados
 * Baseado no emailMessageService.js, adaptado para envios em lote de boletos
 */
class ScheduledEmailService {
    constructor() {
        this.transporter = null;
        this.isConfigured = false;
        this.statistics = {
            totalEnvios: 0,
            totalSucessos: 0,
            totalFalhas: 0,
            ultimoEnvio: null,
            tempoMedioEnvio: 0,
            lastReset: new Date()
        };
        
        // Inicializar configuração SMTP de forma não-bloqueante
        this.inicializarSMTP().catch(error => {
            console.warn(`⚠️ [SCHEDULED-EMAIL] Falha na inicialização SMTP, serviço desabilitado:`, error.message);
        });
    }

    /**
     * Inicializa configuração SMTP do Nodemailer
     */
    async inicializarSMTP() {
        // Garantir que a inicialização nunca quebre a aplicação
        this.isConfigured = false;
        this.transporter = null;

        try {
            console.log(`📧 [SCHEDULED-EMAIL] Inicializando configuração SMTP...`);

            // Verificar se todas as variáveis necessárias estão configuradas
            const smtpConfig = {
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT) || 587,
                secure: process.env.SMTP_SECURE === 'true', // true para 465, false para outras portas
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                },
                connectionTimeout: 5000,  // 5 segundos
                greetingTimeout: 3000,    // 3 segundos
                socketTimeout: 5000,      // 5 segundos
                pool: false,              // Não usar pool de conexões
                maxConnections: 1,        // Uma conexão por vez
                maxMessages: 1            // Uma mensagem por conexão
            };

            if (!smtpConfig.host || !smtpConfig.auth.user || !smtpConfig.auth.pass) {
                console.warn(`⚠️ [SCHEDULED-EMAIL] Configuração SMTP incompleta, serviço desabilitado`);
                console.warn(`⚠️ [SCHEDULED-EMAIL] Variáveis necessárias: SMTP_HOST, SMTP_USER, SMTP_PASS`);
                return { success: false, error: 'Configuração incompleta' };
            }

            // Criar transporter
            this.transporter = nodemailer.createTransport(smtpConfig);

            // Testar configuração com timeout mais curto e não-bloqueante
            console.log(`🔍 [SCHEDULED-EMAIL] Testando conexão com ${smtpConfig.host}:${smtpConfig.port}...`);

            try {
                const verifyPromise = this.transporter.verify();
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Timeout na verificação SMTP')), 8000)
                );

                await Promise.race([verifyPromise, timeoutPromise]);

                this.isConfigured = true;
                console.log(`✅ [SCHEDULED-EMAIL] SMTP configurado com sucesso: ${smtpConfig.host}:${smtpConfig.port}`);
                return { success: true };

            } catch (verifyError) {
                // Falha na verificação, mas não quebra a aplicação
                console.warn(`⚠️ [SCHEDULED-EMAIL] Falha na verificação SMTP: ${verifyError.message}`);
                console.warn(`⚠️ [SCHEDULED-EMAIL] Serviço de email desabilitado, mas aplicação continua funcionando`);

                // Limpar transporter inválido
                if (this.transporter) {
                    try {
                        this.transporter.close();
                    } catch (closeError) {
                        // Ignorar erros ao fechar
                    }
                }
                this.transporter = null;
                this.isConfigured = false;

                return { success: false, error: verifyError.message };
            }

        } catch (error) {
            // Capturar qualquer erro e garantir que não quebra a aplicação
            console.warn(`⚠️ [SCHEDULED-EMAIL] Erro na inicialização SMTP: ${error.message}`);
            console.warn(`⚠️ [SCHEDULED-EMAIL] Aplicação continua sem serviço de email`);

            this.isConfigured = false;
            this.transporter = null;

            return { success: false, error: error.message };
        }
    }

    /**
     * Envia email de boletos programado
     * EMAIL: Cópia da mensagem enviada via WhatsApp
     * @param {Object} dadosEnvio - Dados do cliente e boletos
     * @returns {Promise<Object>} Resultado do envio
     */
    async enviarEmailBoletos(dadosEnvio) {
        const startTime = Date.now();
        this.statistics.totalEnvios++;

        try {
            const { cliente, mensagem, boletos, timestamp } = dadosEnvio;
            
            console.log(`📧 [SCHEDULED-EMAIL] Iniciando envio para: ${cliente.nome}`);
            console.log(`📧 [SCHEDULED-EMAIL] Email: ${cliente.email}, Boletos: ${boletos.length}`);

            // Verificar se o serviço está configurado
            if (!this.isConfigured || !this.transporter) {
                throw new Error('Serviço de email não está configurado ou SMTP indisponível');
            }

            // Validar dados obrigatórios
            if (!cliente.email || !mensagem) {
                throw new Error('Dados obrigatórios ausentes: email ou mensagem');
            }

            // Validar formato do email
            if (!this.validarEmail(cliente.email)) {
                throw new Error(`Formato de email inválido: ${cliente.email}`);
            }

            // Criar template HTML do email
            const htmlTemplate = this.criarTemplateHTML(cliente, boletos, mensagem);
            
            // Preparar dados do email
            const emailData = {
                from: {
                    name: process.env.COMPANY_NAME || 'Sistema de Boletos',
                    address: process.env.SMTP_FROM || process.env.SMTP_USER
                },
                to: {
                    name: cliente.nome,
                    address: cliente.email
                },
                subject: this.criarAssuntoEmail(boletos.length),
                text: this.converterHtmlParaTexto(mensagem),
                html: htmlTemplate,
                headers: {
                    'X-Mailer': 'Scheduled Messages Service',
                    'X-Scheduled-Type': 'boletos',
                    'X-Cliente-ID': cliente.cliente || 'N/A'
                }
            };

            console.log(`📤 [SCHEDULED-EMAIL] Enviando email via SMTP...`);

            // Enviar email
            const resultado = await this.transporter.sendMail(emailData);

            // Calcular tempo de envio
            const duration = Date.now() - startTime;
            this.atualizarEstatisticas(true, duration);

            console.log(`✅ [SCHEDULED-EMAIL] Email enviado com sucesso em ${duration}ms`);
            console.log(`✅ [SCHEDULED-EMAIL] MessageId: ${resultado.messageId}`);

            return {
                success: true,
                status: 'enviado',
                messageId: resultado.messageId,
                timestamp: new Date().toISOString(),
                duration: `${duration}ms`,
                cliente: {
                    nome: cliente.nome,
                    email: cliente.email
                },
                boletos: boletos.map(b => ({
                    numero: b.numero,
                    valor: b.valor,
                    conta: b.conta
                })),
                response: resultado.response
            };

        } catch (error) {
            const duration = Date.now() - startTime;
            this.atualizarEstatisticas(false, duration);
            
            console.error(`❌ [SCHEDULED-EMAIL] Erro no envio:`, error);
            
            return {
                success: false,
                status: 'erro',
                error: error.message,
                timestamp: new Date().toISOString(),
                duration: `${duration}ms`,
                cliente: dadosEnvio.cliente ? {
                    nome: dadosEnvio.cliente.nome,
                    email: dadosEnvio.cliente.email
                } : null
            };
        }
    }

    /**
     * Cria template HTML para email de boletos
     * @param {Object} cliente - Dados do cliente
     * @param {Array} boletos - Lista de boletos
     * @param {string} mensagemTexto - Mensagem original (para fallback)
     * @returns {string} HTML do email
     */
    criarTemplateHTML(cliente, boletos, mensagemTexto) {
        const empresa = process.env.COMPANY_NAME || 'Nossa Empresa';
        const totalBoletos = boletos.length;
        
        let html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Boletos Disponíveis - ${empresa}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #007bff; color: #FFF; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8f9fa; padding: 20px; border: 1px solid #dee2e6; }
        .boleto { background: #FFF; margin: 15px 0; padding: 15px; border-radius: 5px; border-left: 4px solid #007bff; }
        .boleto-header { font-weight: bold; color: #007bff; margin-bottom: 10px; }
        .boleto-info { margin: 5px 0; }
        .linha-digitavel { background: #e9ecef; padding: 10px; font-family: monospace; word-break: break-all; border-radius: 3px; margin: 10px 0; }
        .footer { background: #6c757d; color: #FFF; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 0.9em; }
        .btn { display: inline-block; background: #007bff; color: #FFF; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .alert { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 10px; border-radius: 5px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🤖 ${empresa}</h1>
        <p>Boletos Disponíveis para Pagamento</p>
    </div>
    
    <div class="content">
        <h2>Olá, ${cliente.nome}!</h2>
        <p>Você possui <strong>${totalBoletos} boleto(s)</strong> disponível(is) para pagamento:</p>
        
        <div class="alert">
            💡 <strong>Dica:</strong> Você pode copiar a linha digitável e colar no app do seu banco.
        </div>
`;

        // Adicionar dados de cada boleto
        boletos.forEach((boleto, index) => {
            const dataVencimento = moment(boleto.dataVencimento).format('DD/MM/YYYY');
            const valor = parseFloat(boleto.valor).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            });

            html += `
        <div class="boleto">
            <div class="boleto-header">🧾 Boleto ${index + 1}/${totalBoletos}</div>
            <div class="boleto-info"><strong>Número:</strong> ${boleto.numero}</div>
            <div class="boleto-info"><strong>Valor:</strong> ${valor}</div>
            <div class="boleto-info"><strong>Vencimento:</strong> ${dataVencimento}</div>
            <div class="boleto-info"><strong>Linha Digitável:</strong></div>
            <div class="linha-digitavel">${boleto.linhaDigitavel}</div>
            <a href="${boleto.url}" class="btn" target="_blank">Imprimir Boleto</a>`;
            
            // // Link para impressão (se disponível)
            // if (boleto.url) {
            //     html += `
            // <a href="${boleto.url}" class="btn" target="_blank">
            //     📎 Imprimir Boleto
            // </a>`;
            // }
            
            html += `</div>`;
        });

        html += `
        <p><strong>📞 Em caso de dúvidas, entre em contato conosco.</strong></p>
        
        <p>Atenciosamente,<br><strong>${empresa}</strong></p>
    </div>
    
    <div class="footer">
        <p>Este é um email automático. Não responda esta mensagem.</p>
        <p>Enviado em ${moment().format('DD/MM/YYYY [às] HH:mm')}</p>
    </div>
</body>
</html>`;

        return html;
    }

    /**
     * Cria assunto do email baseado na quantidade de boletos
     * @param {number} quantidadeBoletos - Número de boletos
     * @returns {string} Assunto do email
     */
    criarAssuntoEmail(quantidadeBoletos) {
        const empresa = process.env.COMPANY_NAME || 'Sistema';
        
        if (quantidadeBoletos === 1) {
            return `📄 ${empresa} - Boleto Disponível para Pagamento`;
        } else {
            return `📄 ${empresa} - ${quantidadeBoletos} Boletos Disponíveis para Pagamento`;
        }
    }

    /**
     * Converte mensagem HTML para texto plano (fallback)
     * @param {string} mensagemOriginal - Mensagem original do WhatsApp
     * @returns {string} Texto plano
     */
    converterHtmlParaTexto(mensagemOriginal) {
        // Remove emojis e formatação markdown
        return mensagemOriginal
            .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove negrito
            .replace(/[🤖📬📄💰📅🔢📎💡📞]/g, '') // Remove emojis
            .replace(/\n\n+/g, '\n\n')       // Normaliza quebras de linha
            .trim();
    }

    /**
     * Valida formato do email
     * @param {string} email - Email para validar
     * @returns {boolean} Se o email é válido
     */
    validarEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Envia múltiplos emails em lote com controle de rate limit
     * @param {Array} listaEnvios - Array de objetos com dados para envio
     * @returns {Promise<Object>} Resultado do envio em lote
     */
    async enviarLote(listaEnvios) {
        console.log(`📋 [SCHEDULED-EMAIL] Iniciando envio em lote: ${listaEnvios.length} email(s)`);
        
        const resultados = {
            total: listaEnvios.length,
            sucessos: 0,
            falhas: 0,
            detalhes: [],
            startTime: new Date().toISOString(),
            endTime: null,
            duration: null
        };

        const startTime = Date.now();

        for (let i = 0; i < listaEnvios.length; i++) {
            const envio = listaEnvios[i];
            
            try {
                console.log(`📤 [SCHEDULED-EMAIL] Enviando ${i + 1}/${listaEnvios.length}`);
                
                const resultado = await this.enviarEmailBoletos(envio);
                
                if (resultado.success) {
                    resultados.sucessos++;
                } else {
                    resultados.falhas++;
                }
                
                resultados.detalhes.push({
                    cliente: envio.cliente?.nome || 'N/A',
                    email: envio.cliente?.email || 'N/A',
                    resultado: resultado
                });

                // Rate limit: aguardar 500ms entre envios para evitar spam
                if (i < listaEnvios.length - 1) {
                    console.log(`⏱️ [SCHEDULED-EMAIL] Aguardando rate limit...`);
                    await this.delay(500);
                }

            } catch (error) {
                console.error(`❌ [SCHEDULED-EMAIL] Erro no envio ${i + 1}:`, error);
                
                resultados.falhas++;
                resultados.detalhes.push({
                    cliente: envio.cliente?.nome || 'N/A',
                    email: envio.cliente?.email || 'N/A',
                    resultado: {
                        success: false,
                        error: error.message
                    }
                });
            }
        }

        const duration = Date.now() - startTime;
        resultados.endTime = new Date().toISOString();
        resultados.duration = `${duration}ms`;

        console.log(`✅ [SCHEDULED-EMAIL] Lote concluído: ${resultados.sucessos} sucessos, ${resultados.falhas} falhas em ${duration}ms`);

        return {
            success: true,
            data: resultados
        };
    }

    /**
     * Atualiza estatísticas do serviço
     * @param {boolean} sucesso - Se o envio foi bem-sucedido
     * @param {number} duracao - Duração em milissegundos
     */
    atualizarEstatisticas(sucesso, duracao) {
        if (sucesso) {
            this.statistics.totalSucessos++;
        } else {
            this.statistics.totalFalhas++;
        }

        // Calcular tempo médio de envio
        const totalEnvios = this.statistics.totalSucessos + this.statistics.totalFalhas;
        this.statistics.tempoMedioEnvio = ((this.statistics.tempoMedioEnvio * (totalEnvios - 1)) + duracao) / totalEnvios;
        
        this.statistics.ultimoEnvio = {
            timestamp: new Date().toISOString(),
            sucesso: sucesso,
            duracao: `${duracao}ms`
        };
    }

    /**
     * Obtém estatísticas do serviço
     * @returns {Object} Estatísticas atuais
     */
    getStatistics() {
        const uptime = moment().diff(moment(this.statistics.lastReset), 'seconds');
        const taxaSucesso = this.statistics.totalEnvios > 0 ? 
            ((this.statistics.totalSucessos / this.statistics.totalEnvios) * 100).toFixed(2) : 0;

        return {
            ...this.statistics,
            isConfigured: this.isConfigured,
            taxaSucesso: `${taxaSucesso}%`,
            tempoMedioEnvio: `${Math.round(this.statistics.tempoMedioEnvio)}ms`,
            uptime: `${uptime}s`
        };
    }

    /**
     * Reseta estatísticas do serviço
     */
    resetStatistics() {
        this.statistics = {
            totalEnvios: 0,
            totalSucessos: 0,
            totalFalhas: 0,
            ultimoEnvio: null,
            tempoMedioEnvio: 0,
            lastReset: new Date()
        };
        console.log('🔄 [SCHEDULED-EMAIL] Estatísticas resetadas');
    }

    /**
     * Verifica se o serviço está disponível
     * @returns {Promise<boolean>} Status de disponibilidade
     */
    async verificarDisponibilidade() {
        try {
            if (!this.isConfigured) {
                return false;
            }

            // Testar conectividade SMTP
            await this.transporter.verify();
            return true;
        } catch (error) {
            console.error('❌ [SCHEDULED-EMAIL] Erro na verificação de disponibilidade:', error);
            return false;
        }
    }

    /**
     * Testa conectividade SMTP
     * @returns {Promise<Object>} Resultado do teste
     */
    async testarConectividade() {
        try {
            console.log(`🔍 [SCHEDULED-EMAIL] Testando conectividade SMTP...`);
            
            if (!this.isConfigured) {
                throw new Error('Serviço de email não está configurado');
            }

            await this.transporter.verify();

            console.log(`✅ [SCHEDULED-EMAIL] Conectividade SMTP OK`);
            
            return {
                success: true,
                message: 'Conectividade SMTP funcionando',
                timestamp: new Date().toISOString(),
                config: {
                    host: process.env.SMTP_HOST,
                    port: process.env.SMTP_PORT,
                    secure: process.env.SMTP_SECURE === 'true'
                }
            };

        } catch (error) {
            console.error(`❌ [SCHEDULED-EMAIL] Erro no teste de conectividade:`, error);
            
            return {
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Recarrega configuração SMTP (útil para mudanças em runtime)
     * @returns {Promise<Object>} Resultado da reconfiguração
     */
    async recarregarConfiguracao() {
        try {
            console.log(`🔄 [SCHEDULED-EMAIL] Recarregando configuração SMTP...`);
            
            await this.inicializarSMTP();
            
            return {
                success: this.isConfigured,
                message: this.isConfigured ? 'Configuração recarregada com sucesso' : 'Falha ao recarregar configuração',
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error(`❌ [SCHEDULED-EMAIL] Erro ao recarregar configuração:`, error);
            
            return {
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Utilitário para delay/pausa
     * @param {number} ms - Milissegundos para aguardar
     * @returns {Promise} Promise que resolve após o delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Valida dados de envio
     * @param {Object} dadosEnvio - Dados para validação
     * @returns {Object} Resultado da validação
     */
    validarDadosEnvio(dadosEnvio) {
        const erros = [];

        if (!this.isConfigured) {
            erros.push('Serviço de email não está configurado');
        }

        if (!dadosEnvio) {
            erros.push('Dados de envio não fornecidos');
        } else {
            if (!dadosEnvio.cliente) {
                erros.push('Dados do cliente ausentes');
            } else {
                if (!dadosEnvio.cliente.nome) {
                    erros.push('Nome do cliente obrigatório');
                }
                if (!dadosEnvio.cliente.email) {
                    erros.push('Email do cliente obrigatório');
                } else if (!this.validarEmail(dadosEnvio.cliente.email)) {
                    erros.push('Formato de email inválido');
                }
            }

            if (!dadosEnvio.mensagem) {
                erros.push('Mensagem obrigatória');
            }

            if (!dadosEnvio.boletos || !Array.isArray(dadosEnvio.boletos) || dadosEnvio.boletos.length === 0) {
                erros.push('Lista de boletos obrigatória e não pode estar vazia');
            }
        }

        return {
            valido: erros.length === 0,
            erros: erros
        };
    }
}

// Instância singleton do serviço
const scheduledEmailService = new ScheduledEmailService();

module.exports = scheduledEmailService;