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

/* ════════════════════════════════════════
   common.js 에 아래 코드를 추가하세요
   (기존 showToast, Router 등 아래에 붙여넣기)
════════════════════════════════════════ */

/* ══════════════════════════════
   롱프레스 유틸리티
   · 500 ms 이상 누르면 onLongPress 콜백 실행
   · 8 px 이상 움직이면 스크롤로 판단해 취소
   · 사파리 이미지 콜아웃 / 텍스트 선택 / 우클릭 메뉴 모두 차단
   · 사용법:
       attachLongPress(el, {
         onLongPress: () => { ... },   // 필수
         onTap:       () => { ... },   // 선택 — 롱프레스 아닌 일반 탭
         ms: 500,                      // 선택 — 기본 500ms
       });
══════════════════════════════ */
function attachLongPress(el, { onLongPress, onTap, ms = 500 } = {}) {
  let timer        = null;
  let startX       = 0;
  let startY       = 0;
  let didLongPress = false;

  /* 터치 시작
     passive:false — setTimeout 콜백에서 preventDefault() 가 동작하려면 필수
     사파리는 passive:true 리스너에선 preventDefault()를 무시함           */
  el.addEventListener('touchstart', (e) => {
    didLongPress = false;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;

    timer = setTimeout(() => {
      didLongPress = true;

      /* 사파리 이미지 콜아웃(저장/복사 팝업) 차단 */
      e.preventDefault();

      onLongPress?.();
    }, ms);
  }, { passive: false });

  /* 스크롤 중이면 롱프레스 취소 */
  el.addEventListener('touchmove', (e) => {
    const dx = Math.abs(e.touches[0].clientX - startX);
    const dy = Math.abs(e.touches[0].clientY - startY);
    if (dx > 8 || dy > 8) {
      clearTimeout(timer);
      timer = null;
    }
  }, { passive: true });

  /* 터치 끝 */
  el.addEventListener('touchend', () => {
    clearTimeout(timer);
    timer = null;
    if (!didLongPress) onTap?.();
  });

  /* 터치 취소 (전화 수신 등) */
  el.addEventListener('touchcancel', () => {
    clearTimeout(timer);
    timer = null;
  });

  /* 데스크톱: 우클릭 → 롱프레스와 동일하게 처리 */
  el.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    onLongPress?.();
  });
}
