const evolutionAPI = require('../config/evolution');
const database = require('../config/database');
const moment = require('moment');

/**
 * Cache de conversas ativas em memória
 * Estrutura: { phoneNumber: { estado, dados, conversa, messageId } }
 */
const conversasAtivas = new Map();

/**
 * Estados possíveis da conversa
 */
const ESTADOS = {
    INICIO: 'inicio',
    AGUARDANDO_CNPJ: 'aguardando_cnpj',
    MENU_PRINCIPAL: 'menu_principal',
    PROCESSANDO_OPCAO: 'processando_opcao',
    FINALIZADA: 'finalizada'
};

/**
 * Menu principal de opções
 */
const MENU_OPCOES = [
    '1️⃣ Boletos em Aberto',
    '2️⃣ Notas Fiscais',
    '3️⃣ Certificados',
    '4️⃣ Propostas Comerciais',
    '5️⃣ Falar com Atendente'
];

/**
 * Processa mensagem recebida do webhook
 * @param {Object} messageData - Dados da mensagem do webhook
 * @returns {Promise} Resultado do processamento
 */
async function processarMensagem(messageData) {
    try {
        const { key, message, messageTimestamp } = messageData;
        const phoneNumber = key.remoteJid.replace('@s.whatsapp.net', '');
        const messageText = message.conversation || message.extendedTextMessage?.text || '';
        const messageId = key.id;

        // Marca mensagem como lida
        await evolutionAPI.markMessageAsRead(messageId, key.remoteJid);

        // Ignora mensagens vazias ou de status
        if (!messageText.trim() || key.fromMe) {
            return { success: true, data: 'Mensagem ignorada' };
        }

        // Registra mensagem na conversa
        await adicionarMensagemConversa(phoneNumber, messageId, 'cliente', messageText);

        // Verifica se é início de nova conversa ou continuação
        let conversaAtual = conversasAtivas.get(phoneNumber);
        
        if (!conversaAtual) {
            
            // Nova conversa - verifica se cliente existe por celular
            conversaAtual = await iniciarNovaConversa(phoneNumber, messageId, messageText);
            
            // Se a primeira mensagem já é o CNPJ, processar
            if (conversaAtual.estado === ESTADOS.AGUARDANDO_CNPJ && messageText.replace(/\D/g, '').length === 14) {
                await processarCNPJ(conversaAtual, messageText);
            }

        } else {
            // Conversa existente - processa baseado no estado atual
            await processarEstadoAtual(conversaAtual, messageText);
        }

        return { success: true, data: 'Mensagem processada com sucesso' };

    } catch (error) {
        console.error('Erro ao processar mensagem:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Inicia nova conversa verificando cliente por celular
 * @param {string} phoneNumber - Número do telefone
 * @param {string} messageId - ID da mensagem inicial
 * @param {string} messageText - Texto da mensagem
 * @returns {Object} Dados da conversa iniciada
 */
async function iniciarNovaConversa(phoneNumber, messageId, messageText) {
    const numeroFormatado = evolutionAPI.formatPhoneNumber(phoneNumber);
    
    // Verifica se cliente existe por celular
    const clienteResult = await database.getClienteByCelular(numeroFormatado);
    
    let conversaAtual;

    if (clienteResult.success && clienteResult.data.length > 0) {
        // Cliente encontrado - vai direto para o menu
        const clienteData = clienteResult.data[0];
        
        conversaAtual = {
            estado: ESTADOS.MENU_PRINCIPAL,
            dados: clienteData,
            conversa: [],
            messageId: messageId,
            phoneNumber: phoneNumber
        };

        await enviarBoasVindas(phoneNumber, clienteData.nome);
        await enviarMenuPrincipal(phoneNumber);

    } else {
        
        // Cliente não encontrado - solicita CNPJ
        conversaAtual = {
            estado: ESTADOS.AGUARDANDO_CNPJ,
            dados: {},
            conversa: [],
            messageId: messageId,
            phoneNumber: phoneNumber
        };

        await enviarSolicitacaoCNPJ(phoneNumber);
    }

    conversasAtivas.set(phoneNumber, conversaAtual);
    return conversaAtual;
}

/**
 * Processa mensagem baseado no estado atual da conversa
 * @param {Object} conversa - Dados da conversa atual
 * @param {string} messageText - Texto da mensagem recebida
 */
async function processarEstadoAtual(conversa, messageText) {
    switch (conversa.estado) {
        case ESTADOS.AGUARDANDO_CNPJ:
            await processarCNPJ(conversa, messageText);
            break;
            
        case ESTADOS.MENU_PRINCIPAL:
            await processarOpcaoMenu(conversa, messageText);
            break;
            
        default:
            await enviarMensagemNaoCompreendida(conversa.phoneNumber);
            break;
    }
}

/**
 * Processa CNPJ fornecido pelo cliente
 * @param {Object} conversa - Dados da conversa
 * @param {string} cnpj - CNPJ fornecido
 */
async function processarCNPJ(conversa, cnpj) {
    const cnpjLimpo = cnpj.replace(/\D/g, '');
    
    if (cnpjLimpo.length !== 14) {
        await enviarMensagem(conversa.phoneNumber, 
            '❌ CNPJ inválido. Por favor, digite um CNPJ válido com 14 números:'
        );
        return;
    }

    const cnpjFormatado = formatarCNPJ(cnpjLimpo);
    const clienteResult = await database.getClienteByCNPJ(cnpjFormatado);

    if (clienteResult.success && clienteResult.data.length > 0) {
        // Cliente encontrado
        const clienteData = clienteResult.data[0];
        conversa.dados = clienteData;
        conversa.estado = ESTADOS.MENU_PRINCIPAL;
        
        // Registra atendimento no banco
        await registrarAtendimentoInicial(conversa);
        
        await enviarMensagem(conversa.phoneNumber, 
            `✅ Perfeito! Encontrei seu cadastro, ${clienteData.nome}.`
        );
        await enviarMenuPrincipal(conversa.phoneNumber);
        
    } else {
        // Cliente não encontrado
        await enviarMensagem(conversa.phoneNumber, 
            '❌ CNPJ não encontrado em nossa base de dados.\n\n' +
            'Para mais informações, você pode falar com um de nossos atendentes.'
        );
        await enviarOpcaoAtendente(conversa.phoneNumber);
        conversa.estado = ESTADOS.FINALIZADA;
    }
}

/**
 * Processa opção selecionada no menu principal
 * @param {Object} conversa - Dados da conversa
 * @param {string} opcao - Opção selecionada
 */
async function processarOpcaoMenu(conversa, opcao) {
    const opcaoLimpa = opcao.trim();
    
    switch (opcaoLimpa) {
        case '1':
        case '1️⃣':
            await processarBoletos(conversa);
            break;
            
        case '2':
        case '2️⃣':
            await processarNotasFiscais(conversa);
            break;
            
        case '3':
        case '3️⃣':
            await processarCertificados(conversa);
            break;
            
        case '4':
        case '4️⃣':
        case '5':
        case '5️⃣':
            await processarAtendimento(conversa);
            break;
            
        default:
            await enviarMensagem(conversa.phoneNumber,
                '❌ Opção inválida. Por favor, digite o número da opção desejada:'
            );
            await enviarMenuPrincipal(conversa.phoneNumber);
            break;
    }
}

/**
 * Processa solicitação de boletos
 * @param {Object} conversa - Dados da conversa
 */
async function processarBoletos(conversa) {
    const boletosResult = await database.getBoletosByCNPJ(conversa.dados.cnpj);
    
    if (boletosResult.success && boletosResult.data.length > 0) {
        await enviarMensagem(conversa.phoneNumber, 
            `📄 *Boletos em Aberto*\n\nEncontrei ${boletosResult.data.length} boleto(s) em aberto:`
        );

        for (const boleto of boletosResult.data) {
            const dataVencimento = moment(boleto.dataVencimento).format('DD/MM/YYYY');
            const valor = parseFloat(boleto.valor).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            });

            const mensagemBoleto = 
                `🧾 *Boleto #${boleto.numero}*\n` +
                `📅 Vencimento: ${dataVencimento}\n` +
                `💰 Valor: ${valor}\n\n` +
                `🔢 Linha Digitável:\n${boleto.linhaDigitavel}\n\n` +
                `📎 Link:\n${boleto.url}`;

            await enviarMensagem(conversa.phoneNumber, mensagemBoleto);
        }
    } else {
        await enviarMensagem(conversa.phoneNumber, 
            '✅ Você não possui boletos em aberto no momento.'
        );
    }
    
    await enviarMenuVoltar(conversa.phoneNumber);
}

/**
 * Processa solicitação de notas fiscais
 * @param {Object} conversa - Dados da conversa
 */
async function processarNotasFiscais(conversa) {
    // Implementar busca de notas fiscais quando a estrutura estiver definida
    await enviarMensagem(conversa.phoneNumber, 
        '📋 *Notas Fiscais*\n\n' +
        'Em breve disponibilizaremos suas notas fiscais por aqui.\n' +
        'Para acessá-las agora, entre em contato com nosso atendimento.'
    );
    
    await enviarMenuVoltar(conversa.phoneNumber);
}

/**
 * Processa solicitação de certificados
 * @param {Object} conversa - Dados da conversa
 */
async function processarCertificados(conversa) {
    // Implementar busca de certificados quando a estrutura estiver definida
    await enviarMensagem(conversa.phoneNumber, 
        '🏆 *Certificados*\n\n' +
        'Em breve disponibilizaremos seus certificados por aqui.\n' +
        'Para acessá-los agora, entre em contato com nosso atendimento.'
    );
    
    await enviarMenuVoltar(conversa.phoneNumber);
}

/**
 * Processa transferência para atendimento humano
 * @param {Object} conversa - Dados da conversa
 */
async function processarAtendimento(conversa) {
    await enviarMensagem(conversa.phoneNumber,
        '👨‍💼 *Transferindo para Atendimento*\n\n' +
        'Sua solicitação será direcionada para um de nossos atendentes.\n' +
        'Aguarde que em breve alguém entrará em contato com você.'
    );

    // Implementar chamada para endpoint de transferência
    await transferirParaAtendente(conversa);
    
    conversa.estado = ESTADOS.FINALIZADA;
}

/**
 * Envia mensagem de boas-vindas personalizada
 * @param {string} phoneNumber - Número do telefone
 * @param {string} nomeCliente - Nome do cliente
 */
async function enviarBoasVindas(phoneNumber, nomeCliente) {
    const mensagem = 
        `👋 Olá, ${nomeCliente}!\n\n` +
        `Bem-vindo(a) ao atendimento da *${process.env.COMPANY_NAME}*.\n\n` +
        `Como posso ajudá-lo(a) hoje?`;
    
    await enviarMensagem(phoneNumber, mensagem);
    await adicionarMensagemConversa(phoneNumber, null, 'bot', mensagem);
}

/**
 * Envia solicitação de CNPJ
 * @param {string} phoneNumber - Número do telefone
 */
async function enviarSolicitacaoCNPJ(phoneNumber) {
    const mensagem = 
        `👋 Olá! Bem-vindo(a) ao atendimento da *${process.env.COMPANY_NAME}*.\n\n` +
        `Para continuar, por favor me informe o *CNPJ* da sua empresa:`;
    
    await enviarMensagem(phoneNumber, mensagem);
    await adicionarMensagemConversa(phoneNumber, null, 'bot', mensagem);
}

/**
 * Envia menu principal de opções
 * @param {string} phoneNumber - Número do telefone
 */
async function enviarMenuPrincipal(phoneNumber) {
    const mensagem = 
        `📋 *Menu de Opções*\n\n` +
        `Escolha uma das opções abaixo digitando o número correspondente:\n\n` +
        MENU_OPCOES.join('\n\n');
    
    await enviarMensagem(phoneNumber, mensagem);
    await adicionarMensagemConversa(phoneNumber, null, 'bot', mensagem);
}

/**
 * Envia opções para voltar ao menu ou finalizar
 * @param {string} phoneNumber - Número do telefone
 */
async function enviarMenuVoltar(phoneNumber) {
    const mensagem = 
        `\n🔄 *Mais alguma coisa?*\n\n` +
        `Digite *MENU* para voltar ao menu principal\n` +
        `ou *SAIR* para finalizar o atendimento.`;
    
    await enviarMensagem(phoneNumber, mensagem);
    await adicionarMensagemConversa(phoneNumber, null, 'bot', mensagem);
}

/**
 * Envia opção de falar com atendente
 * @param {string} phoneNumber - Número do telefone
 */
async function enviarOpcaoAtendente(phoneNumber) {
    const mensagem = 
        `👨‍💼 Digite *ATENDENTE* se deseja falar com nossa equipe.`;
    
    await enviarMensagem(phoneNumber, mensagem);
    await adicionarMensagemConversa(phoneNumber, null, 'bot', mensagem);
}

/**
 * Envia mensagem de não compreensão
 * @param {string} phoneNumber - Número do telefone
 */
async function enviarMensagemNaoCompreendida(phoneNumber) {
    const mensagem = 
        `❓ Desculpe, não compreendi sua mensagem.\n\n` +
        `Digite *MENU* para ver as opções disponíveis.`;
    
    await enviarMensagem(phoneNumber, mensagem);
    await adicionarMensagemConversa(phoneNumber, null, 'bot', mensagem);
}

/**
 * Wrapper para envio de mensagens
 * @param {string} phoneNumber - Número do telefone
 * @param {string} message - Mensagem a ser enviada
 */
async function enviarMensagem(phoneNumber, message) {
    return await evolutionAPI.sendTextMessage(phoneNumber, message);
}

/**
 * Adiciona mensagem ao histórico da conversa
 * @param {string} phoneNumber - Número do telefone
 * @param {string} messageId - ID da mensagem
 * @param {string} tipo - Tipo da mensagem (cliente/bot)
 * @param {string} mensagem - Conteúdo da mensagem
 */
async function adicionarMensagemConversa(phoneNumber, messageId, tipo, mensagem) {
    const conversa = conversasAtivas.get(phoneNumber);
    
    if (conversa) {
        const novaMensagem = {
            tipo: tipo,
            data: moment().format('YYYY-MM-DD HH:mm:ss'),
            mensagem: mensagem
        };
        
        conversa.conversa.push(novaMensagem);
        
        // Atualiza conversa no banco se já existe registro
        if (conversa.messageId) {
            await database.atualizarConversa(conversa.messageId, conversa.conversa);
        }
    }
}

/**
 * Registra atendimento inicial no banco de dados
 * @param {Object} conversa - Dados da conversa
 */
async function registrarAtendimentoInicial(conversa) {
    const atendimentoData = {
        messageId: conversa.messageId,
        cliente: conversa.dados.cliente,
        cnpj: conversa.dados.cnpj,
        conversa: conversa.conversa
    };
    
    await database.registrarAtendimento(atendimentoData);
}

/**
 * Transfere conversa para atendente humano
 * @param {Object} conversa - Dados da conversa
 */
async function transferirParaAtendente(conversa) {
    // Implementar integração com sistema de atendimento
    console.log(`Transferindo conversa ${conversa.messageId} para atendimento humano`);
    
    // TODO: Implementar chamada para endpoint de transferência
    // const transferResult = await axios.post(process.env.ATENDIMENTO_ENDPOINT, {
    //     messageId: conversa.messageId,
    //     clienteId: conversa.dados.cliente,
    //     cnpj: conversa.dados.cnpj,
    //     filaId: process.env.ATENDIMENTO_FILA_ID
    // });
}

/**
 * Formata CNPJ para padrão XX.XXX.XXX/XXXX-XX
 * @param {string} cnpj - CNPJ apenas números
 * @returns {string} CNPJ formatado
 */
function formatarCNPJ(cnpj) {
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

/**
 * Limpa conversa da memória após finalização
 * @param {string} phoneNumber - Número do telefone
 */
function limparConversa(phoneNumber) {
    conversasAtivas.delete(phoneNumber);
}

module.exports = {
    processarMensagem,
    limparConversa,
    ESTADOS,
    MENU_OPCOES
};