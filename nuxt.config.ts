import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
    compatibilityDate: '2024-11-01',
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
        mongoUri: process.env.MONGO_URI || 'mongodb://root:123456@66.179.190.157:27017/?authSource=admin',
        mongoDatabase: process.env.MONGO_DATABASE || 'fipe_db',
        // Públicas (acessíveis no frontend)
        public: {
            appName: 'FIPE App',
        },
    },

    routeRules: {
        '/api/**': { cors: false },
    },

    css: [
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
                { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css' },
                { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css' }
            ],
            script: [
                { src: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js', tagPosition: 'bodyClose' }
            ]
        },
        pageTransition: { name: 'page', mode: 'out-in' },
    },
})