import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

const app = createApp(App)

// 直接导入所有组件
import Antd, {
  Button,
  Table,
  Input,
  Form,
  Select,
  Dropdown,
  Menu,
  Avatar,
  Breadcrumb,
  Pagination,
  Modal,
  Upload,
  Progress,
  Spin,
  Alert,
  Carousel,
  Collapse,
  Descriptions,
  List,
  Rate,
  Statistic,
  Tabs,
  Timeline,
  Tooltip,
  Tree,
  TreeSelect
} from 'ant-design-vue'
app.use(Antd)

app.config.globalProperties.$message = Antd.message
app.config.globalProperties.$notification = Antd.notification
app.mount('#app')
