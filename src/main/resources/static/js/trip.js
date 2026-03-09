/* ═══════════════════════════════════════════════════════
   탭 전환
═══════════════════════════════════════════════════════ */
let currentTab = 'highlight';

function switchTab(name, btnEl) {
  if (currentTab === name) return;
  currentTab = name;

  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btnEl.classList.add('active');

  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('section' + capitalize(name)).classList.add('active');

  moveIndicator(btnEl);
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function moveIndicator(btnEl) {
  const ind     = document.getElementById('tabIndicator');
  const bar     = document.getElementById('tabBar');
  const barRect = bar.getBoundingClientRect();
  const btnRect = btnEl.getBoundingClientRect();
  const pad     = 10;
  ind.style.left  = (btnRect.left - barRect.left + pad) + 'px';
  ind.style.width = (btnRect.width - pad * 2) + 'px';
}

function initIndicator() {
  const firstBtn = document.querySelector('.tab-btn.active');
  if (firstBtn) moveIndicator(firstBtn);
}


/* ═══════════════════════════════════════════════════════
   페이지 초기화
═══════════════════════════════════════════════════════ */
const tripId = (() => {
  const p = new URLSearchParams(location.search);
  return p.get('id');
})();

let tripData = null;


/* ═══════════════════════════════════════════════════════
   날짜 / 시간 포맷 유틸
═══════════════════════════════════════════════════════ */
function fmtDate(str) {
  if (!str) return '';
  const kst = new Date(str);
  return kst.toISOString().slice(0, 10).replace(/-/g, '.');
}

function fmtRange(s, e) {
  if (!s) return '';
  const sd = fmtDate(s);
  const ed = e ? fmtDate(e) : '';
  return ed && ed !== sd ? `${sd} — ${ed}` : sd;
}

function fmtDuration(sec) {
  if (!sec) return '';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m ? `${m}분 ${s}초` : `${s}초`;
}


/* ═══════════════════════════════════════════════════════
   스켈레톤 UI
═══════════════════════════════════════════════════════ */
function showSkeleton() {
  document.getElementById('navTitle').textContent = '불러오는 중…';
  document.getElementById('tripHero').innerHTML =
    `<div class="skeleton skeleton-hero"></div>`;
  document.getElementById('tripInfoBlock').innerHTML = `
    <div class="skeleton skeleton-title"></div>
    <div style="display:flex;gap:8px">
      <div class="skeleton skeleton-chip"></div>
      <div class="skeleton skeleton-chip"></div>
    </div>`;
}


/* ═══════════════════════════════════════════════════════
   여행 기본 정보 렌더링
═══════════════════════════════════════════════════════ */
function renderInfo(trip) {
  document.getElementById('navTitle').textContent = trip.title;
  document.title = `${trip.title} — memories.`;

  document.getElementById('tripHero').innerHTML =
    `<div class="trip-hero-ph">
       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
         <rect x="3" y="3" width="18" height="18" rx="2"/>
         <circle cx="8.5" cy="8.5" r="1.5"/>
         <polyline points="21 15 16 10 5 21"/>
       </svg>
     </div>`;

  const dateStr  = fmtRange(trip.started_at, trip.ended_at);
  const memoHtml = trip.memo ? `<div class="trip-memo">${trip.memo}</div>` : '';

  document.getElementById('tripInfoBlock').innerHTML = `
    <div class="trip-title">${trip.title}</div>
    <div class="trip-meta-row">
      ${trip.location ? `
        <div class="trip-meta-chip">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          ${trip.location}
        </div>` : ''}
      ${dateStr ? `
        <div class="trip-meta-chip">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          ${dateStr}
        </div>` : ''}
      <div class="trip-meta-chip">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
        ${trip.photo_count ?? 0}장
      </div>
    </div>
    ${memoHtml}`;
}


/* ═══════════════════════════════════════════════════════
   하이라이트 렌더링
═══════════════════════════════════════════════════════ */
function renderHighlight(highlights) {
  const sec = document.getElementById('sectionHighlight');
  const h   = highlights?.[0] ?? null;

  if (!h) {
    sec.innerHTML = `
      <div class="highlight-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <polygon points="23 7 16 12 23 17 23 7"/>
          <rect x="1" y="5" width="15" height="14" rx="2"/>
        </svg>
        아직 하이라이트 영상이 없어요
      </div>`;
    return;
  }

  sec.innerHTML = `
    <div class="highlight-card" onclick="playHighlight(${h.id})">
      <div class="highlight-thumb">
        ${h.thumb_path
          ? `<img src="${h.thumb_path}" style="width:100%;height:100%;object-fit:cover">`
          : ''}
        <div class="highlight-play-btn">
          <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        </div>
      </div>
      <div class="highlight-info">
        <div class="highlight-title">${h.title || '하이라이트'}</div>
        <div class="highlight-meta">${h.clip_count ?? 0}개 클립</div>
      </div>
    </div>`;
}


/* ═══════════════════════════════════════════════════════
   갤러리 상태 변수
═══════════════════════════════════════════════════════ */
let allPhotos   = [];
let selectMode  = false;
let selectedIds = new Set();

/* ── Blob 캐시 ──
   사진 선택 시 백그라운드에서 미리 fetch → File 객체로 저장
   downloadSelected() 호출 시 await 없이 바로 share() 가능
   → NotAllowedError(제스처 컨텍스트 끊김) 방지
*/
const blobCache = new Map(); // photoId → File

async function prefetchBlob(photo) {
  if (blobCache.has(photo.id) || !photo.file_path) return;
  try {
    const res  = await fetch(photo.file_path, { mode: 'cors' });
    const blob = await res.blob();
    const type = blob.type || 'image/jpeg';
    const ext  = type.split('/')[1]?.split('+')[0] || 'jpg';
    const name = photo.file_path.split('/').pop() || `photo_${photo.id}.${ext}`;
    blobCache.set(photo.id, new File([blob], name, { type }));
  } catch (e) {
    console.warn('prefetch 실패:', photo.id, e);
  }
}


/* ═══════════════════════════════════════════════════════
   갤러리 탭 렌더링
═══════════════════════════════════════════════════════ */
function renderGallery(photos) {
  allPhotos = photos ?? [];
  const sec   = document.getElementById('sectionGallery');
  const total = allPhotos.length;

  sec.innerHTML = `
    <div class="gallery-header">
      <div class="section-count-label" id="galleryCount">${total}장</div>
      <button class="gallery-upload-btn" onclick="triggerUpload()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        사진 추가
      </button>
    </div>`;

  if (total === 0) {
    sec.innerHTML += `
      <div class="gallery-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="32" height="32">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
        사진을 추가해보세요
      </div>`;
    return;
  }

  renderGalleryGrid();
}


/* ═══════════════════════════════════════════════════════
   갤러리 그리드 — Lazy Load + 무한스크롤
═══════════════════════════════════════════════════════ */
const BATCH_SIZE    = 12;
let   renderedCount = 0;
let   imgObserver   = null;
let   sentinel      = null;

function renderGalleryGrid() {
  const sec = document.getElementById('sectionGallery');

  sec.querySelector('.gallery-grid')?.remove();
  sec.querySelector('.gallery-empty')?.remove();
  sec.querySelector('.gallery-sentinel')?.remove();

  imgObserver?.disconnect();
  renderedCount = 0;

  if (allPhotos.length === 0) {
    sec.innerHTML += `
      <div class="gallery-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="32" height="32">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
        사진을 추가해보세요
      </div>`;
    return;
  }

  const grid = document.createElement('div');
  grid.className = 'gallery-grid';
  grid.id = 'galleryGrid';
  sec.appendChild(grid);

  sentinel = document.createElement('div');
  sentinel.className = 'gallery-sentinel';
  sec.appendChild(sentinel);

  imgObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const img = entry.target;
      const src = img.dataset.src;
      if (!src) return;
      img.src     = src;
      img.onload  = () => img.classList.add('loaded');
      img.onerror = () => img.closest('.gallery-item')?.classList.add('img-error');
      imgObserver.unobserve(img);
    });
  }, { rootMargin: '200px' });

  const scrollObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) appendBatch();
  }, { rootMargin: '300px' });
  scrollObserver.observe(sentinel);

  appendBatch();

  const countEl = document.getElementById('galleryCount');
  if (countEl) countEl.textContent = allPhotos.length + '장';
}

