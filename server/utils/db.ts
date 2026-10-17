import type { H3Event } from 'h3'
import { MongoClient, type Db } from 'mongodb'

// Workers cannot share MongoDB sockets between HTTP requests.
export async function withMongoDB<T>(event: H3Event, query: (db: Db) => Promise<T>): Promise<T> {
    const config = useRuntimeConfig(event)
    const mongoUri = config.mongoUri as string
    const mongoDatabase = config.mongoDatabase as string

    if (!mongoUri) {
        throw createError({
            statusCode: 500,
            message: 'A URI do banco de dados (NUXT_MONGO_URI) não foi configurada.',
        })
    }

    const client = new MongoClient(mongoUri, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        maxPoolSize: 2,
        minPoolSize: 0,
    })

    try {
        try {
            await client.connect()
        } catch (error: any) {
            console.error('❌ Erro ao conectar ao MongoDB:', error.message || error)
            throw createError({
                statusCode: 503,
                message: 'Não foi possível conectar ao banco de dados. Verifique a conexão com o MongoDB.',
            })
        }
        return await query(client.db(mongoDatabase))
    } finally {
        await client.close().catch(() => {
            console.error('Erro ao encerrar a conexão com o MongoDB.')
        })
    }
}
