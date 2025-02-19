// https://nuxt.com/docs/api/configuration/nuxt-config
const appName = 'ChatGPT UI (华创传媒志国)'

export default defineNuxtConfig({
    ssr: false,
    dev: false,
    app: {
        head: {
            title: appName,
        },
    },
    runtimeConfig: {
        public: {
            appName: appName
        }
    },
    build: {
        transpile: ['vuetify']
    },
    css: [
        'vuetify/styles',
        'material-design-icons-iconfont/dist/material-design-icons.css',
        'highlight.js/styles/panda-syntax-dark.css',
    ]
})
