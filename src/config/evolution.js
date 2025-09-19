const axios = require('axios');
require('dotenv').config();

/**
 * Configuração da API Evolution
 */
const evolutionConfig = {
    baseURL: process.env.EVOLUTION_API_URL,
    apiKey: process.env.EVOLUTION_API_KEY,
    instanceName: process.env.EVOLUTION_INSTANCE_NAME,
    timeout: 30000
};

/**
 * Cliente HTTP configurado para API Evolution
 */
const evolutionAPI = axios.create({
    baseURL: evolutionConfig.baseURL,
    timeout: evolutionConfig.timeout,
    headers: {
        'Content-Type': 'application/json',
        'apikey': evolutionConfig.apiKey
    }
});

/**
 * Envia mensagem de texto via WhatsApp
 * @param {string} number - Número do destinatário (formato: 5531999999999)
 * @param {string} message - Mensagem a ser enviada
 * @returns {Promise} Resultado do envio
 */
async function sendTextMessage(number, message) {
    try {
        const payload = {
            number: number,
            text: message
        };

        const response = await evolutionAPI.post(
            `/message/sendText/${evolutionConfig.instanceName}`,
            payload
        );

        return {
            success: true,
            data: response.data,
            error: null
        };
    } catch (error) {
        console.error('Erro ao enviar mensagem de texto:', error.response?.data || error.message);
        return {
            success: false,
            data: null,
            error: error.response?.data?.message || error.message
        };
    }
}

/**
 * Envia mensagem com botões (menu de opções)
 * @param {string} number - Número do destinatário
 * @param {string} text - Texto da mensagem
 * @param {Array} buttons - Array de botões
 * @returns {Promise} Resultado do envio
 */
async function sendButtonMessage(number, text, buttons) {
    try {
        const payload = {
            number: number,
            buttonMessage: {
                text: text,
                buttons: buttons.map((button, index) => ({
                    buttonId: `btn_${index + 1}`,
                    buttonText: {
                        displayText: button
                    },
                    type: 1
                }))
            }
        };

        const response = await evolutionAPI.post(
            `/message/sendButton/${evolutionConfig.instanceName}`,
            payload
        );

        return {
            success: true,
            data: response.data,
            error: null
        };
    } catch (error) {
        console.error('Erro ao enviar mensagem com botões:', error.response?.data || error.message);
        return {
            success: false,
            data: null,
            error: error.response?.data?.message || error.message
        };
    }
}

/**
 * Envia lista de opções
 * @param {string} number - Número do destinatário
 * @param {string} title - Título da lista
 * @param {string} description - Descrição da lista
 * @param {Array} sections - Seções da lista
 * @returns {Promise} Resultado do envio
 */
async function sendListMessage(number, title, description, sections) {
    try {
        const payload = {
            number: number,
            listMessage: {
                title: title,
                description: description,
                buttonText: "Ver opções",
                listType: 1,
                sections: sections
            }
        };

        const response = await evolutionAPI.post(
            `/message/sendList/${evolutionConfig.instanceName}`,
            payload
        );

        return {
            success: true,
            data: response.data,
            error: null
        };
    } catch (error) {
        console.error('Erro ao enviar lista:', error.response?.data || error.message);
        return {
            success: false,
            data: null,
            error: error.response?.data?.message || error.message
        };
    }
}

/**
 * Configura webhook para receber mensagens
 * @param {string} webhookUrl - URL do webhook
 * @returns {Promise} Resultado da configuração
 */
async function setWebhook(webhookUrl) {
    try {
        const payload = {
            webhook: webhookUrl,
            events: [
                'MESSAGE_RECEIVED',
                'MESSAGE_SENT',
                'CONNECTION_UPDATE'
            ]
        };

        const response = await evolutionAPI.post(
            `/webhook/set/${evolutionConfig.instanceName}`,
            payload
        );

        return {
            success: true,
            data: response.data,
            error: null
        };
    } catch (error) {
        console.error('Erro ao configurar webhook:', error.response?.data || error.message);
        return {
            success: false,
            data: null,
            error: error.response?.data?.message || error.message
        };
    }
}

/**
 * Verifica status da instância
 * @returns {Promise} Status da instância
 */
async function getInstanceStatus() {
    try {
        const response = await evolutionAPI.get(
            `/instance/connectionState/${evolutionConfig.instanceName}`
        );

        return {
            success: true,
            data: response.data,
            error: null
        };
    } catch (error) {
        console.error('Erro ao verificar status da instância:', error.response?.data || error.message);
        return {
            success: false,
            data: null,
            error: error.response?.data?.message || error.message
        };
    }
}

/**
 * Conecta a instância do WhatsApp
 * @returns {Promise} Resultado da conexão
 */
async function connectInstance() {
    try {
        const response = await evolutionAPI.post(
            `/instance/connect/${evolutionConfig.instanceName}`
        );

        return {
            success: true,
            data: response.data,
            error: null
        };
    } catch (error) {
        console.error('Erro ao conectar instância:', error.response?.data || error.message);
        return {
            success: false,
            data: null,
            error: error.response?.data?.message || error.message
        };
    }
}

/**
 * Marca mensagem como lida
 * @param {string} messageId - ID da mensagem
 * @param {string} remoteJid - JID do chat
 * @returns {Promise} Resultado da operação
 */
async function markMessageAsRead(messageId, remoteJid) {
    try {
        const payload = {
            readMessages: [{
                id: messageId,
                fromMe: false,
                remoteJid: remoteJid
            }]
        };

        const response = await evolutionAPI.post(
            `/chat/markMessageAsRead/${evolutionConfig.instanceName}`,
            payload
        );

        return {
            success: true,
            data: response.data,
            error: null
        };
    } catch (error) {
        console.error('Erro ao marcar mensagem como lida:', error.response?.data || error.message);
        return {
            success: false,
            data: null,
            error: error.response?.data?.message || error.message
        };
    }
}

/**
 * Testa conectividade com a API Evolution
 * @returns {Promise} Status da conexão
 */
async function testConnection() {
    try {
        const status = await getInstanceStatus();
        if (status.success) {
            console.log('✅ Conexão com API Evolution estabelecida com sucesso');
            return true;
        } else {
            console.error('❌ Falha na conexão com API Evolution:', status.error);
            return false;
        }
    } catch (error) {
        console.error('❌ Erro na conexão com API Evolution:', error.message);
        return false;
    }
}

/**
 * Formata número para padrão brasileiro
 * @param {string} number - Número a ser formatado
 * @returns {string} Número formatado
 */
function formatPhoneNumber(number) {
    // Remove caracteres não numéricos
    let cleaned = number.replace(/\D/g, '');
    
    // Adiciona código do país se não existir
    if (!cleaned.startsWith('55')) {
        cleaned = '55' + cleaned;
    }
    
    // Adiciona 9 no celular se necessário (padrão brasileiro)
    if (cleaned.length === 12 && cleaned.substring(4, 5) !== '9') {
        cleaned = cleaned.substring(0, 4) + '9' + cleaned.substring(4);
    }
    
    return cleaned;
}

module.exports = {
    evolutionAPI,
    sendTextMessage,
    sendButtonMessage,
    sendListMessage,
    setWebhook,
    getInstanceStatus,
    connectInstance,
    markMessageAsRead,
    testConnection,
    formatPhoneNumber
};