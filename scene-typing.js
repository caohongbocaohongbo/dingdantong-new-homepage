(() => {
  'use strict';
  const node = id => document.querySelector(`[data-node-id="${id}"]`);
  const response = node('I404:4760;379:2134');
  const inputHint = node('I404:4760;379:2137');
  if (!response || !inputHint) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const initialLines = [...response.querySelectorAll('p')].map(p => p.textContent.replace(/\u200b/g, ''));
  const hintLabel = inputHint.textContent;
  const hintLetters = Array.from(hintLabel);
  let responseVisible = false, hintVisible = false;
  let responseTimer = 0, hintTimer = 0, responsePending = false;
  let rows = [], rowIndex = 0, letterIndex = 0, responseComplete = false;
  let hintIndex = 0, hintPhase = 'type';

  // 完整文字供辅助阅读使用；动画层保持原稿字体、颜色及段落占位。
  function readable(text) {
    const span = document.createElement('span');
    span.className = 'scene-typing-readable';
    span.textContent = text;
    return span;
  }
  const hintText = document.createElement('span');
  hintText.className = 'scene-input-text';
  hintText.setAttribute('aria-hidden', 'true');
  const hintCaret = document.createElement('span');
  hintCaret.className = 'scene-input-caret';
  hintCaret.setAttribute('aria-hidden', 'true');
  inputHint.classList.add('scene-input-hint');
  inputHint.replaceChildren(readable(hintLabel), hintText, hintCaret);
  response.classList.add('scene-response');

  function stopResponse() {
    clearTimeout(responseTimer);
    responseTimer = 0;
    rows.forEach(row => row.output.classList.remove('is-typing'));
  }
  function finishResponse() {
    stopResponse();
    rows.forEach(row => { row.output.textContent = row.text || '\u200b'; });
    responseComplete = true;
    response.dataset.typingState = 'complete';
  }
  function canStream() {
    return responseVisible && !document.hidden && !reduced.matches && !responsePending;
  }
  function streamNext() {
    responseTimer = 0;
    if (!canStream() || responseComplete) return;
    const row = rows[rowIndex];
    if (!row) { finishResponse(); return; }
    row.output.classList.add('is-typing');
    row.output.textContent = row.letters.slice(0, ++letterIndex).join('') || '\u200b';
    if (letterIndex >= row.letters.length) {
      row.output.classList.remove('is-typing');
      rowIndex++;
      letterIndex = 0;
      if (rowIndex >= rows.length) { finishResponse(); return; }
      responseTimer = setTimeout(streamNext, row.text ? 70 : 100);
    } else responseTimer = setTimeout(streamNext, 18);
  }
  function syncResponse() {
    if (responsePending) return;
    if (reduced.matches) { finishResponse(); return; }
    if (!canStream()) {
      stopResponse();
      if (!responseComplete) response.dataset.typingState = 'paused';
      return;
    }
    if (!responseComplete && !responseTimer) {
      response.dataset.typingState = 'typing';
      responseTimer = setTimeout(streamNext, 260);
    }
  }
  function setResponse(lines) {
    stopResponse();
    responsePending = false;
    responseComplete = false;
    rowIndex = 0;
    letterIndex = 0;
    response.dataset.typingState = 'ready';
    const paragraphs = lines.map((text, index) => {
      const p = document.createElement('p');
      p.className = 'scene-response-line ' + (index === lines.length - 1 ? 'f211' : 'f210');
      p.setAttribute('aria-hidden', 'true');
      const reserve = document.createElement('span');
      reserve.className = 'scene-response-reserve';
      reserve.textContent = text || '\u200b';
      const output = document.createElement('span');
      output.className = 'scene-response-output';
      p.append(reserve, output);
      return { p, output, text, letters: Array.from(text) };
    });
    rows = paragraphs;
    response.replaceChildren(readable(lines.join('\n')), ...paragraphs.map(row => row.p));
    syncResponse();
  }

  function stopHint() {
    clearTimeout(hintTimer);
    hintTimer = 0;
    inputHint.classList.remove('is-playing');
  }
  function canTypeHint() {
    return hintVisible && !document.hidden && !reduced.matches;
  }
  function typeHint() {
    hintTimer = 0;
    if (!canTypeHint()) return;
    let delay = 90;
    if (hintPhase === 'type') {
      hintCaret.classList.remove('is-blinking');
      hintText.textContent = hintLetters.slice(0, ++hintIndex).join('');
      if (hintIndex >= hintLetters.length) {
        hintPhase = 'hold';
        hintCaret.classList.add('is-blinking');
        delay = 2000;
      }
    } else if (hintPhase === 'hold') {
      hintPhase = 'erase';
      hintCaret.classList.remove('is-blinking');
      delay = 55;
    } else {
      hintText.textContent = hintLetters.slice(0, --hintIndex).join('');
      delay = 55;
      if (hintIndex <= 0) { hintPhase = 'type'; delay = 750; }
    }
    hintTimer = setTimeout(typeHint, delay);
  }
  function syncHint() {
    if (reduced.matches) {
      stopHint();
      hintText.textContent = hintLabel;
      hintIndex = 0;
      hintPhase = 'type';
      hintCaret.classList.remove('is-blinking');
      return;
    }
    if (!canTypeHint()) { stopHint(); return; }
    if (!hintTimer) {
      inputHint.classList.add('is-playing');
      hintTimer = setTimeout(typeHint, 360);
    }
  }
  window.orderSceneTyping = {
    setResponse,
    // 新场景即将提交时，立即停止旧回复，快速切换不会串入旧文字。
    pauseResponse() {
      responsePending = true;
      stopResponse();
    }
  };
  setResponse(initialLines);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      const entry = entries[0];
      responseVisible = entry.isIntersecting && entry.intersectionRatio >= .6;
      syncResponse();
    }, { threshold: [0, .6] }).observe(response);
    new IntersectionObserver(entries => {
      const entry = entries[0];
      hintVisible = entry.isIntersecting && entry.intersectionRatio >= .98;
      syncHint();
    }, { threshold: [0, .98] }).observe(inputHint);
  } else {
    responseVisible = hintVisible = true;
    syncResponse();
    syncHint();
  }
  function sync() { syncResponse(); syncHint(); }
  reduced.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  syncHint();
})();
