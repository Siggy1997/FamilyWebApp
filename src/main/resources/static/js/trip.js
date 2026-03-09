/* ═══════════════════════════════════════════════════════
   탭 전환
   — 하이라이트 / 사진 / 동영상 / 일정 탭 간 전환 처리
   — 탭 하단 인디케이터(밑줄) 위치·너비 애니메이션
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

// 클릭된 탭 버튼 위치에 맞게 인디케이터 이동
function moveIndicator(btnEl) {
  const ind     = document.getElementById('tabIndicator');
  const bar     = document.getElementById('tabBar');
  const barRect = bar.getBoundingClientRect();
  const btnRect = btnEl.getBoundingClientRect();
  const pad     = 10;
  ind.style.left  = (btnRect.left - barRect.left + pad) + 'px';
  ind.style.width = (btnRect.width - pad * 2) + 'px';
}

// 페이지 진입 시 첫 번째 탭(하이라이트)에 인디케이터 초기 위치 설정
function initIndicator() {
  const firstBtn = document.querySelector('.tab-btn.active');
  if (firstBtn) moveIndicator(firstBtn);
}


/* ═══════════════════════════════════════════════════════
   페이지 초기화
   — URL 쿼리스트링에서 trip id 추출
   — tripData: 로드 후 여행 정보를 캐싱해두는 전역 변수
═══════════════════════════════════════════════════════ */
const tripId = (() => {
  const p = new URLSearchParams(location.search);
  return p.get('id');
})();

let tripData = null;


/* ═══════════════════════════════════════════════════════
   날짜 / 시간 포맷 유틸
═══════════════════════════════════════════════════════ */

// KST 기준 'YYYY.MM.DD' 포맷
function fmtDate(str) {
  if (!str) return '';
  const kst = new Date(str);
  return kst.toISOString().slice(0, 10).replace(/-/g, '.');
}

// 시작일~종료일 범위 문자열 반환 (같은 날이면 단일 날짜만)
function fmtRange(s, e) {
  if (!s) return '';
  const sd = fmtDate(s);
  const ed = e ? fmtDate(e) : '';
  return ed && ed !== sd ? `${sd} — ${ed}` : sd;
}

// 초(sec) → 'N분 N초' 형태로 변환
function fmtDuration(sec) {
  if (!sec) return '';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m ? `${m}분 ${s}초` : `${s}초`;
}


/* ═══════════════════════════════════════════════════════
   스켈레톤 UI
   — 데이터 로드 전 플레이스홀더를 보여줘 빈 화면 방지
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
   — 네비게이션 타이틀, 히어로 영역, 위치/날짜/사진 수 칩
═══════════════════════════════════════════════════════ */
function renderInfo(trip) {
  document.getElementById('navTitle').textContent = trip.title;
  document.title = `${trip.title} — memories.`;

  // 히어로 영역: 대표 이미지가 없을 경우 플레이스홀더 아이콘
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
   — 하이라이트 영상이 있으면 썸네일 카드, 없으면 빈 상태 표시
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
   갤러리 — 상태 변수
   — allPhotos:   전체 사진 목록 (서버에서 받은 원본 배열)
   — selectMode:  선택 모드 활성 여부
   — selectedIds: 현재 선택된 사진 id Set
═══════════════════════════════════════════════════════ */
let allPhotos   = [];
let selectMode  = false;
let selectedIds = new Set();


/* ═══════════════════════════════════════════════════════
   갤러리 탭 렌더링
   — 헤더(사진 수 + 추가 버튼) 그리기
   — 사진이 없으면 빈 상태, 있으면 그리드 렌더링
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
   갤러리 그리드 — 가상 렌더링 (Lazy Load + 무한스크롤)
   — BATCH_SIZE씩 DOM에 추가해 초기 렌더 부담 최소화
   — imgObserver: 뷰포트 진입 시 이미지 src 교체 (lazy load)
   — scrollObserver: sentinel이 보이면 다음 배치 추가
═══════════════════════════════════════════════════════ */
const BATCH_SIZE    = 12;
let   renderedCount = 0;
let   imgObserver   = null;
let   sentinel      = null;

function renderGalleryGrid() {
  const sec = document.getElementById('sectionGallery');

  // 기존 그리드·빈 상태·sentinel 제거 후 재구성
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

  // 무한스크롤 트리거용 sentinel (그리드 맨 아래 위치)
  sentinel = document.createElement('div');
  sentinel.className = 'gallery-sentinel';
  sec.appendChild(sentinel);

  // 이미지 lazy load: 뷰포트 200px 전방 진입 시 src 지정
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

  // sentinel이 뷰포트 300px 전방에 들어오면 다음 배치 렌더
  const scrollObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) appendBatch();
  }, { rootMargin: '300px' });
  scrollObserver.observe(sentinel);

  appendBatch();

  const countEl = document.getElementById('galleryCount');
  if (countEl) countEl.textContent = allPhotos.length + '장';
}

