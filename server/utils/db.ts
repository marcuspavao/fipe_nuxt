// Plugin para conexão singleton com MongoDB no servidor Nitro
import { MongoClient } from 'mongodb'

let client: MongoClient | null = null

export async function getMongoDB() {
    const config = useRuntimeConfig()
    const mongoUri = config.mongoUri as string
    const mongoDatabase = config.mongoDatabase as string

    if (!mongoUri) {
        throw createError({
            statusCode: 500,
            statusMessage: 'A URI do banco de dados (MONGO_URI) não foi configurada.',
        })
    }

    if (!client) {
        try {
            client = new MongoClient(mongoUri, {
                serverSelectionTimeoutMS: 5000,
                connectTimeoutMS: 5000,
            })
            await client.connect()
            console.log('🔗 Conectado ao MongoDB')
        } catch (error: any) {
            client = null
            console.error('❌ Erro ao conectar ao MongoDB:', error.message || error)
            throw createError({
                statusCode: 503,
                statusMessage: 'Não foi possível conectar ao banco de dados. Verifique a conexão com o MongoDB.',
            })
        }
    }

    try {
        return client.db(mongoDatabase)
    } catch (error: any) {
        console.error('❌ Erro ao acessar a base de dados:', error.message || error)
        throw createError({
            statusCode: 500,
            statusMessage: `Erro ao acessar a base de dados '${mongoDatabase}'.`,
        })
    }
}
