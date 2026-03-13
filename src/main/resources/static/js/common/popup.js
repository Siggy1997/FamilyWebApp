/* ═══════════════════════════════
   popup.js — 공통 팝업 컴포넌트

   사용법:
   showAlert('제목', '메시지')
   showAlert('제목')

   showConfirm('제목', '메시지').then(ok => { if (ok) { ... } })
   showConfirm('삭제할까요?', '복구할 수 없어요.', { danger: true, confirmText: '삭제' })
═══════════════════════════════ */

(() => {

  function createBackdrop() {
    const el = document.createElement('div');
    el.className = 'popup-backdrop';
    el.innerHTML = `<div class="popup-box"></div>`;
    document.documentElement.appendChild(el);
    el.addEventListener('click', (e) => {
      if (e.target === el) _dismiss(el, null);
    });
    el.querySelector('.popup-box').addEventListener('click', (e) => e.stopPropagation());
    return el;
  }

  function _open(backdrop) {
    requestAnimationFrame(() => backdrop.classList.add('visible'));
  }

  function _dismiss(backdrop, resolve, value) {
    backdrop.classList.remove('visible');
    setTimeout(() => {
      backdrop.remove();
      if (resolve) resolve(value);
    }, 240);
  }

  function renderContent(box, title, message) {
    box.innerHTML = `
      <div class="popup-body">
        <div class="popup-title">${title}</div>
        ${message ? `<div class="popup-message">${message}</div>` : ''}
      </div>
    `;
  }

  /* ── showAlert ── */
  window.showAlert = function (title, message) {
    return new Promise((resolve) => {
      const backdrop = createBackdrop();
      const box = backdrop.querySelector('.popup-box');

      renderContent(box, title, message);

      const actions = document.createElement('div');
      actions.className = 'popup-actions';
      actions.innerHTML = `<button class="popup-btn ok">확인</button>`;
      actions.querySelector('.ok').addEventListener('click', () => _dismiss(backdrop, resolve, true));
      box.appendChild(actions);

      _open(backdrop);
    });
  };

  /* ── showConfirm ── */
  window.showConfirm = function (title, message, { danger = false, cancelText = '취소', confirmText = '확인' } = {}) {
    return new Promise((resolve) => {
      const backdrop = createBackdrop();
      const box = backdrop.querySelector('.popup-box');

      renderContent(box, title, message);

      const btnClass = danger ? 'danger' : 'confirm';
      const actions = document.createElement('div');
      actions.className = 'popup-actions';
      actions.innerHTML = `
        <button class="popup-btn cancel">${cancelText}</button>
        <button class="popup-btn ${btnClass}">${confirmText}</button>
      `;
      actions.querySelector('.cancel').addEventListener('click', () => _dismiss(backdrop, resolve, false));
      actions.querySelector(`.${btnClass}`).addEventListener('click', () => _dismiss(backdrop, resolve, true));
      box.appendChild(actions);

      _open(backdrop);
    });
  };

})();