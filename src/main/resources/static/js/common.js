/* ═══════════════════════════════
   common.js — 전역 공통 유틸
═══════════════════════════════ */

/* ── Toast ── */
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 2200);
}

/* ── Modal ── */
function openModal(id) {
  document.getElementById(id).classList.add('show');
  document.getElementById('overlay').classList.add('show');
}
function closeModal(id) {
  const target = id
    ? document.getElementById(id)
    : document.querySelector('.modal.show');
  if (target) target.classList.remove('show');
  document.getElementById('overlay').classList.remove('show');
}

/* ══════════════════════════════════
   페이지 전환 — iOS 슬라이드
══════════════════════════════════ */
const Router = (() => {
  const DURATION = 380; // ms (CSS transition 과 맞춤)

  /**
   * 앞으로 이동 (오른쪽에서 슬라이드인)
   * @param {string} url  - 이동할 페이지 URL (쿼리스트링 포함 가능)
   * @param {HTMLElement} behindEl - 뒤로 밀릴 현재 페이지 루트 엘리먼트
   */
  function push(url, behindEl) {
    // 1) iframe으로 다음 페이지 미리 로드
    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.className = 'page page-front';
    iframe.style.cssText = `
      position: fixed; inset: 0; width: 100%; height: 100dvh;
      border: none; z-index: 10;
      transform: translateX(100%);
      transition: transform 0.38s cubic-bezier(0.25,0.46,0.45,0.94);
      box-shadow: -8px 0 32px rgba(42,30,18,0.18);
      will-change: transform;
    `;
    document.body.appendChild(iframe);

    // 2) 현재 페이지 뒤로 밀기
    if (behindEl) {
      behindEl.style.transition = 'transform 0.38s cubic-bezier(0.25,0.46,0.45,0.94)';
      behindEl.style.willChange = 'transform';
      behindEl.style.transform = 'translateX(0)';
    }

    // 3) rAF 2번 후 트랜지션 시작 (브라우저 paint 보장)
    requestAnimationFrame(() => requestAnimationFrame(() => {
      iframe.style.transform = 'translateX(0)';
      if (behindEl) behindEl.style.transform = 'translateX(-30%)';
    }));

    // 히스토리 저장
    history.pushState({ url }, '', url);
  }

  /**
   * 뒤로 이동 (오른쪽으로 슬라이드아웃)
   * detail 페이지에서 뒤로가기 버튼 클릭 시 호출
   * window.parent.Router.pop() 으로 접근
   */
  function pop() {
    // detail 페이지가 iframe 안이면 부모에게 메시지
    if (window.self !== window.top) {
      window.parent.postMessage({ type: 'ROUTER_POP' }, '*');
      return;
    }
    _doPop();
  }

  function _doPop() {
    const iframe = document.querySelector('iframe.page-front, iframe[data-detail]');
    const behind = document.getElementById('app') || document.querySelector('.app');

    if (iframe) {
      iframe.style.transform = 'translateX(100%)';
      if (behind) behind.style.transform = 'translateX(0)';
      setTimeout(() => iframe.remove(), DURATION);
    }
    history.back();
  }

  // iframe에서 보낸 pop 메시지 수신
  window.addEventListener('message', (e) => {
    if (e.data?.type === 'ROUTER_POP') _doPop();
  });

  return { push, pop };
})();
