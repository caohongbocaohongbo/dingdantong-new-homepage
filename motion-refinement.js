(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const regions = [];
  const arc = 'M103.371 103.693C413.371 386.693 964.061 501.821 1366.54 501.821C1693.9 501.821 2065.17 378.043 2326.37 208.462';
  // 与 06833.svg 共用原始路径和 viewBox，挂在同一图层内，缩放与裁切保持一致。
  const hero = document.querySelector('.hero-art');
  hero.querySelector('.f46').insertAdjacentHTML('beforeend', `
    <svg class="hero-arc-current" viewBox="0 0 2429.09 606.821" preserveAspectRatio="none" aria-hidden="true" data-fx-clock>
      <defs>
        <linearGradient id="order-current-tail"><stop offset="0" stop-color="white" stop-opacity="0"/><stop offset=".14" stop-color="white" stop-opacity=".08"/><stop offset=".34" stop-color="white" stop-opacity=".3"/><stop offset=".58" stop-color="white" stop-opacity=".72"/><stop offset=".72" stop-color="white" stop-opacity=".62"/><stop offset=".89" stop-color="white" stop-opacity=".19"/><stop offset="1" stop-color="white" stop-opacity="0"/></linearGradient>
        <mask id="order-current-window" maskUnits="userSpaceOnUse" x="-100" y="-100" width="2700" height="850" style="mask-type:alpha">
          <rect class="arc-current-window" x="-1750" y="-100" width="1750" height="850" fill="url(#order-current-tail)"/>
          <rect class="arc-current-window arc-current-window-secondary" x="-1750" y="-100" width="1750" height="850" fill="url(#order-current-tail)"/>
        </mask>
        <filter id="order-current-bloom" x="-10%" y="-30%" width="120%" height="160%"><feGaussianBlur stdDeviation="16"/></filter>
        <filter id="order-current-soft" x="-10%" y="-20%" width="120%" height="140%"><feGaussianBlur stdDeviation="3.5"/></filter>
      </defs>
      <g mask="url(#order-current-window)" fill="none" stroke-linecap="round">
        <path d="${arc}" stroke="#38d7b0" stroke-width="64" opacity=".52" filter="url(#order-current-bloom)"/>
        <path d="${arc}" stroke="#8cebd5" stroke-width="22" opacity=".72" filter="url(#order-current-soft)"/>
        <path d="${arc}" stroke="#d9fff5" stroke-width="6" opacity=".47" filter="url(#order-current-soft)"/>
        
      </g>
    </svg>`);
  regions.push(hero);

  // 对现有图片的柔边做小幅像素位移，不逐条改动复杂 SVG 的内部路径。
  for (const [selector, imageSelector, id, strength, duration] of [
    ['.wave-art', '.f80 > img', 'order-wave-edge', 12, 24],
    ['.transition-art', '.f1 > img', 'order-transition-edge', 10, 27]
  ]) {
    const region = document.querySelector(selector);
    const image = region?.querySelector(imageSelector);
    if (!image) continue;
    region.insertAdjacentHTML('beforeend', `<svg class="fx-filter-defs" aria-hidden="true" data-fx-clock><defs>
      <filter id="${id}" x="-2%" y="-3%" width="104%" height="106%" color-interpolation-filters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency=".0012 .005" numOctaves="1" seed="7" result="soft-noise">
          <animate attributeName="baseFrequency" values=".0012 .005;.0016 .0065;.0012 .005" dur="${duration}s" repeatCount="indefinite"/>
        </feTurbulence>
        <feDisplacementMap in="SourceGraphic" in2="soft-noise" scale="${strength}" xChannelSelector="R" yChannelSelector="G">
          <animate attributeName="scale" values="${strength * .55};${strength};${strength * .55}" dur="${duration}s" repeatCount="indefinite"/>
        </feDisplacementMap>
      </filter>
    </defs></svg>`);
    image.classList.add('fx-soft-edge');
    image.style.setProperty('--edge-filter', `url(#${id})`);
    regions.push(region);
  }

  // 复用圆角边缘流光：专业版与登录按钮沿用配色，输入框使用纯白细管线。
  for (const [selector, kind] of [
    ['.pricing [data-node-id="425:6185"]', 'liquid-card'],
    ['.hero-layout [data-action="login"]', 'liquid-button'],
    ['.hero-layout [data-node-id="343:4737"]', 'liquid-input']
  ]) {
    const element = document.querySelector(selector);
    if (!element) continue;
    element.classList.add(kind);
    const edge = document.createElement('span');
    edge.className = 'liquid-edge';
    edge.setAttribute('aria-hidden', 'true');
    element.append(edge);
    regions.push(element);
  }

  // 导航文字扫光也随可见区域和后台状态暂停。
  const bookingLink = document.querySelector('.booking-link');
  if (bookingLink) regions.push(bookingLink);

  function sync(region) {
    const active = region.classList.contains('fx-in-view') && !reduced.matches && !document.hidden;
    region.classList.toggle('fx-playing', active);
    region.querySelectorAll('svg[data-fx-clock]').forEach(svg => {
      if (active) svg.unpauseAnimations?.();
      else svg.pauseAnimations?.();
    });
  }
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      entry.target.classList.toggle('fx-in-view', entry.isIntersecting);
      sync(entry.target);
    }));
    regions.forEach(region => {sync(region); observer.observe(region);});
  } else regions.forEach(region => {region.classList.add('fx-in-view'); sync(region);});
  reduced.addEventListener('change', () => regions.forEach(sync));
  document.addEventListener('visibilitychange', () => regions.forEach(sync));
})();
