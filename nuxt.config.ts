import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
    compatibilityDate: '2026-10-16',
    nitro: {
        cloudflare: {
            nodeCompat: true,
        },
        rollupConfig: {
            plugins: [{
                name: 'mongodb-worker-optional-dependencies',
                transform(code, id) {
                    if (!process.env.NITRO_PRESET?.startsWith('cloudflare') ||
                        !id.replaceAll('\\', '/').endsWith('/mongodb/lib/deps.js')) return

                    // Keep the driver's try/catch fallback for unavailable Worker features.
                    const optional = /require\((['"])(snappy|@mongodb-js\/zstd|kerberos|@aws-sdk\/credential-providers|gcp-metadata|socks|aws4|mongodb-client-encryption)\1\)/g
                    return {
                        code: code.replace(optional, (_match, _quote, name) =>
                            `(() => { throw new Error(${JSON.stringify('MongoDB optional dependency unavailable in Workers: ')} + ${JSON.stringify(name)}); })()`),
                        map: null,
                    }
                },
            }],
        },
    },
    ssr: false,

    // Separação frontend / backend
    srcDir: 'app',    // pages, components, layouts, assets ficam em app/
    serverDir: 'server', // aponta para a pasta /server na raiz do projeto

    // Desativa Nuxt DevTools porque é muito pesado nas dependências
    devtools: { enabled: false },



    // Removemos os módulos não utilizados do FIPE App (Pinia, ColorMode, Icons) para limpar o servidor
    modules: [],

    runtimeConfig: {
        // Privadas (apenas server-side)
        mongoUri: '', // Defina NUXT_MONGO_URI no ambiente.
        mongoDatabase: 'fipe_db',
        // Públicas (acessíveis no frontend)
        public: {
            appName: 'FIPE App',
        },
    },

    routeRules: {
        '/api/**': { cors: false },
    },

    css: [
        '@fortawesome/fontawesome-free/css/fontawesome.css',
        '@fortawesome/fontawesome-free/css/solid.css',
        '~/assets/base.css',
        '~/assets/main.css'
    ],

    app: {
        head: {
            title: 'FIPE App — Consulta Tabela FIPE',
            meta: [
                { charset: 'utf-8' },
                { name: 'viewport', content: 'width=device-width, initial-scale=1' },
                { name: 'description', content: 'Consulte preços de veículos na Tabela FIPE.' },
            ],
            link: [
                { rel: 'icon', href: '/icon_2.png' },
                { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css' }
            ],
            script: [
                { src: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js', tagPosition: 'bodyClose' }
            ]
        },
        pageTransition: { name: 'page', mode: 'out-in' },
    },
})
