export const t = (key: string): string => {
  if (typeof chrome !== 'undefined' && chrome.i18n?.getMessage) {
    const message = chrome.i18n.getMessage(key);
    if (message) return message;
  }
  return key;
};
