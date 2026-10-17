// GET /api/tabelas
import { withMongoDB } from '../utils/db'

// Retorna as tabelas de referência que possuem veículos
export default defineEventHandler(async (event) => {
    console.log('[API] GET /api/tabelas — chamada recebida')

    try {
        return await withMongoDB(event, async (db) => {
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

            // Fetch available months once instead of querying every reference table.
            const mesesComVeiculos = new Set(await db.collection('Veiculos').distinct('monthYearId'))
            const filtered = tabelas.filter(t => mesesComVeiculos.has(t.codigo))
            console.log(`[API] GET /api/tabelas — ${filtered.length} tabelas com veículos retornadas`)

            return filtered
        })
    } catch (err: any) {
        console.error('[API] GET /api/tabelas — ❌ Erro:', err)
        if (err.statusCode) throw err
        throw createError({ statusCode: 500, message: 'Erro ao buscar tabelas de referência no banco de dados.' })
    }
})
