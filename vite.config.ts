import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import webExtension from 'vite-plugin-web-extension';

export default defineConfig({
  plugins: [
    vue(),
    webExtension({
      // 告诉插件 manifest 文件的位置
      manifest: 'manifest.json',
      // 将这里设置为 true，阻止它每次启动都去调用一个新的浏览器进程
      disableAutoLaunch: true,
    }),
  ],
});