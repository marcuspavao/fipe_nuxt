// GET /api/modelos/[marca]?tabela=319
import { withMongoDB } from '../../utils/db'

export default defineEventHandler(async (event) => {
    const marcaId = Number(getRouterParam(event, 'marca'))
    const query = getQuery(event)
    const tabelaId = Number(query.tabela)

    if (!marcaId || !tabelaId) {
        throw createError({ statusCode: 400, message: "Parâmetros 'marca' e 'tabela' são obrigatórios" })
    }

    try {
        return await withMongoDB(event, async (db) => {
            const col = db.collection('Veiculos')

            const doc = await col.findOne({ monthYearId: tabelaId, brandCode: marcaId })
            if (!doc) {
                throw createError({ statusCode: 404, message: 'Marca não encontrada para esta tabela' })
            }

            return doc.models ?? []
        })
    } catch (err: any) {
        console.error('[API] GET /api/modelos — ❌ Erro:', err)
        if (err.statusCode) throw err
        throw createError({ statusCode: 500, message: 'Erro ao buscar modelos no banco de dados.' })
    }
})