function appendBatch() {
  const grid  = document.getElementById('galleryGrid');
  if (!grid) return;

  const batch = allPhotos.slice(renderedCount, renderedCount + BATCH_SIZE);
  if (batch.length === 0) { sentinel?.remove(); return; }

  batch.forEach((p, batchIdx) => {
    const i   = renderedCount + batchIdx;
    const sel = selectedIds.has(p.id);
    const el  = document.createElement('div');
    el.className  = `gallery-item touch-lock${sel ? ' selected' : ''}`;
    el.dataset.id  = p.id;
    el.dataset.idx = i;

    attachPhotoLongPress(el, p.id, i);

    if (p.file_path) {
      el.innerHTML = `
        <div class="img-wrap">
          <div class="img-skeleton"></div>
          <img data-src="${p.file_path}" alt="">
        </div>
        <div class="gallery-check">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>`;
      imgObserver.observe(el.querySelector('img'));
    } else {
      el.innerHTML = `
        <div class="gallery-item-ph">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
        </div>
        <div class="gallery-check">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>`;
    }

    grid.appendChild(el);
  });

  renderedCount += batch.length;
}


/* ═══════════════════════════════════════════════════════
   터치 인터랙션
═══════════════════════════════════════════════════════ */
let _isScrolling = false;

(function initScrollGuard() {
  const attach = () => {
    const wrap = document.getElementById('scrollWrap');
    if (!wrap) return;
    wrap.addEventListener('touchstart', () => { _isScrolling = false; }, { passive: true });
    wrap.addEventListener('touchmove',  () => { _isScrolling = true;  }, { passive: true });
    wrap.addEventListener('touchend',   () => {
      setTimeout(() => { _isScrolling = false; }, 50);
    }, { passive: true });
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attach);
  } else {
    attach();
  }
})();

