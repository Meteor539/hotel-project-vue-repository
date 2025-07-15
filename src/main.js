import 'normalize.css/normalize.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { ElMessage } from 'element-plus'

import App from './App.vue'
import router from './router'
import { useUserStore } from './stores/counter'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// 配置全局ElMessage
app.config.globalProperties.$message = ElMessage

// 初始化用户信息
const userStore = useUserStore()
userStore.initUserInfo()

app.mount('#app')
