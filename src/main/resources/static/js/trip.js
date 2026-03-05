/* ══ 탭 전환 ══ */
let currentTab = 'highlight';

function switchTab(name, btnEl) {
  if (currentTab === name) return;
  currentTab = name;

  // 버튼 active
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btnEl.classList.add('active');

  // 패널 전환
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('section' + capitalize(name)).classList.add('active');

  // 인디케이터 이동
  moveIndicator(btnEl);
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function moveIndicator(btnEl) {
  const ind  = document.getElementById('tabIndicator');
  const bar  = document.getElementById('tabBar');
  const barRect = bar.getBoundingClientRect();
  const btnRect = btnEl.getBoundingClientRect();
  const pad  = 10;
  ind.style.left  = (btnRect.left - barRect.left + pad) + 'px';
  ind.style.width = (btnRect.width - pad * 2) + 'px';
}

function initIndicator() {
  const firstBtn = document.querySelector('.tab-btn.active');
  if (firstBtn) moveIndicator(firstBtn);
}

/* ═══════════════════════════════
   trip.js — 디테일 페이지 전용
═══════════════════════════════ */

/* ── URL에서 trip id 파싱 ── */
const tripId = (() => {
  const p = new URLSearchParams(location.search);
  return p.get('id');
})();

let tripData = null;

/* ── 날짜 포맷 ── */
function fmtDate(str) {
  if (!str) return '';
  const d = new Date(str);
  const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
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

/* ── 로딩 스켈레톤 ── */
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

/* ── 여행 기본 정보 렌더링 ── */
function renderInfo(trip) {
  document.getElementById('navTitle').textContent = trip.title;
  document.title = `${trip.title} — memories.`;

  // hero
  document.getElementById('tripHero').innerHTML =
    `<div class="trip-hero-ph">
       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
         <rect x="3" y="3" width="18" height="18" rx="2"/>
         <circle cx="8.5" cy="8.5" r="1.5"/>
         <polyline points="21 15 16 10 5 21"/>
       </svg>
     </div>`;

  // 기본 정보
  const dateStr = fmtRange(trip.started_at, trip.ended_at);
  const memoHtml = trip.memo
    ? `<div class="trip-memo">${trip.memo}</div>` : '';

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

/* ── 하이라이트 렌더링 ── */
function renderHighlight(highlights) {
  const sec = document.getElementById('sectionHighlight');
  const h = highlights?.[0] ?? null;

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

/* ══════════════════════════════
   갤러리 — 업로드 / 선택 / 다운로드
══════════════════════════════ */
let allPhotos    = [];   // 현재 여행 전체 사진
let selectMode   = false;
let selectedIds  = new Set();

/* ── 갤러리 렌더링 ── */
function renderGallery(photos) {
  allPhotos = photos ?? [];
  const sec   = document.getElementById('sectionGallery');
  const total = allPhotos.length;

  // 헤더: 장수 + 업로드 버튼
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

function renderGalleryGrid() {
  const sec = document.getElementById('sectionGallery');
  // 기존 그리드만 교체
  const existingGrid = sec.querySelector('.gallery-grid');
  if (existingGrid) existingGrid.remove();
  const existingEmpty = sec.querySelector('.gallery-empty');
  if (existingEmpty) existingEmpty.remove();

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

  let grid = `<div class="gallery-grid" id="galleryGrid">`;
  allPhotos.forEach((p, i) => {
    const sel = selectedIds.has(p.id);
    grid += `
      <div class="gallery-item${sel ? ' selected' : ''}" data-id="${p.id}" data-idx="${i}"
           onclick="onPhotoTap(${p.id}, ${i})"
           oncontextmenu="onPhotoLongPress(event, ${p.id})">
        ${p.file_path
          ? `<img src="${p.file_path}" loading="lazy">`
          : `<div class="gallery-item-ph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>`}
        <div class="gallery-check">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
      </div>`;
  });
  grid += `</div>`;
  sec.innerHTML += grid;

  // 장수 업데이트
  const countEl = document.getElementById('galleryCount');
  if (countEl) countEl.textContent = allPhotos.length + '장';
}

/* ── 사진 탭: 단순 탭 / 선택 모드 탭 ── */
function onPhotoTap(id, idx) {
  if (selectMode) {
    toggleSelect(id);
  } else {
    openPhoto(idx);
  }
}
function onPhotoLongPress(e, id) {
  e.preventDefault();
  if (!selectMode) enterSelectMode();
  toggleSelect(id);
}

/* ── 선택 모드 ── */
function enterSelectMode() {
  selectMode = true;
  selectedIds.clear();
  document.getElementById('sectionGallery').classList.add('select-mode');
  // Nav: 다운로드 + 취소 표시
  document.getElementById('btnDownload')?.style && (document.getElementById('btnDownload').style.display = 'flex');
  document.getElementById('btnSelectCancel')?.style && (document.getElementById('btnSelectCancel').style.display = 'flex');
  document.getElementById('btnMore')?.style && (document.getElementById('btnMore').style.display = 'none');
  updateSelectUI();
}

function cancelSelect() {
  selectMode = false;
  selectedIds.clear();
  document.getElementById('sectionGallery').classList.remove('select-mode');
  document.getElementById('btnDownload').style.display = 'none';
  document.getElementById('btnSelectCancel').style.display = 'none';
  document.getElementById('btnMore').style.display = 'flex';
  // 체크 해제
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
  // DOM 업데이트
  const el = document.querySelector(`.gallery-item[data-id="${id}"]`);
  if (el) el.classList.toggle('selected', selectedIds.has(id));
  updateSelectUI();
}

function updateSelectUI() {
  const cnt = selectedIds.size;
  const btn = document.getElementById('btnDownload');
  if (btn) {
    btn.style.opacity = cnt > 0 ? '1' : '0.35';
    btn.disabled = cnt === 0;
  }
  // Nav 타이틀에 선택 개수 표시
  const title = document.getElementById('navTitle');
  if (selectMode && title) {
    title.textContent = cnt > 0 ? `${cnt}장 선택` : '선택';
  }
}

/* ── 다운로드 ── */
function downloadSelected() {
  if (selectedIds.size === 0) return;
  const targets = allPhotos.filter(p => selectedIds.has(p.id) && p.file_path);
  if (targets.length === 0) { showToast('다운로드할 사진이 없어요.'); return; }

  targets.forEach((p, i) => {
    setTimeout(() => {
      const a = document.createElement('a');
      a.href = p.file_path;
      a.download = p.file_path.split('/').pop() || `photo_${p.id}.jpg`;
      a.click();
    }, i * 120);  // 브라우저 다운로드 제한 회피
  });

  showToast(`${targets.length}장 다운로드 시작`);
  cancelSelect();
}

/* ══════════════════════════════
   업로드
══════════════════════════════ */
function triggerUpload() {
  document.getElementById('fileInput').click();
}

async function handleFiles(files) {
  if (!files?.length) return;
  const fileArr = Array.from(files);

  // 업로드 시트 열기
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

  // 완료 후 갤러리 반영
  const newPhotos = results.filter(Boolean);
  if (newPhotos.length > 0) {
    allPhotos = [...allPhotos, ...newPhotos];
    renderGalleryGrid();
    showToast(`${newPhotos.length}장 추가됐어요!`);
  }

  setTimeout(hideUploadSheet, 1200);

  // 파일 인풋 초기화
  document.getElementById('fileInput').value = '';
}

/* ── 실제 업로드 API 호출 ── */
async function uploadPhoto(formData, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/photos/upload');

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

/* ── 업로드 시트 UI ── */
let uploadItems = {};   // filename → DOM el

function showUploadSheet(total) {
  uploadItems = {};
  document.getElementById('uploadFileList').innerHTML = '';
  document.getElementById('uploadCount').textContent = `0 / ${total}`;
  document.getElementById('uploadFill').style.width = '0%';
  document.getElementById('uploadSheet').classList.add('show');
}

function hideUploadSheet() {
  document.getElementById('uploadSheet').classList.remove('show');
}

function updateUploadProgress(done, total) {
  document.getElementById('uploadCount').textContent = `${done} / ${total}`;
  document.getElementById('uploadFill').style.width = `${Math.round(done / total * 100)}%`;
}

function updateUploadItem(name, status, pct) {
  let el = uploadItems[name];
  if (!el) {
    el = document.createElement('div');
    el.className = 'upload-file-item';
    el.innerHTML = `
      <div class="ufi-name">${name}</div>
      <div class="ufi-right">
        <div class="ufi-pct" id="ufi-pct-${CSS.escape(name)}"></div>
        <div class="ufi-icon" id="ufi-icon-${CSS.escape(name)}"></div>
      </div>`;
    document.getElementById('uploadFileList').appendChild(el);
    uploadItems[name] = el;
  }

  const pctEl  = el.querySelector('.ufi-pct');
  const iconEl = el.querySelector('.ufi-icon');

  if (status === 'uploading') {
    pctEl.textContent  = pct != null ? pct + '%' : '';
    iconEl.innerHTML   = `<div class="ufi-spinner"></div>`;
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

/* ── 동영상 렌더링 ── */
function renderVideos(videos) {
  const sec = document.getElementById('sectionVideos');
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

/* ── 일정 렌더링 ── */
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

  // day 별로 그룹핑
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

/* ── 액션 핸들러 ── */
function playHighlight(id) { showToast('하이라이트 재생 준비 중'); }
function openPhoto(idx)    { showToast('사진 뷰어 준비 중'); }
function playVideo(id)     { showToast('동영상 재생 준비 중'); }

/* ── 데이터 로드 ── */
async function loadAll() {
  if (!tripId) { showToast('여행 정보를 찾을 수 없어요.'); return; }

  showSkeleton();

  try {
    // 병렬 요청
    const [trip, photos, videos, schedules, highlights] = await Promise.all([
      TripsAPI.trips.detail({ id: tripId }),
      TripsAPI.photos.list({ trip_id: tripId }),
      TripsAPI.videos.list({ trip_id: tripId }),
      TripsAPI.schedules ? TripsAPI.schedules.list({ trip_id: tripId }) : Promise.resolve([]),
/*      TripsAPI.highlights ? TripsAPI.highlights.list({ trip_id: tripId }) : Promise.resolve([]),
*/    ]);

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
function goBack() {
  Router.pop();
}

/* ── 초기 실행 ── */
loadAll();
// DOM 렌더 후 인디케이터 초기 위치 계산
requestAnimationFrame(initIndicator);