// 定义数据接口，防手抖
export interface BlockConfig {
  blockedDomains: string[];
  activeDays: number[];
  timeRanges: { start: string; end: string }[];
  isTemporarilyDisabled: boolean;
}

// 默认配置（兜底用）
const DEFAULT_CONFIG: BlockConfig = {
  blockedDomains: [],
  activeDays: [0, 1, 2, 3, 4, 5, 6], // 默认周日到周六全选
  timeRanges: [{ start: '00:00', end: '23:59' }], // 默认全天
  isTemporarilyDisabled: false
};

// 获取配置
export const getConfig = (): Promise<BlockConfig> => {
  return new Promise((resolve, /* reject */) => {
    // 强制校验 chrome.storage 是否存在
    if (typeof chrome === 'undefined' || !chrome.storage) {
      console.error("严重错误：无法访问 chrome.storage API，请检查 manifest 权限！");
      return resolve(DEFAULT_CONFIG);
    }

    chrome.storage.local.get('config', (result) => {
      if (chrome.runtime.lastError) {
        console.error("读取数据失败:", chrome.runtime.lastError);
        return resolve(DEFAULT_CONFIG);
      }
      // 如果 result.config 存在就返回它，否则返回默认值
      resolve(result.config as BlockConfig || DEFAULT_CONFIG);
    });
  });
};

// 保存配置
export const saveConfig = (config: BlockConfig): Promise<void> => {
  console.log("🚀 ~ saveConfig ~ config:", config);
  return new Promise((resolve, /* reject */) => {
    if (typeof chrome === 'undefined' || !chrome.storage) {
      console.error("严重错误：无法访问 chrome.storage API");
      return resolve();
    }
    chrome.storage.local.set({ config }, () => {
      if (chrome.runtime.lastError) {
        console.error("保存数据失败:", chrome.runtime.lastError);
      } else {
        console.log("💾 配置已成功保存到 storage:", config);
      }
      resolve();
    });
  });
};