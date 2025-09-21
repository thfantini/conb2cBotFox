require('dotenv').config();
const mysql = require('mysql2/promise');
const logger = require('../utils/logger');

/**
 * Configuração do pool de conexões MySQL
 */
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4'
};

/**
 * Pool de conexões
 */
const pool = mysql.createPool(dbConfig);

/**
 * Executa uma query no banco de dados
 * @param {string} query - Query SQL a ser executada
 * @param {Array} params - Parâmetros da query
 * @returns {Promise} Resultado da query
 */
async function executeQuery(query, params = []) {
    try {
        const [rows] = await pool.execute(query, params);
        return {
            success: true,
            data: rows,
            error: null
        };
    } catch (error) {
        //console.error('Erro na execução da query:', error);
        logger.error('❌ Erro ao conectar MySQL:', error.message);
        return {
            success: false,
            data: null,
            error: error.message
        };
    }
}

/**
 * Busca cliente por CNPJ na view vw_boletos
 * @param {string} cnpj - CNPJ do cliente
 * @returns {Promise} Dados do cliente
 */
async function getClienteByCNPJ(cnpj) {
    const query = `
        SELECT DISTINCT cliente, cnpj, nome, celular, empNome, empCNPJ
        FROM vw_boletos 
        WHERE cnpj = ?
        LIMIT 1
    `;
    return await executeQuery(query, [cnpj]);
}

/**
 * Busca cliente por número de celular
 * @param {string} celular - Número do celular
 * @returns {Promise} Dados do cliente
 */
async function getClienteByCelular(celular) {
    const query = `
        SELECT DISTINCT cliente, cnpj, nome, celular, empNome, empCNPJ
        FROM vw_boletos 
        WHERE celular = ?
        LIMIT 1
    `;
    return await executeQuery(query, [celular]);
}

/**
 * Busca boletos em aberto do cliente
 * @param {string} cnpj - CNPJ do cliente
 * @returns {Promise} Lista de boletos
 */
async function getBoletosByCNPJ(cnpj) {
    const query = `
        SELECT nfse, conta, dataDoc, dataVencimento, numero, valor, 
               codBarras, linhaDigitavel, empNome
        FROM vw_boletos 
        WHERE cnpj = ?
        AND dataVencimento >= CURDATE()
        ORDER BY dataVencimento ASC
    `;
    return await executeQuery(query, [cnpj]);
}

/**
 * Registra atendimento na tabela atendimento
 * @param {Object} atendimentoData - Dados do atendimento
 * @returns {Promise} Resultado da inserção
 */
async function registrarAtendimento(atendimentoData) {
    const { messageId, cliente, cnpj, conversa } = atendimentoData;
    const query = `
        INSERT INTO atendimento (messageId, cliente, cnpj, data, conversa)
        VALUES (?, ?, ?, NOW(), ?)
    `;
    return await executeQuery(query, [messageId, cliente, cnpj, JSON.stringify(conversa)]);
}

/**
 * Atualiza conversa do atendimento
 * @param {string} messageId - ID da mensagem inicial
 * @param {Array} conversa - Array com histórico da conversa
 * @returns {Promise} Resultado da atualização
 */
async function atualizarConversa(messageId, conversa) {
    const query = `
        UPDATE atendimento 
        SET conversa = ?
        WHERE messageId = ?
    `;
    return await executeQuery(query, [JSON.stringify(conversa), messageId]);
}

/**
 * Busca atendimento por messageId
 * @param {string} messageId - ID da mensagem
 * @returns {Promise} Dados do atendimento
 */
async function getAtendimentoByMessageId(messageId) {
    const query = `
        SELECT id, messageId, cliente, cnpj, data, conversa
        FROM atendimento 
        WHERE messageId = ?
        LIMIT 1
    `;
    return await executeQuery(query, [messageId]);
}

/**
 * Testa conexão com o banco de dados
 * @returns {Promise} Status da conexão
 */
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        await connection.ping();
        connection.release();
        //console.log('✅ Conexão com banco de dados estabelecida com sucesso');
        logger.info('✅ MySQL conectado com sucesso!');
        logger.info(`📊 Database: ${dbConfig.database}`);
        logger.info(`🖥️  Host: ${dbConfig.host}:${dbConfig.port}`);
        return true;
    } catch (error) {
        //console.error('❌ Erro na conexão com banco de dados:', error.message);
        logger.error('❌ Erro na conexão com banco de dados:', error.message);
        return false;
    }
}

/**
 * Fecha o pool de conexões
 */
async function closePool() {
    try {
        await pool.end();
        console.log('🔒 Pool de conexões fechado');
    } catch (error) {
        console.error('Erro ao fechar pool:', error);
    }
}

module.exports = {
    pool,
    executeQuery,
    getClienteByCNPJ,
    getClienteByCelular,
    getBoletosByCNPJ,
    registrarAtendimento,
    atualizarConversa,
    getAtendimentoByMessageId,
    testConnection,
    closePool
};