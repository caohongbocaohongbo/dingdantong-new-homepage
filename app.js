(() => {
  'use strict';
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const node = id => $(`[data-node-id="${id}"]`);
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const dialog = $('#action-dialog');
  const goalInput = $('#goal-input');
  const toast = $('.toast');
  let toastTimer;
  function notify(message) {
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 3200);
  }
  function showDialog(title, content) {
    $('#dialog-title').textContent = title;
    $('#dialog-content').replaceChildren();
    if (typeof content === 'string') $('#dialog-content').innerHTML = content;
    else $('#dialog-content').append(content);
    dialog.showModal();
    window.orderMotion?.dialogOpened();
  }
  function closeDialog() {
    if (window.orderMotion) window.orderMotion.closeDialog();
    else dialog.close();
  }
  const contactContent = '<p>了解产品、开通账户或咨询专业版，请联系订单通。</p><a class="contact-card" href="tel:18906400505"><span>售前咨询 · 刘经理</span><strong>189-0640-0505</strong></a><a class="contact-card" href="tel:4009669600"><span>7×24 服务热线</span><strong>400-966-9600</strong></a>';
  const scenes = [
    { title: '订单分析专家 · 工作演示', prompt: '分析本月各渠道的订单、间夜和收入，与上月对比。', lines: ['可以。我会先确认分析范围和所需数据，再按专业方法整理结果。', '', '我可以为你提供', '• 各渠道的订单、间夜和收入对比', '• 哪些数据变了，可能是什么原因', '• 建议先处理的几件事', '', '开始前，请提供', '告诉我想看哪段时间、哪些渠道；有订单明细也可以上传。', '', '整理结果、原因和下一步建议，供你确认。'] },
    { title: '营销获客分析 · 工作演示', prompt: '帮我分析酒店渠道页面和近期评价，找到获客改进点。', lines: ['我会围绕曝光、转化与口碑，整理可行动的改进建议。', '', '协同分析步骤', '• 查看渠道页面的房型信息、图片与卖点', '• 归纳近期评价中反复出现的问题', '• 对照客群需求，梳理优先改进项', '', '开始前，请提供', '酒店名称、要分析的渠道，以及需要参考的时间范围。', '', '输出页面与口碑改进清单，供你确认。'] },
    { title: '营销内容生成 · 工作演示', prompt: '围绕周末亲子入住，组织一组酒店营销文案。', lines: ['我会先了解酒店特色与目标客群，再组织素材与发布节奏。', '', '内容准备步骤', '• 梳理房型、设施与周边体验亮点', '• 按渠道整理标题、短文案和卖点', '• 给出素材需求与建议发布节奏', '', '开始前，请提供', '酒店介绍、活动信息与可用素材。', '', '生成内容草稿，由你审核后再发布。'] },
    { title: 'AI 协同操作 PMS · 工作演示', prompt: '查找本周待处理订单，整理需要我确认的事项。', lines: ['我会先确认任务范围，在获得授权后调用相应工具。', '', '受控执行步骤', '• 查询相关订单与房态信息', '• 汇总待处理事项及拟执行操作', '• 等待确认后，再执行授权范围内的操作', '', '执行之前', '涉及价格、房态及订单修改时，会先展示变更内容。', '', '此处为交互演示，不会修改真实酒店数据。'] },
    { title: '价格体系分析 · 工作演示', prompt: '梳理各渠道的价格体系，找出需要关注的价差。', lines: ['我会按房型、日期与售卖条件，建立可比的价格分析框架。', '', '分析步骤', '• 对齐渠道、房型与取消政策', '• 汇总可比价格，标记异常价差', '• 整理调价前需要核实的条件', '', '开始前，请提供', '分析日期、目标房型和渠道价格资料。', '', '输出价格差异清单与建议，供你确认。'] }
  ];
  let currentSceneIndex = 0;
  function selectScene(index, customPrompt) {
    window.orderSceneTyping?.pauseResponse();
    currentSceneIndex = index;
    const scene = scenes[index];
    $$('[data-scenario]').forEach((button, i) => {
      button.setAttribute('aria-selected', String(i === index));
      button.tabIndex = i === index ? 0 : -1;
    });
    $('#demo-panel').setAttribute('aria-labelledby', 'scenario-' + index);
    const render = () => {
      node('I404:4760;379:2120').textContent = scene.title;
      node('I404:4760;379:2128').textContent = customPrompt || scene.prompt;
      const response = node('I404:4760;379:2134');
      if (window.orderSceneTyping) window.orderSceneTyping.setResponse(scene.lines);
      else response.replaceChildren(...scene.lines.map(line => {
        const p = document.createElement('p');
        p.style.lineHeight = '20.439px';
        p.textContent = line || '\u200b';
        return p;
      }));
    };
    if (window.orderMotion) window.orderMotion.changeScene(render);
    else render();
  }
  $$('[data-scenario]').forEach((button, i) => {
    button.tabIndex = i === 0 ? 0 : -1;
    button.addEventListener('click', () => selectScene(i));
    button.addEventListener('keydown', event => {
      let next = i;
      if (['ArrowRight', 'ArrowDown'].includes(event.key)) next = (i + 1) % scenes.length;
      else if (['ArrowLeft', 'ArrowUp'].includes(event.key)) next = (i + scenes.length - 1) % scenes.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = scenes.length - 1;
      else return;
      event.preventDefault();
      selectScene(next);
      $('#scenario-' + next).focus();
    });
  });
  $$('.accordion-trigger').forEach(button => button.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') !== 'true';
    $$('.accordion-trigger').forEach(other => {
      const active = other === button && open;
      if (window.orderMotion) { window.orderMotion.setAccordion(other, active); return; }
      other.setAttribute('aria-expanded', String(active));
      other.closest('.accordion-item').classList.toggle('is-open', active);
      $('.accordion-symbol', other).textContent = active ? '−' : '+';
      $('#' + other.getAttribute('aria-controls')).hidden = !active;
    });
  }));
  function sendGoal() {
    const value = goalInput.value.trim();
    if (!value) { goalInput.focus(); notify('写下一件你想交给小通的事'); return; }
    const index = /价格|价差|调价/.test(value) ? 4 : /文案|营销内容|素材/.test(value) ? 2 : /获客|口碑|评价/.test(value) ? 1 : /PMS|待处理|房态/i.test(value) ? 3 : 0;
    selectScene(index, value);
    $('#scenarios').scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
    notify('已选择对应的产品演示场景');
  }
  goalInput.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) { event.preventDefault(); sendGoal(); }
  });
  document.addEventListener('click', event => {
    const target = event.target.closest('[data-action]');
    if (!target) return;
    const action = target.dataset.action;
    if (action === 'send') sendGoal();
    else if (action === 'attachment') $('#file-input').click();
    else if (action === 'prompts') {
      window.orderQuickPrompts?.toggle();
    } else if (action === 'demo-detail') {
      const content = document.createElement('div');
      [scenes[currentSceneIndex].prompt, '', ...scenes[currentSceneIndex].lines].forEach(line => { const p = document.createElement('p'); p.textContent = line || '\u200b'; content.append(p); });
      showDialog(scenes[currentSceneIndex].title, content);
    } else if (action === 'contact') showDialog('联系订单通', contactContent);
    else if (action === 'upgrade') showDialog('升级专业版', '<p>专业版 · ¥ 1999 / 年 / 账户</p>' + contactContent);
    else if (action === 'api') showDialog('API 文档', '<p>如需 API 文档、接口权限与对接支持，请联系订单通服务团队。</p>' + contactContent);
    else if (action === 'login') window.orderLogin?.open(target);
    else showDialog('免费注册', '<p>当前页面为产品交互演示。如需登录或开通真实账户，请联系订单通。</p>' + contactContent);
  });
  $('#file-input').addEventListener('change', event => {
    const file = event.target.files[0];
    if (file) notify('已选择 ' + file.name + '（仅本地演示，不会上传）');
  });
  $('.dialog-close').addEventListener('click', closeDialog);
  dialog.addEventListener('cancel', event => { event.preventDefault(); closeDialog(); });
  dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) closeDialog(); } });
  $('.menu-toggle').addEventListener('click', event => {
    const open = $('.site-header').classList.toggle('menu-open');
    event.currentTarget.setAttribute('aria-expanded', String(open));
    event.currentTarget.setAttribute('aria-label', open ? '关闭导航' : '打开导航');
  });
  $$('.site-header a').forEach(a => a.addEventListener('click', () => { $('.site-header').classList.remove('menu-open'); $('.menu-toggle').setAttribute('aria-expanded', 'false'); }));
  // 布局随容器变化，不通过持续渲染循环测量页面。
  function resize() {
    const width = document.documentElement.clientWidth;
    document.documentElement.style.setProperty('--content-scale', width > 760 ? Math.min(1, (width - 64) / 1200) : 1);
    document.documentElement.style.setProperty('--demo-scale', Math.max(.2, (width - 40) / 933.373));
    document.documentElement.style.setProperty('--wide-art-scale', Math.max(1, width / 1920));
    measureMotion();
  }
  const reveals = $$('.reveal');
  if (!reducedMotion.matches && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('motion-ready');
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), { threshold: .06, rootMargin: '60px' });
    reveals.forEach(el => observer.observe(el));
  }
  // 鼠标输入优先；眨眼独立运行，静止后轮换原 SVG、思考 / 加载与笑眼。
  const toy = $('#fc-toy'), eyes = $('#toy-eyes');
  const faceLayers = { source: $('.toy-source', toy), thinking: $('.toy-thinking', toy), loading: $('.toy-loading', toy), smile: $('.toy-smile', toy) };
  const IDLE_DELAY = 1200, SOURCE_DURATION = 9400;
  let toyVisible = false, toyCenter = { x: 0, y: 0, width: 196 }, gaze = { x: 0, y: 0 }, targetGaze = { x: 0, y: 0 }, gazeFrame = 0;
  let idleTimer = 0, phaseTimer = 0, idleRound = 0, dragPointer = null;
  let artPositions = [], scrollFrame = 0;
  const parallaxArts = [$('.hero-art'), $('.wave-art'), $('.transition-art')];
  function measureMotion() {
    const r = toy.getBoundingClientRect();
    toyCenter = { x: r.left + r.width / 2, y: r.top + scrollY + r.height / 2, width: r.width || 196 };
    artPositions = parallaxArts.map(el => { const r = el.getBoundingClientRect(); return { el, top: r.top + scrollY, height: r.height }; });
  }
  function canAnimateToy() { return toyVisible && !document.hidden && !reducedMotion.matches; }
  function resetGaze() {
    cancelAnimationFrame(gazeFrame); gazeFrame = 0;
    gaze = { x: 0, y: 0 }; targetGaze = { x: 0, y: 0 };
    eyes.style.setProperty('--eye-x', '0px');
    eyes.style.setProperty('--eye-y', '0px');
    eyes.style.setProperty('--eye-r', '0deg');
  }
  function setExpression(state) {
    if (toy.dataset.toyState === state) return;
    toy.dataset.toyState = state;
    const layer = faceLayers[state];
    if (layer) layer.getAnimations({ subtree: true }).forEach(animation => { animation.currentTime = 0; });
  }
  function clearToyTimers() {
    clearTimeout(idleTimer); clearTimeout(phaseTimer);
    idleTimer = phaseTimer = 0;
  }
  function showSmile() {
    if (!canAnimateToy()) return;
    setExpression('smile');
    phaseTimer = setTimeout(startIdle, 1800);
  }
  function showThinking() {
    if (!canAnimateToy()) return;
    const thinking = idleRound++ % 2 === 0;
    setExpression(thinking ? 'thinking' : 'loading');
    // 思考与加载统一为手风琴竖条，保留各自停留时长，随后切换笑眼。
    phaseTimer = setTimeout(showSmile, thinking ? 3150 : 1800);
  }
  function startIdle() {
    clearToyTimers();
    if (!canAnimateToy() || dragPointer !== null) return;
    resetGaze();
    toy.dataset.active = 'true';
    setExpression('blink');
    phaseTimer = setTimeout(() => {
      if (!canAnimateToy()) return;
      setExpression('source');
      phaseTimer = setTimeout(showThinking, SOURCE_DURATION);
    }, 2400);
  }
  function scheduleIdle() {
    clearTimeout(idleTimer);
    if (dragPointer === null && canAnimateToy()) idleTimer = setTimeout(startIdle, IDLE_DELAY);
  }
  function suspendToy() {
    clearToyTimers(); resetGaze();
    const pointer = dragPointer;
    dragPointer = null;
    toy.classList.remove('is-dragging');
    if (pointer !== null && toy.hasPointerCapture(pointer)) toy.releasePointerCapture(pointer);
    toy.dataset.active = 'false';
    setExpression('rest');
  }
  function animateGaze() {
    gazeFrame = 0;
    if (!canAnimateToy() || toy.dataset.toyState !== 'follow') return;
    gaze.x += (targetGaze.x - gaze.x) * .18;
    gaze.y += (targetGaze.y - gaze.y) * .18;
    eyes.style.setProperty('--eye-x', gaze.x.toFixed(3) + 'px');
    eyes.style.setProperty('--eye-y', gaze.y.toFixed(3) + 'px');
    eyes.style.setProperty('--eye-r', (gaze.x * .25).toFixed(3) + 'deg');
    if (Math.abs(targetGaze.x - gaze.x) + Math.abs(targetGaze.y - gaze.y) > .02) gazeFrame = requestAnimationFrame(animateGaze);
  }
  function setGaze(x, y) { targetGaze = { x, y }; if (!gazeFrame) gazeFrame = requestAnimationFrame(animateGaze); }
  function followPointer(event) {
    if (!canAnimateToy()) return;
    if (event.pointerId !== dragPointer && (event.pointerType !== 'mouse' || !finePointer.matches)) return;
    clearToyTimers();
    toy.dataset.active = 'true';
    setExpression('follow');
    const dx = event.clientX - toyCenter.x, dy = event.clientY + scrollY - toyCenter.y;
    const nx = dx / (toyCenter.width * .7), ny = dy / (toyCenter.width * .6);
    const factor = Math.max(1, Math.hypot(nx, ny));
    // 运动限制在椭圆内，最大位移 16 × 10.5px，外层面罩再做最终裁切。
    setGaze(nx / factor * 16, ny / factor * 10.5);
    scheduleIdle();
  }
  new IntersectionObserver(entries => {
    toyVisible = entries[0].isIntersecting;
    if (toyVisible) { measureMotion(); startIdle(); }
    else suspendToy();
  }, { threshold: .1 }).observe(toy);
  document.addEventListener('pointermove', followPointer, { passive: true });
  toy.addEventListener('pointerenter', event => { measureMotion(); followPointer(event); });
  toy.addEventListener('pointerdown', event => {
    if (event.button !== 0 || !canAnimateToy()) return;
    event.preventDefault();
    dragPointer = event.pointerId;
    toy.classList.add('is-dragging');
    toy.setPointerCapture(event.pointerId);
    measureMotion(); followPointer(event);
  });
  function finishDrag(event) {
    if (event.pointerId !== dragPointer) return;
    dragPointer = null;
    toy.classList.remove('is-dragging');
    if (toy.hasPointerCapture(event.pointerId)) toy.releasePointerCapture(event.pointerId);
    scheduleIdle();
  }
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => toy.addEventListener(type, finishDrag));
  document.documentElement.addEventListener('pointerleave', () => {
    if (toy.dataset.toyState === 'follow') setGaze(0, 0);
    scheduleIdle();
  });
  function renderParallax() {
    scrollFrame = 0;
    if (reducedMotion.matches || innerWidth < 761 || document.hidden) return;
    artPositions.forEach(({ el, top, height }, i) => {
      if (top + height < scrollY || top > scrollY + innerHeight) return;
      const offset = i === 0 ? -Math.min(14, scrollY * .025) : Math.max(-12, Math.min(12, (scrollY + innerHeight / 2 - top - height / 2) * .018));
      el.style.setProperty('--parallax-y', offset.toFixed(2) + 'px');
    });
  }
  addEventListener('scroll', () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(renderParallax); }, { passive: true });
  addEventListener('resize', resize, { passive: true });
  document.addEventListener('order:layout', measureMotion);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) suspendToy();
    else { measureMotion(); startIdle(); }
  });
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) {
      reveals.forEach(el => el.classList.add('is-visible'));
      parallaxArts.forEach(el => el.style.removeProperty('--parallax-y'));
      suspendToy();
    } else startIdle();
  });
  resize();
  document.fonts.ready.then(measureMotion);
})();
