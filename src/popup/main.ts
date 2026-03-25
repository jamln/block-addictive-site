import { createApp } from 'vue';
import './style.css';
// import 'ant-design-vue/dist/antd.css';
import PopupApp from './PopupApp.vue';
import { t } from '../utils/i18n';

const app = createApp(PopupApp)

// 直接导入所有组件
import Antd, { message, notification } from 'ant-design-vue'
app.use(Antd)

// 为全局属性设置类型
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $message: typeof import('ant-design-vue').message;
    $notification: typeof import('ant-design-vue').notification;
    $t: (key: string) => string;
  }
}

app.config.globalProperties.$message = message
app.config.globalProperties.$notification = notification
app.config.globalProperties.$t = t
app.mount('#app')
