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
    } catch (err) {
        console.error('[API] GET /api/tabelas — ❌ Erro:', err)
        throw createError({ statusCode: 500, message: 'Erro ao buscar tabelas' })
    }
})
