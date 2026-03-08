import { getConfig } from '../src/utils/storage';

// 探针 1：确认后台脚本真的被加载了
console.log("🚀 Block Site 后台服务已成功启动！111");

function isBlockTime(config: any): boolean {
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
        console.log("📦 读取到的最新配置:", config);

        if (!config || !config.blockedDomains || config.blockedDomains.length === 0) {
          console.log("🈳 黑名单为空，放行");
          return;
        }

        const isBlocked = config.blockedDomains.some((domain: string) => {
          const cleanDomain = domain.trim();
          return cleanDomain && (hostname === cleanDomain || hostname.endsWith(`.${cleanDomain}`));
        });

        if (isBlocked) {
          console.log(`🎯 命中黑名单域名: ${hostname}，开始检查时间...`);
          if (isBlockTime(config)) {
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