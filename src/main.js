import './assets/main.scss'

import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import locale from 'element-plus/dist/locale/zh-cn.js'
import router from './router/indexs.js'
import {createPinia} from 'pinia'
import {createPersistedState} from 'pinia-persistedstate-plugin'
import App from './App.vue'
import './assets/style/global.css'

const app = createApp(App);
const pinia = createPinia();
const persist = createPersistedState();

app.use(ElementPlus,{locale})
pinia.use(persist)
app.use(pinia)
app.use(router)
app.use(ElementPlus);
app.mount('#app')