function attachPhotoLongPress(el, photoId, idx) {
  attachLongPress(el, {
    ms: 420,
    onLongPress: () => {
      if (!selectMode) enterSelectMode();
      toggleSelect(photoId);
      navigator.vibrate?.(30);
    },
    onTap: () => {
      if (selectMode && _isScrolling) return;
      onPhotoTap(photoId, idx);
    },
  });
}

function onPhotoTap(id, idx) {
 if (_isScrolling) return;
  if (selectMode) {
    toggleSelect(id);
  } else {
    openPhoto(idx);
  }
}


/* ═══════════════════════════════════════════════════════
   선택 모드
   toggleSelect 시 백그라운드 prefetch 시작
═══════════════════════════════════════════════════════ */
function enterSelectMode() {
  selectMode = true;
  selectedIds.clear();
  document.getElementById('sectionGallery').classList.add('select-mode');
  document.getElementById('btnBack').style.visibility = 'hidden';
  document.getElementById('btnSelectCancel').style.display = 'flex';
  document.getElementById('selectActionBar').classList.add('show');
  updateSelectUI();
}

function cancelSelect() {
  selectMode = false;
  selectedIds.clear();
  document.getElementById('sectionGallery').classList.remove('select-mode');
  document.getElementById('btnBack').style.visibility = '';
  document.getElementById('btnSelectCancel').style.display = 'none';
  document.getElementById('navTitle').textContent = tripData?.title ?? '';
  document.getElementById('selectActionBar').classList.remove('show');
  document.querySelectorAll('.gallery-item.selected')
    .forEach(el => el.classList.remove('selected'));
  updateSelectUI();
}

