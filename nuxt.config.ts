export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  modules: ['@pinia/nuxt'],
    runtimeConfig: {
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    printfulApiKey: process.env.PRINTFUL_API_KEY,
  },
})
