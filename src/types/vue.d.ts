import { t } from '../utils/i18n';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $t: typeof t;
  }
}

export {};