function toggleSelect(id) {
  if (selectedIds.has(id)) {
    selectedIds.delete(id);
  } else {
    selectedIds.add(id);
    // 선택 즉시 백그라운드 prefetch → 완료되면 버튼 상태 갱신
    const photo = allPhotos.find(p => p.id === id);
    if (photo) prefetchBlob(photo).then(() => updateSelectUI());
  }
  const el = document.querySelector(`.gallery-item[data-id="${id}"]`);
  if (el) el.classList.toggle('selected', selectedIds.has(id));
  updateSelectUI();
}

function _allCached() {
  return [...selectedIds].every(id => blobCache.has(id));
}

function updateSelectUI() {
  const cnt = selectedIds.size;
  const countEl = document.getElementById('selectActionCount');
  if (countEl) countEl.textContent = `${cnt}개 선택`;

  const btnDelete   = document.querySelector('.select-action-btn--delete');
  const btnDownload = document.querySelector('.select-action-btn--download');

  if (btnDelete) {
    btnDelete.style.opacity = cnt === 0 ? '0.35' : '1';
    btnDelete.disabled = cnt === 0;
  }
  if (btnDownload) {
    if (cnt === 0) {
      btnDownload.style.opacity = '0.35';
      btnDownload.disabled = true;
    } else if (!_allCached()) {
      // 캐싱 중 → 비활성 (제스처 컨텍스트 보호)
      btnDownload.style.opacity = '0.6';
      btnDownload.disabled = true;
    } else {
      // 캐시 완료 → 활성
      btnDownload.style.opacity = '1';
      btnDownload.disabled = false;
    }
  }

  const title = document.getElementById('navTitle');
  if (selectMode && title) {
    title.textContent = cnt > 0 ? `${cnt}장 선택` : '선택';
  }
}



/* ═══════════════════════════════════════════════════════
   사진 뷰어 — 아이폰 스타일 줌 트랜지션 (깜박임 없음)
═══════════════════════════════════════════════════════ */
let viewerIdx = 0;
let _viewerIframe = null;

