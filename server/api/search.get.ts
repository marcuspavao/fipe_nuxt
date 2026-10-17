import { getMongoDB } from "../utils/db"

// GET /api/search?q=gol&tabela=319
export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const q = String(query.q ?? '').trim()
    const tabelaId = Number(query.tabela)

    if (q.length < 2) {
        throw createError({ statusCode: 400, message: 'Busca deve ter ao menos 2 caracteres' })
    }
    if (!tabelaId) {
        throw createError({ statusCode: 400, message: "Parâmetro 'tabela' é obrigatório" })
    }

    try {
        const db = await getMongoDB()
        const col = db.collection('Veiculos')
        const regex = new RegExp(q, 'i')

        const docs = await col.find({
            monthYearId: tabelaId,
            $or: [
                { brandName: regex },
                { 'models.modelName': regex },
            ],
        }).toArray()

        // Flatten: retorna os modelos que batem com a busca
        const results: any[] = []
        for (const doc of docs) {
            for (const model of doc.models ?? []) {
                if (regex.test(model.modelName) || regex.test(doc.brandName)) {
                    results.push({
                        brandCode: doc.brandCode,
                        brandName: doc.brandName,
                        modelCode: model.modelCode,
                        modelName: model.modelName,
                    })
                }
            }
        }

        return results.slice(0, 50)
    } catch (err: any) {
        console.error('[API] GET /api/search — ❌ Erro:', err)
        if (err.statusCode) throw err
        throw createError({ statusCode: 500, message: 'Erro ao realizar a busca no banco de dados.' })
    }
})
