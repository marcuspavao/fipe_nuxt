
const API_BASE_URL = '/api';

export async function getTabelas() {
    const response = await fetch(`${API_BASE_URL}/tabelas`);
    console.log(response); // Mantenho o console.log para depuração, como estava no seu código.
    if (!response.ok) throw new Error('Erro ao carregar tabelas de referência');
    return response.json();
}

/**
 * Busca as marcas de veículos para uma tabela de referência específica.
 * @param {string} tabela - O código da tabela de referência FIPE.
 * @returns {Promise<Array>} Uma promessa que resolve para um array de marcas.
 * @throws {Error} Se a requisição falhar.
 */
export async function getMarcas(tabela) {
    const response = await fetch(`${API_BASE_URL}/marcas?tabela=${tabela}`);
    if (!response.ok) throw new Error('Erro ao carregar marcas');
    return response.json();
}

/**
 * Busca os modelos de veículos para uma marca e tabela de referência específicas.
 * @param {string} tabela - O código da tabela de referência FIPE.
 * @param {string} marca - O código da marca do veículo.
 * @returns {Promise<Array>} Uma promessa que resolve para um array de modelos.
 * @throws {Error} Se a requisição falhar.
 */
export async function getModelos(tabela, marca) {
    const response = await fetch(`${API_BASE_URL}/modelos/${marca}?tabela=${tabela}`);
    if (!response.ok) throw new Error('Erro ao carregar modelos');
    return response.json();
}

/**
 * Busca os detalhes de um veículo (incluindo anos/versões) para um modelo e tabela específicos.
 * @param {string} tabela - O código da tabela de referência FIPE.
 * @param {string} modelo - O código do modelo do veículo (geralmente o código FIPE do modelo/ano).
 * @returns {Promise<Array>} Uma promessa que resolve para um array com os detalhes do veículo.
 * @throws {Error} Se a requisição falhar.
 */
export async function getVeiculos(tabela, modelo) {
    const response = await fetch(`${API_BASE_URL}/veiculos?modelo=${modelo}&tabela=${tabela}`);
    if (!response.ok) throw new Error('Erro ao carregar detalhes do veículo');
    return response.json();
}

/**
 * Busca veículos por texto livre.
 * @param {string} query - O texto para buscar (nome da marca, modelo, etc.).
 * @param {string} tabela - O código da tabela de referência FIPE.
 * @returns {Promise<Array>} Uma promessa que resolve para um array de veículos encontrados.
 * Cada veículo deve ter pelo menos `name`, `marca`, e `fipe_codigo` (ou `codigoFipe`).
 * @throws {Error} Se a requisição falhar ou a query for inválida.
 */
export async function searchVeiculos(query, tabela) {
    if (!query || typeof query !== 'string' || query.trim().length < 2) {
        return [];
    }
    if (!tabela) {
        throw new Error('Tabela de referência não fornecida para a busca.');
    }

    const encodedQuery = encodeURIComponent(query.trim());
    const url = `${API_BASE_URL}/search?q=${encodedQuery}&tabela=${tabela}`;

    const response = await fetch(url);
    if (!response.ok) {
        let errorMsg = `Erro ao buscar veículos: ${response.status} ${response.statusText}`;
        try {
            const errorBody = await response.json();
            errorMsg = errorBody.message || errorBody.error || errorMsg;
        } catch (e) {
            // Ignora se não conseguir parsear o corpo do erro
        }
        throw new Error(errorMsg);
    }
    return response.json();
}

/**
 * Formata uma string de mês/ano (ex: "abril/2023") para exibição (ex: "Abril de 2023").
 * @param {string} mesAnoString - A string de mês/ano.
 * @returns {string} A string formatada ou a original em caso de erro.
 */
export function formatarPeriodoParaExibicao(mesAnoString) {
    if (!mesAnoString || typeof mesAnoString !== 'string') {
        return 'Período inválido';
    }
    const parts = mesAnoString.split('/');
    if (parts.length === 2) {
        const mes = capitalizeFirstLetter(parts[0].trim());
        const ano = parts[1].trim();
        if (mes && /^\d{4}$/.test(ano)) {
            return `${mes} de ${ano}`;
        }
    }
    return `Tabela Ref: ${mesAnoString}`;
}

/**
 * Capitaliza a primeira letra de uma string.
 * @param {string} string - A string para capitalizar.
 * @returns {string} A string com a primeira letra maiúscula.
 */
function capitalizeFirstLetter(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

/**
 * Busca dados para o dashboard, comparando valores entre duas tabelas para uma marca específica ou todas.
 * @param {string} tabela1 - O código da primeira tabela de referência.
 * @param {string} tabela2 - O código da segunda tabela de referência.
 * @param {string} [marca] - O código da marca (opcional). Se não fornecido ou 'all', busca para todas as marcas.
 * @returns {Promise<any>} Uma promessa que resolve para os dados do dashboard.
 * @throws {Error} Se a requisição falhar.
 */
export async function getDashboardData(tabela1, tabela2, marca) {
    let url = `${API_BASE_URL}/dashboard?tabela1=${tabela1}&tabela2=${tabela2}`;
    if (marca && marca !== 'all') {
        url += `&marca=${marca}`;
    }
    const response = await fetch(url);
    if (!response.ok) {
        let errorMsg = `Erro ao buscar dados do dashboard: ${response.status} ${response.statusText}`;
        try {
            const errorBody = await response.json();
            errorMsg += ` - ${errorBody.message || errorBody.error || JSON.stringify(errorBody)}`;
        } catch (e) {
            // Ignora se não for possível parsear o corpo do erro
        }
        throw new Error(errorMsg);
    }
    return response.json();
}