// Plugin para conexão singleton com MongoDB no servidor Nitro
import { MongoClient } from 'mongodb'

let client: MongoClient | null = null

export async function getMongoDB() {
    if (!client) {
        const config = useRuntimeConfig()
        client = new MongoClient(config.mongoUri as string)
        await client.connect()
        console.log('🔗 Conectado ao MongoDB')
    }
    const config = useRuntimeConfig()
    return client.db(config.mongoDatabase as string)
}
