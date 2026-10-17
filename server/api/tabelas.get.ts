// GET /api/tabelas
import { getMongoDB } from '../utils/db'

// Retorna as tabelas de referência que possuem veículos
export default defineEventHandler(async () => {
    console.log('[API] GET /api/tabelas — chamada recebida')

    try {
        const db = await getMongoDB()
        const col = db.collection('TabelaReferencia')

        const tabelas = await col
            .find({})
            .sort({ codigo: -1 })
            .toArray()

        console.log(`[API] GET /api/tabelas — ${tabelas.length} tabelas encontradas no banco`)

        if (tabelas.length === 0) {
            console.warn('[API] GET /api/tabelas — Nenhuma tabela de referência encontrada na base de dados.')
            return []
        }

        // Filtra apenas as que têm veículos (verifica em paralelo)
        const veiculosCol = db.collection('Veiculos')
        const results = await Promise.all(
            tabelas.map(async (t) => {
                const count = await veiculosCol.countDocuments({ monthYearId: t.codigo })
                return count > 0 ? t : null
            })
        )

        const filtered = results.filter(Boolean)
        console.log(`[API] GET /api/tabelas — ${filtered.length} tabelas com veículos retornadas`)

        return filtered
    } catch (err: any) {
        console.error('[API] GET /api/tabelas — ❌ Erro:', err)
        if (err.statusCode) throw err
        throw createError({ statusCode: 500, message: 'Erro ao buscar tabelas de referência no banco de dados.' })
    }
})
