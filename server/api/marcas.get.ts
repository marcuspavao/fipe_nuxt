// GET /api/marcas?tabela=319
import { getMongoDB } from '../utils/db'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const tabelaId = Number(query.tabela)

    if (!tabelaId) {
        throw createError({ statusCode: 400, message: "Parâmetro 'tabela' é obrigatório" })
    }

    const db = await getMongoDB()
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
