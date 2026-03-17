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

/* ── 뒤로가기 ── */
function goBack() { Router.pop(); }

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

  /* 터치 취소  */
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


function showLoading() {
  const style = document.createElement('style');
  style.textContent = `
    #app-loading {
      position: fixed; inset: 0; z-index: 99999;
      background: #f5efe6;
      display: flex; align-items: center; justify-content: center;
      transition: opacity 1.4s ease;
    }
    #app-loading.hide {
      opacity: 0; pointer-events: none;
    }
    .loading-logo {
      font-family: Georgia, serif;
      font-style: italic; font-size: 32px; font-weight: 700;
      color: #5c3d1e; letter-spacing: -0.01em;
      animation: loadingPulse 1.4s ease-in-out infinite;
    }
    @keyframes loadingPulse {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.4; }
    }
  `;
  document.head.appendChild(style);

  const el = document.createElement('div');
  el.id = 'app-loading';
  el.innerHTML = '<div class="loading-logo">memories.</div>';
  document.documentElement.appendChild(el);
}

function hideLoading() {
	const el = document.getElementById('app-loading');
  		if (!el) return;
  		el.classList.add('hide');
  		setTimeout(() => el.remove(), 1400);
}


/* ═══════════════════════════════════════════════════════
   pwa.js — SW 등록 + 푸시 구독
═══════════════════════════════════════════════════════ */

(function () {
  if (!('serviceWorker' in navigator)) return;

  /* ── SW 등록 ── */
  navigator.serviceWorker.register('/sw.js', { scope: '/' })
    .then(reg => {
      console.log('[PWA] SW registered');

      reg.addEventListener('updatefound', () => {
        const nw = reg.installing;
        nw?.addEventListener('statechange', () => {
          if (nw.state === 'installed' && navigator.serviceWorker.controller) {
            showUpdateBanner();
          }
        });
      });
    })
    .catch(err => console.warn('[PWA] SW failed:', err));

  /* ── 컨트롤러 교체 → 새로고침 ── */
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    location.reload();
  });

  /* ════════════════════════════════════════════════════
     푸시 구독
  ════════════════════════════════════════════════════ */

  // Base64 → Uint8Array 변환 (VAPID 공개키용)
  function urlBase64ToUint8Array(base64) {
    const pad  = '='.repeat((4 - base64.length % 4) % 4);
    const b64  = (base64 + pad).replace(/-/g, '+').replace(/_/g, '/');
    const raw  = atob(b64);
    return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
  }

  /* ── 구독 생성 + 서버 전송 ── */
  async function subscribe(vapidPublicKey) {
    const reg = await navigator.serviceWorker.ready;

    // 이미 구독 중이면 재사용
    let sub = await reg.pushManager.getSubscription();

    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });
    }

    // 서버에 구독 정보 저장 요청
    await fetch('/api/push/subscribe', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(sub),
    });

    console.log('[PWA] Push subscribed');
    return sub;
  }

  /* ── 구독 취소 ── */
  async function unsubscribe() {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (!sub) return;

    await sub.unsubscribe();

    await fetch('/api/push/unsubscribe', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ endpoint: sub.endpoint }),
    });

    console.log('[PWA] Push unsubscribed');
  }

  /* ════════════════════════════════════════════════════
     외부 호출용 PWA 객체
  ════════════════════════════════════════════════════ */
  window.PWA = {

    /* 알림 권한 요청 + 구독
       사용: PWA.requestPush('VAPID_PUBLIC_KEY')   */
    async requestPush(vapidPublicKey) {
      if (!('PushManager' in window)) {
        console.warn('[PWA] Push not supported');
        return false;
      }

      // 이미 거부된 경우
      if (Notification.permission === 'denied') {
        console.warn('[PWA] Push permission denied');
        return false;
      }

      // 권한 요청
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return false;

      await subscribe(vapidPublicKey);
      return true;
    },

    /* 구독 취소
       사용: PWA.unsubscribePush()   */
    unsubscribePush: unsubscribe,

    /* 현재 구독 상태 확인
       사용: const isOn = await PWA.isPushEnabled()   */
    async isPushEnabled() {
      if (!('PushManager' in window)) return false;
      if (Notification.permission !== 'granted') return false;
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      return !!sub;
    },

    /* 사진 프리캐시
       사용: PWA.precachePhotos(photos, 30)   */
    precachePhotos(photos, limit = 30) {
      if (!navigator.serviceWorker.controller) return;
      const urls = (photos ?? []).filter(p => p?.file_path).slice(0, limit).map(p => p.file_path);
      if (!urls.length) return;
      navigator.serviceWorker.controller.postMessage({ type: 'PRECACHE_PHOTOS', urls });
    },

    /* 강제 업데이트 */
    forceUpdate() {
      navigator.serviceWorker.ready.then(reg => {
        reg.waiting?.postMessage({ type: 'SKIP_WAITING' });
      });
    },
  };

  /* ── 업데이트 배너 ── */
  function showUpdateBanner() {
    if (document.getElementById('pwaBanner')) return;
    const banner = document.createElement('div');
    banner.id = 'pwaBanner';
    banner.innerHTML = `<span>새 버전이 있어요</span><button id="pwaBannerBtn">업데이트</button>`;
    Object.assign(banner.style, {
      position: 'fixed', bottom: '80px', left: '50%',
      transform: 'translateX(-50%)',
      background: '#1a1a1a', color: '#f0f0f0',
      border: '1px solid rgba(255,255,255,.12)', borderRadius: '24px',
      padding: '10px 18px', display: 'flex', alignItems: 'center',
      gap: '12px', fontSize: '14px', fontWeight: '500',
      boxShadow: '0 4px 24px rgba(0,0,0,.5)', zIndex: '9999',
    });
    Object.assign(banner.querySelector('#pwaBannerBtn').style, {
      background: '#fff', color: '#000', border: 'none',
      borderRadius: '14px', padding: '6px 14px',
      fontSize: '13px', fontWeight: '600', cursor: 'pointer',
    });
    banner.querySelector('#pwaBannerBtn').onclick = () => {
      PWA.forceUpdate();
      banner.remove();
    };
    document.body.appendChild(banner);
    setTimeout(() => banner.remove(), 8000);
  }

})();

