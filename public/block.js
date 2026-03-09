document.addEventListener('DOMContentLoaded', () => {
  // 1. 生成当前时间的毫秒时间戳，作为“防缓存穿透参数”
  const timestamp = new Date().getTime();
  
  // 2. 准备随机必应壁纸接口（这里提供两个备选）
  // 方案 A: 专门提供随机必应壁纸的国内 API (带上 &t=时间戳 彻底防缓存)
  // const randomBgUrl = `https://api.bimg.cc/random?w=1920&h=1080&mkt=zh-CN&t=${timestamp}`;
  
  // 方案 B (备用): 全球最著名的高清随机图库 Picsum (如果方案 A 某天挂了，可以换这行)
  // const randomBgUrl = `https://picsum.photos/1920/1080?random=${timestamp}`;

  // 3. 将这个全新的图片地址，注入到 HTML 根节点的 CSS 变量中
  document.documentElement.style.setProperty('--dynamic-bg', `url('${randomBgUrl}')`);

  // 4. 原本的关闭按钮逻辑
  const closeBtn = document.getElementById('closeBtn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      window.close();
    });
  }
});