// GET /api/dashboard?tabela1=319&tabela2=312&marca=59 (marca opcional)
import { getMongoDB } from '../utils/db'

const ANO_ZERO_KM = 32000

function parsePrice(priceStr: string): number {
    return parseFloat(
        priceStr.replace('R$', '').replace(/\./g, '').replace(',', '.').trim()
    )
}

async function processTabela(db: any, tabelaId: number, tabelaRef: string, marcaIdFiltro?: number) {
    const col = db.collection('Veiculos')
    const filter: any = { monthYearId: tabelaId }
    if (marcaIdFiltro) filter.brandCode = marcaIdFiltro

    const docs = await col.find(filter).toArray()
    const stats = new Map<number, any>()

    for (const doc of docs) {
        const { brandCode, brandName, models = [] } = doc

        if (!stats.has(brandCode)) {
            stats.set(brandCode, {
                ref: tabelaRef,
                tabelaId,
                brandCode,
                brandName,
                totalModelos: 0,
                totalVeiculos0km: 0,
                somaValores0km: 0,
                menorPreco0km: { modelo: '', valor: Infinity, valorFmt: 'N/A' },
                maiorPreco0km: { modelo: '', valor: -Infinity, valorFmt: 'N/A' },
                valorMedio0km: 0,
                valorMedio0kmFmt: 'N/A',
            })
        }

        const s = stats.get(brandCode)!

        for (const model of models) {
            for (const year of model.years ?? []) {
                if (year.year === ANO_ZERO_KM) {
                    s.totalModelos++
                    const price = parsePrice(year.price)
                    s.totalVeiculos0km++
                    s.somaValores0km += price
                    if (price < s.menorPreco0km.valor) {
                        s.menorPreco0km = { modelo: model.modelName, valor: price, valorFmt: year.price }
                    }
                    if (price > s.maiorPreco0km.valor) {
                        s.maiorPreco0km = { modelo: model.modelName, valor: price, valorFmt: year.price }
                    }
                }
            }
        }

        if (s.totalVeiculos0km > 0) {
            s.valorMedio0km = s.somaValores0km / s.totalVeiculos0km
            s.valorMedio0kmFmt = `R$ ${s.valorMedio0km.toFixed(2).replace('.', ',')}`
        } else {
            s.menorPreco0km = { modelo: 'N/A', valor: null, valorFmt: 'N/A' }
            s.maiorPreco0km = { modelo: 'N/A', valor: null, valorFmt: 'N/A' }
        }
    }

    return stats
}

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const tabela1Id = Number(query.tabela1)
    const tabela2Id = Number(query.tabela2)
    const marcaId = query.marca ? Number(query.marca) : undefined

    if (!tabela1Id || !tabela2Id) {
        throw createError({ statusCode: 400, message: "Parâmetros 'tabela1' e 'tabela2' são obrigatórios" })
    }
    if (tabela1Id === tabela2Id) {
        throw createError({ statusCode: 400, message: 'Os períodos devem ser diferentes' })
    }

    const db = await getMongoDB()
    const tabelasCol = db.collection('TabelaReferencia')

    // Busca labels das tabelas em paralelo
    const [ref1Doc, ref2Doc, stats1, stats2] = await Promise.all([
        tabelasCol.findOne({ codigo: tabela1Id }),
        tabelasCol.findOne({ codigo: tabela2Id }),
        processTabela(db, tabela1Id, '', marcaId),
        processTabela(db, tabela2Id, '', marcaId),
    ])

    const ref1 = ref1Doc?.mes ?? `Tabela ${tabela1Id}`
    const ref2 = ref2Doc?.mes ?? `Tabela ${tabela2Id}`

    // Atualiza labels após buscar
    stats1.forEach(s => (s.ref = ref1))
    stats2.forEach(s => (s.ref = ref2))

    // Monta resultado
    const allBrands = new Set([...stats1.keys(), ...stats2.keys()])
    const result = []

    for (const brandCode of allBrands) {
        const s1 = stats1.get(brandCode)
        const s2 = stats2.get(brandCode)

        const calcDiff = (v1: number, v2: number) =>
            v2 && v1 ? ((v1 / v2) - 1) * 100 : null

        result.push({
            brandName: s1?.brandName ?? s2?.brandName,
            brandCode,
            periodo1: s1 ?? { ref: ref1, tabelaId: tabela1Id, totalModelos: 0, valorMedio0kmFmt: 'N/A' },
            periodo2: s2 ?? { ref: ref2, tabelaId: tabela2Id, totalModelos: 0, valorMedio0kmFmt: 'N/A' },
            diferencasPercentuais: {
                valorMedio0km: calcDiff(s1?.valorMedio0km, s2?.valorMedio0km),
                totalModelos: calcDiff(s1?.totalModelos, s2?.totalModelos),
            },
        })
    }

    return result
})