function openPhoto(idx) {
  const photo = allPhotos[idx];
  if (!photo) return;

  sessionStorage.setItem('viewer_photos', JSON.stringify(allPhotos));
  sessionStorage.setItem('viewer_trip',   JSON.stringify(tripData));

  // 썸네일 rect
  const thumbEl   = document.querySelector(`.gallery-item[data-idx="${idx}"] img`);
  const thumbRect = thumbEl?.getBoundingClientRect()
    ?? { left: window.innerWidth/2 - 40, top: window.innerHeight/2 - 40, width: 80, height: 80 };

  /* ── 어두운 배경 ── */
  const backdrop = document.createElement('div');
  backdrop.style.cssText = `
    position: fixed; inset: 0; z-index: 200;
    background: #0a0704;
    opacity: 0;
    transition: opacity 0.28s ease;
    pointer-events: none;
  `;
  document.body.appendChild(backdrop);

  /* ── 전환 이미지 (썸네일 위치에서 시작) ── */
  const hero = document.createElement('img');
  hero.src = photo.file_path || '';
  hero.style.cssText = `
    position: fixed;
    z-index: 201;
    object-fit: cover;
    border-radius: 6px;
    left:   ${thumbRect.left}px;
    top:    ${thumbRect.top}px;
    width:  ${thumbRect.width}px;
    height: ${thumbRect.height}px;
    transition: left 0.3s cubic-bezier(0.4,0,0.2,1),
                top    0.3s cubic-bezier(0.4,0,0.2,1),
                width  0.3s cubic-bezier(0.4,0,0.2,1),
                height 0.3s cubic-bezier(0.4,0,0.2,1),
                border-radius 0.3s ease;
    will-change: left, top, width, height;
    pointer-events: none;
  `;
  document.body.appendChild(hero);

  /* ── 목표 위치: width 100%, 세로 중앙 ── */
  function getTargetRect() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const nw = hero.naturalWidth  || vw;
    const nh = hero.naturalHeight || vh;
    const h  = (nh / nw) * vw;
    return { left: 0, top: (vh - h) / 2, width: vw, height: h };
  }

  /* ── 애니메이션 실행 ── */
  const animate = () => {
    const t = getTargetRect();
    requestAnimationFrame(() => requestAnimationFrame(() => {
      backdrop.style.opacity  = '1';
      hero.style.left         = t.left   + 'px';
      hero.style.top          = t.top    + 'px';
      hero.style.width        = t.width  + 'px';
      hero.style.height       = t.height + 'px';
      hero.style.borderRadius = '0px';
      hero.style.objectFit    = 'contain';
    }));
  };

  if (hero.complete && hero.naturalWidth) animate();
  else hero.onload = animate;

  /* ── iframe 생성 (완전 투명) ── */
  const iframe = document.createElement('iframe');
  iframe.src = `viewer.html?idx=${idx}`;
  iframe.style.cssText = `
    position: fixed; inset: 0; width: 100%; height: 100dvh;
    border: none; z-index: 202;
    opacity: 0;
    pointer-events: none;
  `;
  document.body.appendChild(iframe);
  _viewerIframe = iframe;

  /* ── iframe 로드 완료 → hero와 크로스페이드 (깜박임 방지) ── */
  iframe.onload = () => {
    iframe.style.transition    = 'opacity 0.15s ease';
    iframe.style.opacity       = '1';
    iframe.style.pointerEvents = 'all';
    setTimeout(() => {
      backdrop.remove();
      hero.remove();
    }, 160);
    history.pushState({ viewer: true }, '', `viewer.html?idx=${idx}`);
  };

  /* ── 닫기 — 썸네일로 줌아웃 ── */
  const onPop = (e) => {
    if (e.data?.type !== 'ROUTER_POP') return;
    window.removeEventListener('message', onPop);

    const iframe = _viewerIframe;
    if (!iframe) { history.back(); return; }

    // 스와이프 후 달라진 idx 파악
    let currentIdx = idx;
    try {
      const url = new URL(iframe.contentWindow.location.href);
      currentIdx = parseInt(url.searchParams.get('idx') ?? idx) || idx;
    } catch (_) {}
    const currentPhoto = allPhotos[currentIdx] ?? photo;

    const closeHero = document.createElement('img');
    closeHero.src = currentPhoto.file_path || '';

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // 닫기 시작: viewer 내 사진 위치 (width 100%, 세로 중앙)
    const calcStart = () => {
      const nw = closeHero.naturalWidth  || vw;
      const nh = closeHero.naturalHeight || vh;
      const h  = (nh / nw) * vw;
      return { left: 0, top: (vh - h) / 2, width: vw, height: h };
    };
    const s = calcStart();

    closeHero.style.cssText = `
      position: fixed; z-index: 203;
      object-fit: contain;
      border-radius: 0px;
      left: ${s.left}px; top: ${s.top}px;
      width: ${s.width}px; height: ${s.height}px;
      transition: left 0.28s cubic-bezier(0.4,0,0.2,1),
                  top    0.28s cubic-bezier(0.4,0,0.2,1),
                  width  0.28s cubic-bezier(0.4,0,0.2,1),
                  height 0.28s cubic-bezier(0.4,0,0.2,1),
                  border-radius 0.28s ease,
                  opacity 0.28s ease;
      will-change: left, top, width, height;
    `;

    const closeBackdrop = document.createElement('div');
    closeBackdrop.style.cssText = `
      position: fixed; inset: 0; z-index: 202;
      background: #0a0704;
      transition: opacity 0.28s ease;
    `;

    document.body.appendChild(closeBackdrop);
    document.body.appendChild(closeHero);
    iframe.style.opacity = '0';

    // 돌아갈 썸네일 위치
    const freshThumb =
      document.querySelector(`.gallery-item[data-idx="${currentIdx}"] img`)
      ?? document.querySelector(`.gallery-item[data-idx="${idx}"] img`);
    const backRect = freshThumb?.getBoundingClientRect() ?? thumbRect;

    requestAnimationFrame(() => requestAnimationFrame(() => {
      closeBackdrop.style.opacity  = '0';
      closeHero.style.left         = backRect.left   + 'px';
      closeHero.style.top          = backRect.top    + 'px';
      closeHero.style.width        = backRect.width  + 'px';
      closeHero.style.height       = backRect.height + 'px';
      closeHero.style.borderRadius = '6px';
      closeHero.style.objectFit    = 'cover';
      closeHero.style.opacity      = '0';
    }));

    setTimeout(() => {
      closeHero.remove();
      closeBackdrop.remove();
      iframe.remove();
      _viewerIframe = null;
    }, 300);

    history.back();
  };

  window.addEventListener('message', onPop);
}

