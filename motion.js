(() => {
  'use strict';
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const node = id => $(`[data-node-id="${id}"]`);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const mobile = matchMedia('(max-width: 760px)');
  const transients = new Set();
  const canMove = () => !reduced.matches && !document.hidden;

  function play(element, frames, options = {}) {
    if (!element || !canMove() || !element.animate) return null;
    const animation = element.animate(frames, { duration: 220, easing: 'cubic-bezier(.2,.8,.2,1)', ...options });
    transients.add(animation);
    animation.finished.then(() => transients.delete(animation), () => transients.delete(animation));
    return animation;
  }

  // 图片文件和 SVG 内部数据均保持原样，只移动已经分开的图层。
  const layerSettings = [
    ['.transition-art > .f1', 14, -5, 18, -2, 1.01, .95],
    ['.footer-art [data-node-id="340:4567"]', 22, -8, 22, -4, 1.012, .97],
    ['.footer-art .f359', 40, -15, 14, -3, 1.035, .88],
    ['.footer-art .f360', -35, 12, 18, -5, 1.025, .91],
    ['.footer-art img[src$="577e6.svg"]', 25, 8, 17, -2, 1.02, .9],
    ['.footer-art img[src$="f41dc.svg"]', -20, -6, 20, -6, 1.02, .94]
  ];
  for (const [selector,x,y,seconds,delay,scale,opacity] of layerSettings) {
    const element = $(selector);
    if (!element) continue;
    element.classList.add('ambient-layer');
    for (const [name,value] of Object.entries({
      '--drift-x': `${x}px`, '--drift-y': `${y}px`, '--drift-duration': `${seconds}s`,
      '--drift-delay': `${delay}s`, '--drift-scale': scale, '--drift-opacity': opacity
    })) element.style.setProperty(name, value);
  }
  const ambientRegions = $$('.hero-art, .hero-award, .transition-art, .footer-art');
  ambientRegions.forEach(element => element.classList.add('ambient-region'));
  // 只增强原本已经使用渐变文字的元素。
  const keywords = $$('.hero-layout h1 span, .system [data-node-id="412:5764"] span, .pricing [data-node-id="425:6149"] span')
    .filter(element => {
      const style = getComputedStyle(element);
      return style.backgroundImage !== 'none' && (style.backgroundClip === 'text' || style.webkitBackgroundClip === 'text');
    });
  keywords.forEach(element => element.classList.add('motion-keyword'));
  if ('IntersectionObserver' in window) {
    const visibility = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.target.classList.toggle('motion-in-view', entry.isIntersecting));
    }, { threshold: 0 });
    [...ambientRegions, ...keywords].forEach(element => visibility.observe(element));
  } else [...ambientRegions, ...keywords].forEach(element => element.classList.add('motion-in-view'));

  // 指针坐标只在真实鼠标输入时更新；不启用全页渲染循环。
  const goal = node('343:4737');
  goal?.classList.add('motion-goal');
  // 参考逐字显现和块状光标，只动画空白提示，真实输入始终交给 textarea。
  const goalInput = $('#goal-input');
  if (goal && goalInput) {
    const hint = document.createElement('span');
    hint.className = 'goal-typing-hint';
    hint.setAttribute('aria-hidden', 'true');
    hint.hidden = true;
    const hintText = document.createElement('span');
    const caret = document.createElement('span');
    caret.className = 'goal-typing-caret';
    hint.append(hintText, caret);
    goalInput.parentElement.append(hint);
    const features = ['察商机', '看数据', '跟订单', '收账款', '记发票'];
    let letters = [], nextFeatureIndex = 0;
    let hintTimer = 0, hintVisible = false, hintActive = false, letterIndex = 0;
    const canTypeHint = () => canMove() && hintVisible && goal.dataset.promptBusy !== 'true' && document.activeElement !== goalInput && !goalInput.value;
    function stopHint() {
      clearTimeout(hintTimer);
      hintTimer = 0;
      hintActive = false;
      hint.hidden = true;
      goal.classList.remove('hint-active');
    }
    function typeNextLetter() {
      if (!canTypeHint()) { stopHint(); return; }
      hintText.textContent = letters.slice(0, ++letterIndex).join('');
      // 窄屏提示超出一行时跟随光标横移，保持当前输入位置可见。
      hint.scrollLeft = Math.max(0, hint.scrollWidth - hint.clientWidth);
      if (letterIndex < letters.length) hintTimer = setTimeout(typeNextLetter, 90);
      else {
        hint.classList.add('is-complete');
        document.dispatchEvent(new Event('order:hint-complete'));
        hintTimer = setTimeout(beginHintCycle, 3400);
      }
    }
    function beginHintCycle() {
      if (!canTypeHint()) { stopHint(); return; }
      // 每轮取两个功能，按顺序轮换；只改提示，不触碰用户已输入的内容。
      const pair = [features[nextFeatureIndex], features[(nextFeatureIndex + 1) % features.length]];
      nextFeatureIndex = (nextFeatureIndex + 2) % features.length;
      goalInput.placeholder = '使用 小通' + pair.join('、');
      letters = Array.from(goalInput.placeholder);
      hintActive = true;
      letterIndex = 0;
      hintText.textContent = '';
      hint.scrollLeft = 0;
      hint.classList.remove('is-complete');
      hint.hidden = false;
      goal.classList.add('hint-active');
      hintTimer = setTimeout(typeNextLetter, 450);
    }
    function syncHint() {
      if (!canTypeHint()) stopHint();
      else if (!hintActive) beginHintCycle();
    }
    ['focus', 'blur', 'input', 'change', 'compositionstart'].forEach(event => goalInput.addEventListener(event, syncHint));
    document.addEventListener('visibilitychange', syncHint);
    document.addEventListener('order:hint-sync', syncHint);
    reduced.addEventListener('change', syncHint);
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        hintVisible = entries[0].isIntersecting;
        syncHint();
      });
      observer.observe(goal);
    } else { hintVisible = true; syncHint(); }
  }
  const cards = ['412:5645', '425:6185', '412:5774'].map(node).filter(Boolean);
  cards.forEach(element => element.classList.add('motion-spotlight'));
  for (const element of [goal, ...cards].filter(Boolean)) {
    let frame = 0, point = null;
    element.addEventListener('pointermove', event => {
      if (!fine.matches || event.pointerType !== 'mouse' || reduced.matches) return;
      point = { x: event.clientX, y: event.clientY };
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const rect = element.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        element.style.setProperty('--pointer-x', `${(point.x - rect.left) / rect.width * 100}%`);
        element.style.setProperty('--pointer-y', `${(point.y - rect.top) / rect.height * 100}%`);
      });
    }, { passive: true });
  }
  $$('button[data-action]').filter(button => ['register','login','contact','upgrade','api'].includes(button.dataset.action))
    .forEach(button => {
      button.classList.add('motion-cta');
      if (getComputedStyle(button).position === 'static') button.style.position = 'relative';
      $$('p,span', button).filter(element => element.textContent.trim() === '↗')
        .forEach(element => element.classList.add('motion-cta-arrow'));
    });

  // 统计数字只在首次进入视口时计数，预留最终宽度，辅助技术读取最终值。
  const counters = $$('.trust .f10').map(element => {
    const value = Number(element.textContent.trim());
    element.classList.add('motion-count');
    element.style.minWidth = `${element.offsetWidth / parseFloat(getComputedStyle(element).fontSize)}em`;
    const label = element.parentElement.textContent.trim();
    element.parentElement.setAttribute('aria-label', label);
    element.setAttribute('aria-hidden', 'true');
    if (!reduced.matches && 'IntersectionObserver' in window) element.textContent = '0';
    return { element, value, frame: 0, started: false, inView: false };
  });
  function finishCounter(counter) {
    cancelAnimationFrame(counter.frame); counter.frame = 0;
    counter.element.textContent = counter.value;
  }
  function countOnce(counter) {
    if (counter.started || !counter.inView || document.hidden) return;
    counter.started = true;
    counterObserver?.unobserve(counter.element);
    if (!canMove()) return finishCounter(counter);
    const start = performance.now();
    function step(now) {
      const duration = counter.value >= 10000 ? 1200 : 900;
      const progress = Math.min(1, (now - start) / duration);
      counter.element.textContent = Math.round(counter.value * (1 - Math.pow(1 - progress, 3)));
      if (progress < 1 && canMove()) counter.frame = requestAnimationFrame(step);
      else finishCounter(counter);
    }
    counter.frame = requestAnimationFrame(step);
  }
  let counterObserver = null;
  if ('IntersectionObserver' in window) {
    counterObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      const counter = counters.find(item => item.element === entry.target);
      // isIntersecting 在仅露出一小部分时也可能为 true，须同时检查可见比例。
      counter.inView = entry.isIntersecting && entry.intersectionRatio >= .98;
      countOnce(counter);
    }), { threshold: .98, rootMargin: '0px 0px -64px 0px' });
    counters.forEach(counter => counterObserver.observe(counter.element));
  }
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) counters.filter(counter => !counter.started).forEach(countOnce);
  });

  const nav = $('.site-header > div');
  const navLinks = $$('.site-header a[href="#advantages"], .site-header a[href="#scenarios"], .site-header a[href="#pricing"]');
  const navLine = document.createElement('span');
  navLine.className = 'nav-motion-line'; navLine.setAttribute('aria-hidden', 'true');
  nav?.append(navLine);
  let currentNav = null, hoveringNav = null, navFrame = 0;
  function placeNav() {
    const link = hoveringNav || currentNav;
    if (!link || mobile.matches) {
      navLine.style.opacity = '0';
      // 收起时清空旧坐标，避免宽屏切换至窄屏后不可见下划线撑出横向滚动。
      navLine.style.width = '0px';
      navLine.style.transform = 'translate(0,0)';
      return;
    }
    const rect = link.getBoundingClientRect(), box = nav.getBoundingClientRect();
    navLine.style.width = `${rect.width}px`;
    navLine.style.transform = `translate(${rect.left - box.left}px, ${rect.bottom - box.top + 7}px)`;
    navLine.style.opacity = '1';
  }
  function updateNav() {
    navFrame = 0;
    currentNav = null;
    for (const link of navLinks) {
      if ($(link.getAttribute('href'))?.getBoundingClientRect().top < innerHeight * .35) currentNav = link;
    }
    navLinks.forEach(link => {
      if (link === currentNav) link.setAttribute('aria-current','location');
      else link.removeAttribute('aria-current');
    });
    placeNav();
  }
  navLinks.forEach(link => {
    link.addEventListener('pointerenter', () => { if (fine.matches) { hoveringNav = link; placeNav(); } });
    link.addEventListener('pointerleave', () => { hoveringNav = null; placeNav(); });
    link.addEventListener('focus', () => { hoveringNav = link; placeNav(); });
    link.addEventListener('blur', () => { hoveringNav = null; placeNav(); });
  });
  addEventListener('scroll', () => { if (!navFrame) navFrame = requestAnimationFrame(updateNav); }, { passive: true });

  const tabs = $('[role="tablist"][aria-label="AI 经营场景"]');
  tabs?.classList.add('scene-motion-list');
  // 场景按钮只保留原有渐变选中态，撤下侧边移动竖线。
  const layoutObserver = new ResizeObserver(placeNav);
  layoutObserver.observe(nav);
  addEventListener('resize', updateNav, { passive: true });
  document.fonts.ready.then(updateNav);
  updateNav();

  // 场景切换采用同一批已有节点，快速连点只提交最后一次选择。
  const panel = $('#demo-panel');
  const sceneParts = ['I404:4760;379:2120','I404:4760;379:2128','I404:4760;379:2134'].map(node).filter(Boolean);
  let sceneVersion = 0, sceneTimer = 0, pendingScene = null, sceneAnimations = [];
  function settleScene() {
    clearTimeout(sceneTimer);
    sceneAnimations.forEach(animation => animation.cancel()); sceneAnimations = [];
    if (pendingScene) { const render = pendingScene; pendingScene = null; render(); }
    panel.removeAttribute('aria-busy');
  }
  function changeScene(render) {
    sceneVersion++;
    const version = sceneVersion;
    clearTimeout(sceneTimer);
    sceneAnimations.forEach(animation => animation.cancel()); sceneAnimations = [];
    pendingScene = render;
    panel.classList.remove('panel-changing');
    if (!canMove()) { settleScene(); return; }
    panel.setAttribute('aria-busy','true');
    sceneAnimations = sceneParts.map(element => play(element, [{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(-4px)'}], {duration:80,fill:'forwards'})).filter(Boolean);
    sceneTimer = setTimeout(() => {
      if (version !== sceneVersion) return;
      sceneAnimations.forEach(animation => animation.cancel());
      const update = pendingScene; pendingScene = null; update?.();
      panel.removeAttribute('aria-busy');
      sceneAnimations = sceneParts.map(element => play(element,[{opacity:0,transform:'translateY(7px)'},{opacity:1,transform:'translateY(0)'}],{duration:180})).filter(Boolean);
    }, 80);
  }

  const accordionAnimations = new WeakMap();
  function setAccordion(button, active) {
    const item = button.closest('.accordion-item'), copy = document.getElementById(button.getAttribute('aria-controls'));
    if (button.getAttribute('aria-expanded') === String(active)) return;
    const before = item.getBoundingClientRect().height;
    accordionAnimations.get(item)?.cancel();
    item.classList.remove('is-transitioning');
    button.setAttribute('aria-expanded',String(active));
    item.classList.toggle('is-open',active);
    const symbol = $('.accordion-symbol',button);
    symbol.textContent = active ? '−' : '+'; symbol.setAttribute('aria-hidden','true');
    copy.hidden = !active;
    if (active) play(copy,[{opacity:0,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'}],{duration:220});
    const after = item.getBoundingClientRect().height;
    if (mobile.matches && canMove() && Math.abs(before-after)>1) {
      item.classList.add('is-transitioning');
      const animation = play(item,[{height:`${before}px`},{height:`${after}px`}],{duration:240});
      accordionAnimations.set(item,animation);
      animation?.finished.then(() => {
        item.classList.remove('is-transitioning');
        document.dispatchEvent(new Event('order:layout'));
      }, () => {});
    } else document.dispatchEvent(new Event('order:layout'));
  }

  const dialog = $('#action-dialog');
  let dialogAnimation = null, dialogClosing = false;
  function dialogOpened() {
    dialogAnimation?.cancel(); dialogClosing = false;
    dialog.classList.remove('motion-dialog-closing');
    dialog.classList.add('motion-dialog-open');
    dialogAnimation = play(dialog,[{opacity:0,transform:'translateY(10px) scale(.98)'},{opacity:1,transform:'translateY(0) scale(1)'}],{duration:200});
  }
  function closeDialog() {
    if (!dialog.open || dialogClosing) return;
    dialogAnimation?.cancel();
    if (!canMove()) { dialog.close(); return; }
    dialogClosing = true;
    dialog.classList.remove('motion-dialog-open'); dialog.classList.add('motion-dialog-closing');
    dialogAnimation = play(dialog,[{opacity:1,transform:'translateY(0) scale(1)'},{opacity:0,transform:'translateY(6px) scale(.985)'}],{duration:160});
    dialogAnimation.finished.then(() => {
      if (dialogClosing) dialog.close();
      dialogClosing = false; dialog.classList.remove('motion-dialog-closing');
    }, () => {});
  }
  dialog.addEventListener('close', () => { dialogClosing = false; dialog.classList.remove('motion-dialog-open','motion-dialog-closing'); });
  function syncMotionPreference() {
    document.documentElement.classList.toggle('motion-suspended', document.hidden);
    if (!canMove()) {
      settleScene();
      counters.filter(counter => counter.started).forEach(finishCounter);
      [...transients].forEach(animation => { try { animation.finish(); } catch { animation.cancel(); } });
    }
  }
  reduced.addEventListener('change',syncMotionPreference);
  document.addEventListener('visibilitychange',syncMotionPreference);
  syncMotionPreference();
  window.orderMotion = { changeScene, setAccordion, dialogOpened, closeDialog };
})();
