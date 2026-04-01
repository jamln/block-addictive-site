import { getConfig, saveConfig, type BlockConfig } from '../src/utils/storage';

// 探针 1：确认后台脚本真的被加载了
console.log("🚀 Block Site 后台服务已成功启动！");

const TEMP_DISABLE_MS = 10 * 60 * 1000;
const TEMP_DISABLE_ALARM = 'temp-disable-expire';

// 根据过期时间设置闹钟，确保 10 分钟后自动关闭
const scheduleTempDisable = (until?: number) => {
  try {
    chrome.alarms.clear(TEMP_DISABLE_ALARM);
    if (until && until > Date.now()) {
      chrome.alarms.create(TEMP_DISABLE_ALARM, { when: until });
    }
  } catch (error) {
    console.error('❌ 设置临时放行闹钟失败:', error);
  }
};

// 过期保护：如果临时放行已过期，自动关闭并落库
async function ensureTempDisabledValid(config: BlockConfig): Promise<BlockConfig> {
  if (config.isTemporarilyDisabled) {
    if (config.temporarilyDisabledUntil) {
      if (Date.now() >= config.temporarilyDisabledUntil) {
        const next = {
          ...config,
          isTemporarilyDisabled: false,
          temporarilyDisabledUntil: undefined,
        };
        await saveConfig(next);
        return next;
      }
      return config;
    }

    // 兼容旧配置：没有过期时间就补一个 10 分钟
    const until = Date.now() + TEMP_DISABLE_MS;
    const next = { ...config, temporarilyDisabledUntil: until };
    await saveConfig(next);
    scheduleTempDisable(until);
    return next;
  }

  return config;
}

function isBlockTime(config: BlockConfig): boolean {
  if (config.isTemporarilyDisabled) {
    console.log("🛑 临时放行已开启，跳过拦截");
    return false;
  }

  const now = new Date();
  const currentDay = now.getDay();
  const activeDaysStr = config.activeDays || [];
  const activeDaysNum = activeDaysStr.map(Number);

  if (!activeDaysNum.includes(currentDay)) {
    console.log(`📅 今天是星期 ${currentDay}，不在拦截配置的星期范围内:`, activeDaysNum);
    return false;
  }

  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const currentTimeStr = `${hours}:${minutes}`;

  // console.log(`⏰ 当前时间: ${currentTimeStr}`);

  const timeRanges = config.timeRanges || [];
  let isTimeMatch = false;

  timeRanges.forEach((timeRange) => {
    if (currentTimeStr >= timeRange.start && currentTimeStr <= timeRange.end) {
      isTimeMatch = true;
    }
  });

  if (!isTimeMatch) console.log("⏳ 当前时间不在任何拦截范围内");
  return isTimeMatch;
}

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // 探针 2：记录所有状态变化的 Tab
  if (changeInfo.status === 'loading') {
    console.log(`🌐 侦测到网页加载 - URL: ${tab.url}`);

    if (tab.url && tab.url.startsWith('http')) {
      try {
        const urlObj = new URL(tab.url);
        const hostname = urlObj.hostname;

        const config = await getConfig();
        const checked = await ensureTempDisabledValid(config);
        console.log("📦 读取到的最新配置:", checked);

        if (!checked || !checked.blockedDomains || checked.blockedDomains.length === 0) {
          console.log("🈳 黑名单为空，放行");
          return;
        }

        const isBlocked = checked.blockedDomains.some((domain: string) => {
          const cleanDomain = domain.trim();
          return cleanDomain && (hostname === cleanDomain || hostname.endsWith(`.${cleanDomain}`));
        });

        if (isBlocked) {
          console.log(`🎯 命中黑名单域名: ${hostname}，开始检查时间...`);
          if (isBlockTime(checked)) {
            console.log("🚨 时间条件满足，执行拦截重定向！");
            const blockPageUrl = chrome.runtime.getURL('block.html');
            chrome.tabs.update(tabId, { url: blockPageUrl });
          }
        } else {
          console.log(`✅ 域名 ${hostname} 不在黑名单中，放行`);
        }
      } catch (error) {
        console.error("❌ 拦截逻辑执行出错:", error);
      }
    }
  }
});

// 监听配置变化，动态更新闹钟
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== 'local' || !changes.config) return;
  const next = changes.config.newValue as BlockConfig;
  if (next?.isTemporarilyDisabled) {
    scheduleTempDisable(next.temporarilyDisabledUntil);
  } else {
    scheduleTempDisable(undefined);
  }
});

// 闹钟到点后关闭临时放行
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== TEMP_DISABLE_ALARM) return;
  const current = await getConfig();
  if (current.isTemporarilyDisabled) {
    await saveConfig({
      ...current,
      isTemporarilyDisabled: false,
      temporarilyDisabledUntil: undefined,
    });
  }
});

// 启动时根据配置补齐闹钟
getConfig().then((config) => {
  if (config.isTemporarilyDisabled) {
    scheduleTempDisable(config.temporarilyDisabledUntil);
  }
});