function _updateViewer(idx) {
  const photo = allPhotos[idx];
  if (!photo) return;
  viewerIdx = idx;
  document.getElementById('viewerImg').src = photo.file_path || '';
  document.getElementById('viewerCount').textContent = `${idx + 1} / ${allPhotos.length}`;
  // 뷰어에서 보는 사진도 미리 캐싱
  prefetchBlob(photo);
}

function viewerPrev() {
  if (viewerIdx > 0) _updateViewer(viewerIdx - 1);
}

function viewerNext() {
  if (viewerIdx < allPhotos.length - 1) _updateViewer(viewerIdx + 1);
}

function closePhoto() {
  const viewer = document.getElementById('photoViewer');
  if (!viewer) return;
  viewer.style.opacity = '0';
  setTimeout(() => viewer.remove(), 200);
  document.body.style.overflow = '';
}

async function shareCurrentPhoto() {
  const photo = allPhotos[viewerIdx];
  if (!photo?.file_path) return;
  if (!navigator.share) { showToast('이 기기에서는 공유가 지원되지 않아요.'); return; }

  try {
    // 캐시에 있으면 바로 share, 없으면 fetch 후 share
    let file = blobCache.get(photo.id);
    if (!file) {
      showToast('준비 중…');
      await prefetchBlob(photo);
      file = blobCache.get(photo.id);
    }
    if (!file) { showToast('사진을 불러오지 못했어요.'); return; }

    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file] });
    } else {
      await navigator.share({ url: photo.file_path });
    }
  } catch (e) {
    if (e.name !== 'AbortError') {
      showToast('공유에 실패했어요.');
      console.error(e);
    }
  }
}


/* ═══════════════════════════════════════════════════════
   선택 모드 저장 — Web Share API
   핵심: toggleSelect 시 이미 prefetch 완료 → share() 직전 await 없음
   → 제스처 컨텍스트 유지 → NotAllowedError 방지
═══════════════════════════════════════════════════════ */
async function downloadSelected() {
  if (selectedIds.size === 0) return;
  const targets = allPhotos.filter(p => selectedIds.has(p.id) && p.file_path);
  if (targets.length === 0) { showToast('저장할 사진이 없어요.'); return; }

  const canShareFiles = typeof navigator.share === 'function'
                     && typeof navigator.canShare === 'function';

  if (!canShareFiles) {
    // 데스크톱 fallback
    targets.forEach((p, i) => {
      setTimeout(() => {
        const a    = document.createElement('a');
        a.href     = p.file_path;
        a.download = p.file_path.split('/').pop() || `photo_${p.id}.jpg`;
        a.click();
      }, i * 120);
    });
    showToast(`${targets.length}장 다운로드 시작`);
    cancelSelect();
    return;
  }

  // 캐시에서 바로 꺼냄 — await fetch 없음 → 제스처 컨텍스트 유지
  // (버튼은 _allCached() 가 true일 때만 활성화되므로 여기선 항상 캐시 히트)
  const files = targets.map(p => blobCache.get(p.id)).filter(Boolean);
  if (files.length === 0) { showToast('사진을 불러오지 못했어요.'); return; }
  if (!navigator.canShare({ files })) { showToast('이 기기에서는 지원되지 않아요.'); return; }

  cancelSelect();

  try {
    await navigator.share({ files });
  } catch (e) {
    if (e.name !== 'AbortError') {
      showToast('저장에 실패했어요.');
      console.error(e);
    }
  }
}

