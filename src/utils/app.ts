import { createApp } from 'vue';
import type { Component } from 'vue';
import { t } from '../utils/i18n';
import { registerAntd } from '../utils/antd';

type CreateAppOptions = {
  root: Component;
  selector?: string;
};

export const createMountedApp = ({ root, selector = '#app' }: CreateAppOptions) => {
  const app = createApp(root);
  registerAntd(app);
  app.config.globalProperties.$t = t;
  app.mount(selector);
};
