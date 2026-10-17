// GET /api/marcas?tabela=319
import { withMongoDB } from '../utils/db'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const tabelaId = Number(query.tabela)

    if (!tabelaId) {
        throw createError({ statusCode: 400, message: "Parâmetro 'tabela' é obrigatório" })
    }

    try {
        return await withMongoDB(event, async (db) => {
            const col = db.collection('Veiculos')

            // Busca marcas distintas para a tabela
            const docs = await col
                .find({ monthYearId: tabelaId }, { projection: { brandCode: 1, brandName: 1, _id: 0 } })
                .toArray()

            // Deduplica por brandCode
            const seen = new Set<number>()
            const marcas = docs
                .filter(d => {
                    if (seen.has(d.brandCode)) return false
                    seen.add(d.brandCode)
                    return true
                })
                .sort((a, b) => a.brandName.localeCompare(b.brandName))

            return marcas
        })
    } catch (err: any) {
        console.error('[API] GET /api/marcas — ❌ Erro:', err)
        if (err.statusCode) throw err
        throw createError({ statusCode: 500, message: 'Erro ao buscar marcas no banco de dados.' })
    }
})