function deleteSelected() {
  if (selectedIds.size === 0) return;
  showToast(`${selectedIds.size}장 삭제 준비 중`);
}


/* ═══════════════════════════════════════════════════════
   사진 업로드
═══════════════════════════════════════════════════════ */
function triggerUpload() {
  document.getElementById('fileInput').click();
}

async function handleFiles(files) {
  if (!files?.length) return;
  const fileArr = Array.from(files);

  showUploadSheet(fileArr.length);

  let done = 0;
  const results = [];

  for (const file of fileArr) {
    try {
      updateUploadItem(file.name, 'uploading');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('trip_id', tripId);

      const res = await uploadPhoto(formData, (pct) => {
        updateUploadItem(file.name, 'uploading', pct);
      });

      results.push(res);
      updateUploadItem(file.name, 'done');
    } catch (e) {
      updateUploadItem(file.name, 'fail');
      console.error(e);
    }

    done++;
    updateUploadProgress(done, fileArr.length);
  }

  const newPhotos = results.filter(Boolean);
  if (newPhotos.length > 0) {
    allPhotos = [...newPhotos, ...allPhotos];
    renderGalleryGrid();
    showToast(`${newPhotos.length}장 추가됐어요!`);
  }

  setTimeout(hideUploadSheet, 1200);
  document.getElementById('fileInput').value = '';
}

async function uploadPhoto(formData, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'api/photo/upload');
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round(e.loaded / e.total * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try { resolve(JSON.parse(xhr.responseText)); }
        catch { resolve(null); }
      } else {
        reject(new Error('Upload failed: ' + xhr.status));
      }
    };
    xhr.onerror = () => reject(new Error('Network error'));
    xhr.send(formData);
  });
}

let uploadItems = {};

function showUploadSheet(total) {
  uploadItems = {};
  document.getElementById('uploadFileList').innerHTML = '';
  document.getElementById('uploadCount').textContent  = `0 / ${total}`;
  document.getElementById('uploadFill').style.width   = '0%';
  document.getElementById('uploadSheet').classList.add('show');
}

function hideUploadSheet() {
  document.getElementById('uploadSheet').classList.remove('show');
}

function updateUploadProgress(done, total) {
  document.getElementById('uploadCount').textContent = `${done} / ${total}`;
  document.getElementById('uploadFill').style.width  = `${Math.round(done / total * 100)}%`;
}

