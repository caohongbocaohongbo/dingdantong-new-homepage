(() => {
  'use strict';
  const goal = document.querySelector('.motion-goal');
  const input = document.querySelector('#goal-input');
  const trigger = goal?.querySelector('[data-action="prompts"]');
  if (!goal || !input || !trigger) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const labels = ['订单分析', '经营数据', '洞察商机', '今日房态情况'];
  const toolbar = trigger.parentElement;
  toolbar.classList.add('quick-prompts-toolbar');
  trigger.setAttribute('aria-label', '快捷指令');
  trigger.setAttribute('aria-haspopup', 'menu');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('aria-controls', 'quick-prompts-popover');

  const menu = document.createElement('div');
  menu.id = 'quick-prompts-popover';
  menu.className = 'quick-prompts-popover';
  menu.setAttribute('role', 'menu');
  menu.setAttribute('aria-label', '快捷指令');
  menu.hidden = true;
  const options = labels.map(label => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'quick-prompt-option';
    button.setAttribute('role', 'menuitem');
    button.textContent = label;
    button.addEventListener('click', () => {
      autoConsumed = true;
      cancelFlow(true);
      trigger.focus({preventScroll:true});
      selectPrompt(label, 'manual');
    });
    menu.append(button);
    return button;
  });
  toolbar.append(menu);

  const line = document.createElement('span');
  line.className = 'quick-demo-line';
  line.setAttribute('aria-hidden', 'true');
  line.hidden = true;
  const measure = document.createElement('span');
  measure.className = 'quick-demo-measure';
  const caret = document.createElement('span');
  caret.className = 'quick-demo-caret';
  line.append(measure, caret);
  input.parentElement.append(line);

  let generation = 0, origin = null, ownedText = null;
  let autoConsumed = false, autoTimer = 0;
  const pending = new Map();
  function wait(ms, id) {
    return new Promise(resolve => {
      const timer = setTimeout(() => { pending.delete(timer); resolve(id === generation); }, ms);
      pending.set(timer, resolve);
    });
  }
  function hintSync(busy) {
    if (busy) goal.dataset.promptBusy = 'true';
    else delete goal.dataset.promptBusy;
    document.dispatchEvent(new Event('order:hint-sync'));
  }
  function hideMenu() {
    menu.hidden = true;
    trigger.classList.remove('quick-prompts-cue');
    options.forEach(option => option.classList.remove('is-demo-hover'));
    trigger.setAttribute('aria-expanded', 'false');
  }
  function showMenu(manual) {
    hintSync(true);
    menu.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    if (manual) options[0].focus({preventScroll:true});
  }
  function write(value) {
    ownedText = value;
    input.value = value;
    measure.textContent = value;
    input.dispatchEvent(new Event('input', {bubbles:true}));
  }
  // 只有演示自己写入且尚未被用户改动的文字，才允许由演示清除。
  function cancelFlow(clearOwned = false) {
    generation++;
    clearTimeout(autoTimer); autoTimer = 0;
    pending.forEach((resolve, timer) => {clearTimeout(timer); resolve(false);});
    pending.clear();
    if (clearOwned && ownedText !== null && input.value === ownedText) {
      input.value = '';
      input.dispatchEvent(new Event('input', {bubbles:true}));
    }
    origin = null; ownedText = null;
    hideMenu();
    line.hidden = true;
    caret.classList.remove('is-blinking');
    goal.classList.remove('quick-demo-active');
    hintSync(false);
  }
  async function selectPrompt(label, source, currentId) {
    const id = currentId ?? ++generation;
    origin = source;
    hideMenu();
    hintSync(true);
    if (reduced.matches) {
      input.value = label;
      input.dispatchEvent(new Event('input', {bubbles:true}));
      hintSync(false); origin = null;
      return;
    }
    goal.classList.add('quick-demo-active');
    line.hidden = false;
    write('');
    const letters = Array.from(label);
    for (let i = 1; i <= letters.length; i++) {
      if (!await wait(110, id)) return;
      write(letters.slice(0, i).join(''));
    }
    // 两次完整的光标明暗变化结束后再删除文字，不使用无限闪烁。
    caret.classList.add('is-blinking');
    if (!await wait(1200, id)) return;
    caret.classList.remove('is-blinking');
    for (let i = letters.length - 1; i >= 0; i--) {
      if (!await wait(85, id)) return;
      write(letters.slice(0, i).join(''));
    }
    if (!await wait(350, id)) return;
    ownedText = null; origin = null;
    line.hidden = true;
    goal.classList.remove('quick-demo-active');
    hintSync(false);
  }
  function canDemo() {
    const box = input.getBoundingClientRect();
    return !autoConsumed && !document.hidden && !reduced.matches && !input.value &&
      document.activeElement !== input && box.top >= 0 && box.bottom <= innerHeight - 24;
  }
  async function demonstrate() {
    if (!canDemo()) return;
    autoConsumed = true;
    const id = ++generation;
    origin = 'auto';
    // 两颗星星先闪动绿色，再自动展开浮层；该流程每次打开页面只播放一次。
    trigger.classList.add('quick-prompts-cue');
    if (!await wait(720, id)) return;
    showMenu(false);
    if (!await wait(550, id)) return;
    // 依次展示选项移入反馈，最终选择「订单分析」。
    for (const option of options) {
      options.forEach(item => item.classList.remove('is-demo-hover'));
      option.classList.add('is-demo-hover');
      if (!await wait(390, id)) return;
    }
    options.forEach(item => item.classList.remove('is-demo-hover'));
    options[0].classList.add('is-demo-hover');
    if (!await wait(480, id)) return;
    await selectPrompt(labels[0], 'auto', id);
  }
  document.addEventListener('order:hint-complete', () => {
    if (autoTimer || !canDemo()) return;
    autoTimer = setTimeout(() => {autoTimer = 0; demonstrate();}, 900);
  });

  function takeOver() {
    autoConsumed = true;
    cancelFlow(origin === 'auto');
  }
  input.addEventListener('focus', takeOver);
  input.addEventListener('beforeinput', () => {autoConsumed = true; cancelFlow(false);});
  input.addEventListener('compositionstart', () => {autoConsumed = true; cancelFlow(false);});
  input.addEventListener('input', event => {
    if (event.isTrusted) {autoConsumed = true; cancelFlow(false);}
  });
  document.addEventListener('pointerdown', event => {
    if (!menu.contains(event.target) && !trigger.contains(event.target) &&
        (autoTimer || origin || !menu.hidden)) takeOver();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && (origin || !menu.hidden || autoTimer)) {
      const hadMenu = !menu.hidden;
      takeOver();
      if (hadMenu) trigger.focus({preventScroll:true});
    }
  });
  menu.addEventListener('keydown', event => {
    const current = options.indexOf(document.activeElement);
    let next;
    if (event.key === 'ArrowDown') next = (current + 1) % options.length;
    else if (event.key === 'ArrowUp') next = (current + options.length - 1) % options.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = options.length - 1;
    if (next !== undefined) {event.preventDefault(); options[next].focus();}
    if (event.key === 'Tab') {takeOver(); trigger.focus({preventScroll:true});}
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelFlow(origin === 'auto');
  });
  reduced.addEventListener('change', () => {if (reduced.matches) cancelFlow(origin === 'auto');});
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting && (origin || !menu.hidden || autoTimer)) cancelFlow(origin === 'auto');
    }).observe(goal);
  }
  window.orderQuickPrompts = {
    toggle() {
      const wasOpen = !menu.hidden;
      autoConsumed = true;
      cancelFlow(origin === 'auto');
      if (!wasOpen) showMenu(true);
    }
  };
})();