// 다음 BATCH_SIZE 장의 사진 아이템을 그리드에 추가
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
   터치 인터랙션 — 롱프레스 / 탭 / 스크롤 중 탭 방지
   — scrollWrap에서 전역으로 스크롤 여부를 추적해
     선택 모드일 때 스크롤 후 손가락을 떼는 순간
     탭으로 잘못 인식되는 것을 방지
   — attachLongPress는 common.js 구현체 사용
═══════════════════════════════════════════════════════ */
let _isScrolling = false;

(function initScrollGuard() {
  const attach = () => {
    const wrap = document.getElementById('scrollWrap');
    if (!wrap) return;
    wrap.addEventListener('touchstart', () => { _isScrolling = false; }, { passive: true });
    wrap.addEventListener('touchmove',  () => { _isScrolling = true;  }, { passive: true });
    // touchend와 onTap 콜백이 거의 동시 실행되므로 50ms 후 리셋
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

// 각 갤러리 아이템에 롱프레스·탭 이벤트 등록
function attachPhotoLongPress(el, photoId, idx) {
  attachLongPress(el, {
    ms: 420,
    onLongPress: () => {
      if (!selectMode) enterSelectMode();
      toggleSelect(photoId);
      navigator.vibrate?.(30); // 햅틱 피드백 (지원 기기)
    },
    onTap: () => {
      if (selectMode && _isScrolling) return; // 스크롤 중 탭 무시
      onPhotoTap(photoId, idx);
    },
  });
}

// 탭 처리: 선택 모드면 선택 토글, 일반 모드면 사진 뷰어 열기
function onPhotoTap(id, idx) {
  if (selectMode) {
    toggleSelect(id);
  } else {
    openPhoto(idx);
  }
}


/* ═══════════════════════════════════════════════════════
   선택 모드
   — 롱프레스로 진입, 헤더·하단 액션 바 전환
   — toggleSelect: 개별 사진 선택/해제 + UI 동기화
   — updateSelectUI: 카운트 텍스트 및 버튼 활성화 상태 갱신
═══════════════════════════════════════════════════════ */
function enterSelectMode() {
  selectMode = true;
  selectedIds.clear();
  document.getElementById('sectionGallery').classList.add('select-mode');

  // 헤더: 뒤로가기 숨기고 '취소'만 표시
  document.getElementById('btnBack').style.visibility = 'hidden';
  document.getElementById('btnSelectCancel').style.display = 'flex';

  // 하단 액션 바 슬라이드 업
  document.getElementById('selectActionBar').classList.add('show');

  updateSelectUI();
}

function cancelSelect() {
  selectMode = false;
  selectedIds.clear();
  document.getElementById('sectionGallery').classList.remove('select-mode');

  // 헤더 원복
  document.getElementById('btnBack').style.visibility = '';
  document.getElementById('btnSelectCancel').style.display = 'none';
  document.getElementById('navTitle').textContent = tripData?.title ?? '';

  // 하단 액션 바 닫기
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
  }
  const el = document.querySelector(`.gallery-item[data-id="${id}"]`);
  if (el) el.classList.toggle('selected', selectedIds.has(id));
  updateSelectUI();
}

function updateSelectUI() {
  const cnt = selectedIds.size;

  // 하단 바 카운트 텍스트
  const countEl = document.getElementById('selectActionCount');
  if (countEl) countEl.textContent = `${cnt}개 선택`;

  // 선택 0개일 때 삭제·다운로드 버튼 비활성화
  const btnDelete   = document.querySelector('.select-action-btn--delete');
  const btnDownload = document.querySelector('.select-action-btn--download');
  const disabled    = cnt === 0;
  if (btnDelete)   { btnDelete.style.opacity   = disabled ? '0.35' : '1'; btnDelete.disabled   = disabled; }
  if (btnDownload) { btnDownload.style.opacity = disabled ? '0.35' : '1'; btnDownload.disabled = disabled; }

  // 헤더 타이틀: 선택 중이면 'N장 선택', 없으면 '선택'
  const title = document.getElementById('navTitle');
  if (selectMode && title) {
    title.textContent = cnt > 0 ? `${cnt}장 선택` : '선택';
  }
}


/* ═══════════════════════════════════════════════════════
   선택 모드 액션 — 저장 / 삭제

   iOS PWA 제약:
   - <a download> → 파일 앱으로 저장됨 (갤러리 불가)
   - Web Share API → '사진에 저장' 으로 갤러리 저장 가능
   - 단, iOS는 share() 호출이 터치 이벤트와 동기적으로
     연결돼야 함. await fetch() 후 share() 하면 제스처
     컨텍스트가 끊겨서 실패함.

   해결: fetch를 먼저 다 끝낸 뒤 share를 호출하되,
   share() 자체는 버튼 탭 → 한 틱 안에 실행되도록
   fetch를 최대한 빠르게 처리하거나,
   1장씩 순차 share (각각 별도 탭 이벤트 없이는 한계 있음)
   → 현실적으로 iOS는 1장씩 share 하는 게 가장 안정적.
═══════════════════════════════════════════════════════ */

// URL → Blob → File 변환 헬퍼
async function fetchAsFile(url, filename) {
  const res  = await fetch(url, { mode: 'cors' });
  const blob = await res.blob();
  const type = blob.type || 'image/jpeg';
  const ext  = type.split('/')[1]?.split('+')[0] || 'jpg';
  return new File([blob], filename || `photo.${ext}`, { type });
}

async function downloadSelected() {
  if (selectedIds.size === 0) return;
  const targets = allPhotos.filter(p => selectedIds.has(p.id) && p.file_path);
  if (targets.length === 0) { showToast('저장할 사진이 없어요.'); return; }

  const canShareFiles = typeof navigator.share === 'function'
                     && typeof navigator.canShare === 'function';

  if (!canShareFiles) {
    // 데스크톱 등 미지원 환경 → <a download> fallback
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

  // iOS: 1장씩 순차적으로 share
  // 여러 장을 한 번에 share하면 제스처 컨텍스트 문제로 실패하는 경우가 있음
  cancelSelect();
  showToast('저장 준비 중…');

  let savedCount = 0;

  for (const p of targets) {
    try {
      const filename = p.file_path.split('/').pop() || `photo_${p.id}.jpg`;
      const file     = await fetchAsFile(p.file_path, filename);

      if (!navigator.canShare({ files: [file] })) {
        throw new Error('canShare rejected');
      }

      await navigator.share({ files: [file] });
      savedCount++;

    } catch (e) {
      if (e.name === 'AbortError') {
        // 사용자가 공유 시트 닫음 → 나머지도 중단
        break;
      }
      console.error('share 실패:', e);
      showToast('일부 사진 저장에 실패했어요.');
    }
  }

  if (savedCount > 0) {
    showToast(`${savedCount}장을 갤러리에 저장했어요`);
  }
}

// 선택된 사진 삭제 (API 연동 TODO)
function deleteSelected() {
  if (selectedIds.size === 0) return;
  const cnt = selectedIds.size;
  showToast(`${cnt}장 삭제 준비 중`);
}


/* ═══════════════════════════════════════════════════════
   사진 업로드
   — 파일 인풋 트리거 → XHR로 한 장씩 순차 업로드
   — 업로드 진행 시트(progress sheet)에 실시간 상태 표시
   — 완료 후 allPhotos에 추가하고 그리드 재렌더
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
    allPhotos = [...allPhotos, ...newPhotos];
    renderGalleryGrid();
    showToast(`${newPhotos.length}장 추가됐어요!`);
  }

  setTimeout(hideUploadSheet, 1200);
  document.getElementById('fileInput').value = '';
}

// XHR로 사진 1장 업로드, onProgress 콜백으로 진행률 전달
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

// 업로드 진행 시트 UI 제어
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

// 파일별 행(uploading / done / fail) 상태 업데이트
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
    document.getElementById('uploadFileList').appendChild(el);
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
   — 썸네일 + 파일명 + 재생 시간 목록 표시
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
   — Day 단위로 그룹핑 후 타임라인 형태로 출력
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

  // day 값 기준으로 그룹핑
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
   플레이어 핸들러 (추후 구현)
═══════════════════════════════════════════════════════ */
function playHighlight(id) { showToast('하이라이트 재생 준비 중'); }
function openPhoto(idx)    { showToast('사진 뷰어 준비 중'); }
function playVideo(id)     { showToast('동영상 재생 준비 중'); }


/* ═══════════════════════════════════════════════════════
   데이터 로드
   — 여행 정보 / 사진 / 동영상 / 일정 / 하이라이트를
     Promise.all로 병렬 요청해 렌더링
═══════════════════════════════════════════════════════ */
async function loadAll() {
  if (!tripId) { showToast('여행 정보를 찾을 수 없어요.'); return; }

  showSkeleton();

  try {
    const [trip, photos, videos, schedules, highlights] = await Promise.all([
      TripsAPI.trips.detail({ id: tripId }),
      TripsAPI.photos.list({ trip_id: tripId }),
      TripsAPI.videos.list({ trip_id: tripId }),
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

/* ── 뒤로가기 ── */
function goBack() { Router.pop(); }

/* ── 초기 실행 ── */
loadAll();
requestAnimationFrame(initIndicator);