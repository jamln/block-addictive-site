document.addEventListener('DOMContentLoaded', () => {
  const timestamp = new Date().getTime();
  const randomBgUrl = `https://picsum.photos/1920/1080?random=${timestamp}`;
  document.documentElement.style.setProperty('--dynamic-bg', `url('${randomBgUrl}')`);

  const getMessage = (key, fallback) => {
    try {
      if (typeof chrome !== 'undefined' && chrome.i18n?.getMessage) {
        const msg = chrome.i18n.getMessage(key);
        if (msg) return msg;
      }
    } catch (_) {
      // ignore
    }
    return fallback || key;
  };

  document.title = getMessage('block_title', document.title);

  const heading = document.getElementById('blockHeading');
  if (heading) heading.textContent = getMessage('block_heading', heading.textContent);

  const message = document.getElementById('blockMessage');
  if (message) message.textContent = getMessage('block_message', message.textContent);

  const closeBtn = document.getElementById('closeBtn');
  if (closeBtn) {
    closeBtn.textContent = getMessage('block_close', closeBtn.textContent);
    closeBtn.addEventListener('click', () => {
      window.close();
    });
  }
});
