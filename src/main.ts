import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

import './style.css'
import App from './App.vue'

// Import pages
import ShoppingPage from './pages/ShoppingPage.vue'
import MapPage from './pages/MapPage.vue'
import CalendarPage from './pages/CalendarPage.vue'
import WordsPage from './pages/WordsPage.vue'
import IdiomsPage from './pages/IdiomsPage.vue'

// Create router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/shopping' },
    { path: '/shopping', component: ShoppingPage },
    { path: '/map', component: MapPage },
    { path: '/calendar', component: CalendarPage },
    { path: '/words', component: WordsPage },
    { path: '/idioms', component: IdiomsPage },
  ]
})

// Create Pinia store
const pinia = createPinia()

// Create Vuetify instance
const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light'
  }
})

// Create app
const app = createApp(App)

// Use plugins
app.use(router)
app.use(pinia)
app.use(vuetify)

// Mount app
app.mount('#app')
