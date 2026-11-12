(() => {
  'use strict';
  if (window.orderLogin) return;
  const assets = 'assets/login/';
  const dialog = document.createElement('dialog');
  dialog.id = 'login-dialog';
  dialog.setAttribute('aria-label', '登录订单通');
  dialog.innerHTML = `
    <div class="login-card" data-login-node="440:10786">
      <button type="button" class="login-close login-sr-only">关闭登录框</button>
      <section class="login-promo" aria-label="iReve AI OS 全新上线" data-login-node="460:10975">
        <div class="login-poster">
          <img class="login-poster-image" src="${assets}4f03c.png" alt="小通展示酒店经营数据" data-login-node="463:11022">
          <p class="login-promo-title">iReve AI OS</p>
          <p class="login-promo-title login-promo-title-cn">全新<span>上线</span></p>
          <button type="button" class="login-experience">立即体验</button>
          <p class="login-promo-caption"><span>你说目标 ‧ AI执行</span></p>
          <span class="login-promo-symbol"><img src="${assets}751b3.svg" alt="" data-login-node="I463:11029;3135:15095"></span>
          <img class="login-promo-rule" src="${assets}bd9e6.svg" alt="" data-login-node="463:11037">
        </div>
      </section>
      <div class="login-body">
        <div class="login-form-slot">
          <form class="login-form" novalidate data-login-node="440:10794">
            <div class="login-tabs" role="tablist" aria-label="登录方式">
              <img class="login-tab-line" src="${assets}3c0a0.svg" alt="" data-login-node="440:10797">
              <button type="button" role="tab" id="login-mode-account" class="login-tab" data-login-mode="account" aria-selected="false" aria-controls="login-fields" tabindex="-1">账号登录</button>
              <button type="button" role="tab" id="login-mode-phone" class="login-tab" data-login-mode="phone" aria-selected="false" aria-controls="login-fields" tabindex="-1">手机登录</button>
              <button type="button" role="tab" id="login-mode-email" class="login-tab" data-login-mode="email" aria-selected="true" aria-controls="login-fields">邮箱登录</button>
            </div>
            <div id="login-fields" role="tabpanel" aria-labelledby="login-mode-email">
              <div class="login-field">
                <span class="login-sr-only" id="login-identity-label">邮箱</span>
                <img class="login-field-line" src="${assets}40adc.svg" alt="" data-login-node="440:10801">
                <img class="login-field-icon login-email-icon" src="${assets}3d5f4.svg" alt="" data-login-node="440:10810">
                <input id="login-identity" class="login-input" type="email" placeholder="邮箱" autocomplete="username" aria-labelledby="login-identity-label" aria-describedby="login-status" spellcheck="false" required>
                <img class="login-caret" src="${assets}8350e.svg" alt="" data-login-node="440:10803">
                <button type="button" class="login-clear" aria-label="清空邮箱"><img src="${assets}f3a69.svg" alt="" data-login-node="440:10804"></button>
              </div>
              <div class="login-field login-field-code">
                <span class="login-sr-only" id="login-code-label">验证码</span>
                <img class="login-field-line" src="${assets}61392.svg" alt="" data-login-node="440:10809">
                <img class="login-field-icon" src="${assets}9b1ed.svg" alt="" data-login-node="440:10815">
                <input id="login-code" class="login-input" type="text" placeholder="验证码" inputmode="numeric" autocomplete="one-time-code" aria-labelledby="login-code-label" aria-describedby="login-status" required>
                <button type="button" class="login-send-code">获取验证码</button>
              </div>
            </div>
            <p class="login-status" id="login-status" role="status" aria-live="polite"></p>
            <button type="submit" class="login-submit"><img src="${assets}91309.svg" alt="" data-login-node="440:10833"><span>登录</span></button>
            <button type="button" class="login-register">免费注册</button>
          </form>
        </div>
        <div class="login-divider" aria-hidden="true"><img src="${assets}f9e6e.svg" alt="" data-login-node="440:10788"></div>
        <section class="login-wechat" aria-label="微信扫码快捷登录" data-login-node="440:10963">
          <div class="login-brand">
            <div class="login-brand-logos">
              <img src="${assets}f6eee.svg" alt="订单通" data-login-node="440:10856">
              <span class="login-brand-ireve"><img src="${assets}0a95b.svg" alt="iReve" data-login-node="440:10866"></span>
            </div>
            <p>您的渠道管理工具</p>
          </div>
          <div class="login-qr">
            <img class="login-qr-border" src="${assets}36eaa.svg" alt="" data-login-node="440:10791">
            <img class="login-qr-image" src="${assets}e1745.png" alt="微信登录二维码" data-login-node="440:10792">
            <p>微信扫码快捷登录</p>
          </div>
        </section>
      </div>
    </div>`;
  document.body.append(dialog);
  const $ = selector => dialog.querySelector(selector);
  const identity = $('#login-identity');
  const code = $('#login-code');
  const status = $('#login-status');
  const tabs = [...dialog.querySelectorAll('[data-login-mode]')];
  const modes = {
    account: { label: '账号', type: 'text', inputmode: 'text', second: '密码', offset: 2.5 },
    phone: { label: '手机号', type: 'tel', inputmode: 'tel', second: '验证码', offset: 111.5 },
    email: { label: '邮箱', type: 'email', inputmode: 'email', second: '验证码', offset: 229 }
  };
  let mode = 'email', opener = null, previousOverflow = '', backdropPressed = false;
  function resize() {
    const width = document.documentElement.clientWidth;
    const narrow = width <= 760;
    const cardWidth = narrow ? Math.min(591, width - 32) : Math.min(1319.5, width - 40);
    const scale = Math.min(cardWidth / 1319.5, (window.innerHeight - 40) / 500);
    dialog.style.setProperty('--login-scale', narrow ? 1 : Math.max(.1, scale));
    dialog.style.setProperty('--login-poster-scale', narrow ? cardWidth / 591 : 1);
    dialog.style.setProperty('--login-form-scale', narrow ? Math.min(1, (cardWidth - 32) / 321) : 1);
  }
  function setMode(next) {
    mode = next;
    const config = modes[next];
    tabs.forEach(tab => {
      const selected = tab.dataset.loginMode === next;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    $('.login-tab-line').style.left = config.offset + 'px';
    $('#login-fields').setAttribute('aria-labelledby', 'login-mode-' + next);
    identity.type = config.type;
    identity.inputMode = config.inputmode;
    identity.placeholder = config.label;
    $('#login-identity-label').textContent = config.label;
    $('.login-clear').setAttribute('aria-label', '清空' + config.label);
    $('.login-email-icon').hidden = next !== 'email';
    code.type = next === 'account' ? 'password' : 'text';
    code.inputMode = next === 'account' ? 'text' : 'numeric';
    code.autocomplete = next === 'account' ? 'current-password' : 'one-time-code';
    code.placeholder = config.second;
    $('#login-code-label').textContent = config.second;
    $('.login-send-code').hidden = next === 'account';
    identity.value = ''; code.value = ''; status.textContent = '';
    identity.removeAttribute('aria-invalid');code.removeAttribute('aria-invalid');
  }
  function open(trigger) {
    if (dialog.open) return;
    opener = trigger || document.activeElement;
    previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    setMode('email'); resize();
    dialog.showModal();
    dialog.scrollTop = 0;
    // 保持原稿中的邮箱焦点状态，同时避免窄屏自动滚过插画。
    identity.focus({ preventScroll: true });
    dialog.scrollTop = 0;
  }
  function close() { if (dialog.open) dialog.close(); }
  function validateIdentity() {
    const value = identity.value.trim();
    let message = '';
    if (!value) message = '请输入' + modes[mode].label;
    else if (mode === 'email' && !identity.validity.valid) message = '请输入有效的邮箱地址';
    else if (mode === 'phone' && !/^\+?[\d\s-]{6,20}$/.test(value)) message = '请输入有效的手机号';
    if (message) {
      status.textContent = message; identity.setAttribute('aria-invalid', 'true'); identity.focus(); return false;
    }
    identity.removeAttribute('aria-invalid'); return true;
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => setMode(tab.dataset.loginMode));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault(); setMode(tabs[next].dataset.loginMode); tabs[next].focus();
    });
  });
  $('.login-clear').addEventListener('click', () => { identity.value = ''; identity.focus(); status.textContent = ''; });
  $('.login-experience').addEventListener('click', () => identity.focus());
  $('.login-close').addEventListener('click', close);
  $('.login-send-code').addEventListener('click', () => {
    if (validateIdentity()) status.textContent = '验证码服务暂未连接，请稍后再试。';
  });
  $('.login-form').addEventListener('submit', event => {
    event.preventDefault();
    if (!validateIdentity()) return;
    if (!code.value.trim()) {
      status.textContent = '请输入' + modes[mode].second; code.setAttribute('aria-invalid', 'true'); code.focus(); return;
    }
    code.removeAttribute('aria-invalid');
    status.textContent = '登录服务暂未连接，请稍后再试。';
  });
  $('.login-register').addEventListener('click', () => {
    close(); document.querySelector('[data-action="register"]')?.click();
  });
  [identity, code].forEach(input => input.addEventListener('input', () => {
    input.removeAttribute('aria-invalid'); status.textContent = '';
  }));
  const outside = event => {
    const r = dialog.getBoundingClientRect();
    return event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom;
  };
  dialog.addEventListener('pointerdown', event => { backdropPressed = event.target === dialog && outside(event); });
  dialog.addEventListener('click', event => { if (backdropPressed && event.target === dialog && outside(event)) close(); backdropPressed = false; });
  dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const focusable = [...dialog.querySelectorAll('button:not([disabled]), input:not([disabled])')]
      .filter(element => element.tabIndex >= 0 && element.getClientRects().length > 0);
    const first = focusable[0], last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault(); last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first?.focus();
    }
  });
  dialog.addEventListener('close', () => {
    document.documentElement.style.overflow = previousOverflow;
    identity.value = ''; code.value = ''; status.textContent = '';
    opener?.focus({ preventScroll: true });
  });
  window.addEventListener('resize', resize, { passive: true });
  window.orderLogin = { open, close };
})();
