import type { App } from 'vue';
import {
  Button,
  Card,
  Switch,
  Divider,
  Input,
  List,
  Checkbox,
  TimePicker,
} from 'ant-design-vue';

import 'ant-design-vue/es/button/style';
import 'ant-design-vue/es/card/style';
import 'ant-design-vue/es/switch/style';
import 'ant-design-vue/es/divider/style';
import 'ant-design-vue/es/input/style';
import 'ant-design-vue/es/list/style';
import 'ant-design-vue/es/checkbox/style';
import 'ant-design-vue/es/date-picker/style';

export const registerAntd = (app: App) => {
  app.use(Button);
  app.use(Card);
  app.use(Switch);
  app.use(Divider);
  app.use(Input);
  app.use(List);
  app.use(Checkbox);
  app.use(TimePicker);
};