function updateUploadItem(name, status, pct) {
  let el = uploadItems[name];
  if (!el) {
    el = document.createElement('div');
    el.className = 'upload-file-item';
    el.innerHTML = `
      <div class="ufi-name">${name}</div>
      <div class="ufi-right">
        <div class="ufi-pct"  id="ufi-pct-${CSS.escape(name)}"></div>
        <div class="ufi-icon" id="ufi-icon-${CSS.escape(name)}"></div>
      </div>`;

    const list = document.getElementById('uploadFileList');

    // 제일 앞에 추가
    list.prepend(el);

    uploadItems[name] = el;
  }

  const pctEl  = el.querySelector('.ufi-pct');
  const iconEl = el.querySelector('.ufi-icon');

  if (status === 'uploading') {
    pctEl.textContent = pct != null ? pct + '%' : '';
    iconEl.innerHTML  = `<div class="ufi-spinner"></div>`;
    el.className = 'upload-file-item uploading';
  } else if (status === 'done') {
    pctEl.textContent = '';
    iconEl.innerHTML  = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><polyline points="20 6 9 17 4 12"/></svg>`;
    el.className = 'upload-file-item done';
  } else if (status === 'fail') {
    pctEl.textContent = '실패';
    iconEl.innerHTML  = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
    el.className = 'upload-file-item fail';
  }
}


/* ═══════════════════════════════════════════════════════
   동영상 탭 렌더링
═══════════════════════════════════════════════════════ */
function renderVideos(videos) {
  const sec   = document.getElementById('sectionVideos');
  const total = videos?.length ?? 0;

  sec.innerHTML = `<div class="section-count-label">${total}개</div>`;

  if (total === 0) {
    sec.innerHTML += `
      <div class="video-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
        </svg>
        동영상이 없어요
      </div>`;
    return;
  }

  const list = videos.map(v => `
    <div class="video-item" onclick="playVideo(${v.id})">
      <div class="video-thumb">
        ${v.thumb_path
          ? `<img src="${v.thumb_path}">`
          : `<div class="video-thumb-ph"><svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg></div>`}
        <div class="video-play-icon">
          <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        </div>
      </div>
      <div class="video-meta">
        <div class="video-name">${v.file_name || '동영상'}</div>
        <div class="video-sub">${fmtDuration(v.duration_sec)}</div>
      </div>
    </div>`).join('');

  sec.innerHTML += `<div class="video-list">${list}</div>`;
}


/* ═══════════════════════════════════════════════════════
   일정 탭 렌더링
═══════════════════════════════════════════════════════ */
function renderSchedules(schedules) {
  const sec = document.getElementById('sectionSchedule');
  sec.innerHTML = '';

  if (!schedules?.length) {
    sec.innerHTML += `
      <div class="schedule-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        일정이 없어요
      </div>`;
    return;
  }

  const days = {};
  schedules.forEach(s => {
    const key = s.day ?? '—';
    if (!days[key]) days[key] = [];
    days[key].push(s);
  });

  let html = `<div class="schedule-list">`;
  Object.entries(days).forEach(([day, items]) => {
    html += `<div class="schedule-day-label">Day ${day}</div>`;
    items.forEach(s => {
      html += `
        <div class="schedule-item">
          <div class="schedule-time">${s.time ?? ''}</div>
          <div class="schedule-dot"></div>
          <div class="schedule-content">
            <div class="schedule-title">${s.title}</div>
            ${s.location ? `<div class="schedule-loc">${s.location}</div>` : ''}
          </div>
        </div>`;
    });
  });
  html += `</div>`;
  sec.innerHTML += html;
}


/* ═══════════════════════════════════════════════════════
   플레이어 핸들러
═══════════════════════════════════════════════════════ */
function playHighlight(id) { showToast('하이라이트 재생 준비 중'); }
function playVideo(id)     { showToast('동영상 재생 준비 중'); }


/* ═══════════════════════════════════════════════════════
   데이터 로드
═══════════════════════════════════════════════════════ */
async function loadAll() {
  if (!tripId) { showToast('여행 정보를 찾을 수 없어요.'); return; }

  showSkeleton();

  try {
    const [trip, photos, videos, schedules, highlights] = await Promise.all([
      TripsAPI.trips.detail({ id: tripId }),
      TripsAPI.photos.list({ trip_id: tripId }),
      TripsAPI.videos.list({ trip_id: tripId }),
/*      TripsAPI.schedules.list({ trip_id: tripId }),
      TripsAPI.highlights.list({ trip_id: tripId }),*/
    ]);

    tripData = trip;
    renderInfo(trip);
    renderHighlight(highlights);
    renderGallery(photos);
    renderVideos(videos);
    renderSchedules(schedules);

  } catch (e) {
    showToast('데이터를 불러오지 못했어요.');
    console.error(e);
  }
}

/* ── 초기 실행 ── */
loadAll();
console.log("FIXED");
requestAnimationFrame(initIndicator);