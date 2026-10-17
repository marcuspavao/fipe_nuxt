// GET /api/veiculos?modelo=4921&tabela=319
import { getMongoDB } from '../utils/db'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const tabelaId = Number(query.tabela)
    const modeloId = Number(query.modelo)

    if (!tabelaId || !modeloId) {
        throw createError({ statusCode: 400, message: "Parâmetros 'tabela' e 'modelo' são obrigatórios" })
    }

    try {
        const db = await getMongoDB()
        const col = db.collection('Veiculos')

        const doc = await col.findOne({
            monthYearId: tabelaId,
            'models.modelCode': modeloId,
        })

        if (!doc) {
            throw createError({ statusCode: 404, message: 'Veículo não encontrado' })
        }

        // Encontra o modelo específico e retorna seus anos com o nome do modelo
        const modelo = doc.models?.find((m: any) => m.modelCode === modeloId)
        if (!modelo?.years) {
            throw createError({ statusCode: 404, message: 'Anos não encontrados para o modelo' })
        }

        return modelo.years.map((year: any) => ({
            ...year,
            model: modelo.modelName,
            brandName: doc.brandName,
            brandCode: doc.brandCode,
        }))
    } catch (err: any) {
        console.error('[API] GET /api/veiculos — ❌ Erro:', err)
        if (err.statusCode) throw err
        throw createError({ statusCode: 500, message: 'Erro ao buscar detalhes do veículo no banco de dados.' })
    }
})
