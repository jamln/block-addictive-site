import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

const app = createApp(App)

// 直接导入所有组件
import Antd, { message, notification } from 'ant-design-vue'
app.use(Antd)

// 为全局属性设置类型
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $message: typeof import('ant-design-vue').message;
    $notification: typeof import('ant-design-vue').notification;
  }
}

app.config.globalProperties.$message = message
app.config.globalProperties.$notification = notification
app.mount('#app')

