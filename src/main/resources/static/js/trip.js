/* ═══════════════════════════════════════════════════════
   trip.js — 여행 상세 페이지
═══════════════════════════════════════════════════════ */

/* ── 탭 전환 ── */
let currentTab = 'highlight';
/* ── 페이지 초기화 ── */
const tripId = new URLSearchParams(location.search).get('id');
let tripData = null;

function init() {
	if (!tripId) { showAlert('여행 정보를 찾을 수 없어요.'); return; }
	showSkeleton();

	API.trip.detail({ id: tripId }, (trip) => {
		tripData = trip;
		renderInfo(trip);
	});

	API.photo.list({ trip_id: tripId }, (photos) => {
		renderGallery(photos);
	});

	API.video.list({ trip_id: tripId }, (videos) => {
		renderVideos(videos);
	});

	const firstBtn = document.querySelector('.tab-btn.active');
	if (firstBtn) moveIndicator(firstBtn);
}


/* ── 동영상 탭 렌더링 ── */
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

	sec.innerHTML += `<div class="video-list">${videos.map(v => `
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
    </div>`).join('')}</div>`;
}


/* ── 일정 탭 렌더링 ── */
function renderSchedules(schedules) {
	const sec = document.getElementById('sectionSchedule');

	if (!schedules?.length) {
		sec.innerHTML = `
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
		(days[key] = days[key] || []).push(s);
	});

	sec.innerHTML = `<div class="schedule-list">${Object.entries(days).map(([day, items]) => `
      <div class="schedule-day-label">Day ${day}</div>
      ${items.map(s => `
        <div class="schedule-item">
          <div class="schedule-time">${s.time ?? ''}</div>
          <div class="schedule-dot"></div>
          <div class="schedule-content">
            <div class="schedule-title">${s.title}</div>
            ${s.location ? `<div class="schedule-loc">${s.location}</div>` : ''}
          </div>
        </div>`).join('')}`).join('')
		}</div>`;
}


/* ── 여행 기본 정보 렌더링 ── */
function renderInfo(trip) {
	document.getElementById('tripHero').innerHTML = trip.cover_photo_path
		? `<img src="${trip.cover_photo_path}" class="trip-hero-img">`
		: `<div class="trip-hero-ph">
       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
         <rect x="3" y="3" width="18" height="18" rx="2"/>
         <circle cx="8.5" cy="8.5" r="1.5"/>
         <polyline points="21 15 16 10 5 21"/>
       </svg>
     </div>`;

	const dateStr = fmtRange(trip.started_at, trip.ended_at);
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
        ${h.thumb_path ? `<img src="${h.thumb_path}" style="width:100%;height:100%;object-fit:cover">` : ''}
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



/* ── 갤러리 렌더링 ── */
function renderGallery(photos) {
	allPhotos = photos ?? [];
	const sec = document.getElementById('sectionGallery');
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




function switchTab(name, btnEl) {
	if (currentTab === name) return;
	currentTab = name;
	document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
	btnEl.classList.add('active');
	document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
	document.getElementById('section' + name.charAt(0).toUpperCase() + name.slice(1)).classList.add('active');
	moveIndicator(btnEl);
}

function moveIndicator(btnEl) {
	const ind = document.getElementById('tabIndicator');
	const bar = document.getElementById('tabBar');
	const barRect = bar.getBoundingClientRect();
	const btnRect = btnEl.getBoundingClientRect();
	const pad = 10;
	ind.style.left = (btnRect.left - barRect.left + pad) + 'px';
	ind.style.width = (btnRect.width - pad * 2) + 'px';
}


/* ── 날짜 포맷 ── */
function fmtDate(str) {
	if (!str) return '';
	return str.slice(0, 10).replace(/-/g, '.');
}

function fmtRange(s, e) {
	if (!s) return '';
	const sd = fmtDate(s);
	const ed = e ? fmtDate(e) : '';
	return ed && ed !== sd ? `${sd} - ${ed}` : sd;
}

function fmtDuration(sec) {
	if (!sec) return '';
	const m = Math.floor(sec / 60);
	const s = sec % 60;
	return m ? `${m}분 ${s}초` : `${s}초`;
}


/* ── 스켈레톤 ── */
function showSkeleton() {
	document.getElementById('tripHero').innerHTML = `<div class="skeleton skeleton-hero"></div>`;
	document.getElementById('tripInfoBlock').innerHTML = `
    <div class="skeleton skeleton-title"></div>
    <div style="display:flex;gap:8px">
      <div class="skeleton skeleton-chip"></div>
      <div class="skeleton skeleton-chip"></div>
    </div>`;
}



/* ── 갤러리 상태 ── */
let allPhotos = [];
let selectMode = false;
let selectedIds = new Set();
const blobCache = new Map();

async function prefetchBlob(photo) {
	if (blobCache.has(photo.id) || !photo.file_path) return;
	try {
		const res = await fetch(photo.file_path, { mode: 'cors' });
		const blob = await res.blob();
		const type = blob.type || 'image/jpeg';
		const ext = type.split('/')[1]?.split('+')[0] || 'jpg';
		const name = photo.file_path.split('/').pop() || `photo_${photo.id}.${ext}`;
		blobCache.set(photo.id, new File([blob], name, { type }));
	} catch (e) {
		console.warn('prefetch 실패:', photo.id, e);
	}
}




/* ── 갤러리 그리드 — Lazy Load + 무한스크롤 ── */
const BATCH_SIZE = 12;
let renderedCount = 0;
let imgObserver = null;
let sentinel = null;

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
			img.src = src;
			img.onload = () => img.classList.add('loaded');
			img.onerror = () => img.closest('.gallery-item')?.classList.add('img-error');
			imgObserver.unobserve(img);
		});
	}, { rootMargin: '200px' });

	new IntersectionObserver((entries) => {
		if (entries[0].isIntersecting) appendBatch();
	}, { rootMargin: '300px' }).observe(sentinel);

	appendBatch();
	document.getElementById('galleryCount').textContent = allPhotos.length + '장';
}

function appendBatch() {
	const grid = document.getElementById('galleryGrid');
	if (!grid) return;

	const batch = allPhotos.slice(renderedCount, renderedCount + BATCH_SIZE);
	if (batch.length === 0) { sentinel?.remove(); return; }

	batch.forEach((p, batchIdx) => {
		const i = renderedCount + batchIdx;
		const sel = selectedIds.has(p.id);
		const el = document.createElement('div');
		el.className = `gallery-item touch-lock${sel ? ' selected' : ''}`;
		el.dataset.id = p.id;
		el.dataset.idx = i;

		attachPhotoLongPress(el, p.id, i);

		el.innerHTML = p.file_path ? `
      <div class="img-wrap">
        <div class="img-skeleton"></div>
        <img data-src="${p.file_path}" alt="">
      </div>
      <div class="gallery-check">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>` : `
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

		if (p.file_path) imgObserver.observe(el.querySelector('img'));
		grid.appendChild(el);
	});

	renderedCount += batch.length;
}


/* ── 터치 인터랙션 ── */
let _isScrolling = false;

(function initScrollGuard() {
	const wrap = document.getElementById('scrollWrap');
	if (!wrap) return;
	wrap.addEventListener('touchstart', () => { _isScrolling = false; }, { passive: true });
	wrap.addEventListener('touchmove', () => { _isScrolling = true; }, { passive: true });
	wrap.addEventListener('touchend', () => { setTimeout(() => { _isScrolling = false; }, 50); }, { passive: true });
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
			if (_isScrolling) return;
			if (selectMode) {
				toggleSelect(photoId);
			} else {
				openPhotoViewer(idx);
			}
		},
	});
}

/* ── 선택 모드 ── */
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
	document.getElementById('navTitle').textContent = '';
	document.getElementById('selectActionBar').classList.remove('show');
	document.querySelectorAll('.gallery-item.selected').forEach(el => el.classList.remove('selected'));
	updateSelectUI();
}

function toggleSelect(id) {
	if (selectedIds.has(id)) {
		selectedIds.delete(id);
	} else {
		selectedIds.add(id);
		const photo = allPhotos.find(p => p.id === id);
		if (photo) prefetchBlob(photo).then(() => updateSelectUI());
	}
	document.querySelector(`.gallery-item[data-id="${id}"]`)?.classList.toggle('selected', selectedIds.has(id));
	updateSelectUI();
}

function updateSelectUI() {
	const cnt = selectedIds.size;
	const allCached = [...selectedIds].every(id => blobCache.has(id));

	document.getElementById('selectActionCount').textContent = `${cnt}개 선택`;

	const btnDelete = document.querySelector('.select-action-btn--delete');
	const btnDownload = document.querySelector('.select-action-btn--download');

	if (btnDelete) {
		btnDelete.style.opacity = cnt === 0 ? '0.35' : '1';
		btnDelete.disabled = cnt === 0;
	}
	if (btnDownload) {
		const ready = cnt > 0 && allCached;
		btnDownload.style.opacity = cnt === 0 ? '0.35' : (allCached ? '1' : '0.6');
		btnDownload.disabled = !ready;
	}

	if (selectMode) {
		document.getElementById('navTitle').textContent = cnt > 0 ? `${cnt}장 선택` : '선택';
	}
}


/* ── 선택 저장 — Web Share API ── */
async function downloadSelected() {
	if (selectedIds.size === 0) return;
	const targets = allPhotos.filter(p => selectedIds.has(p.id) && p.file_path);
	if (targets.length === 0) { showAlert('저장할 사진이 없어요.'); return; }

	const canShareFiles = typeof navigator.share === 'function' && typeof navigator.canShare === 'function';

	if (!canShareFiles) {
		targets.forEach((p, i) => {
			setTimeout(() => {
				const a = document.createElement('a');
				a.href = p.file_path;
				a.download = p.file_path.split('/').pop() || `photo_${p.id}.jpg`;
				a.click();
			}, i * 120);
		});
		showAlert(`${targets.length}장 다운로드 시작`);
		cancelSelect();
		return;
	}

	const files = targets.map(p => blobCache.get(p.id)).filter(Boolean);
	if (files.length === 0) { showAlert('사진을 불러오지 못했어요.'); return; }
	if (!navigator.canShare({ files })) { showAlert('이 기기에서는 지원되지 않아요.'); return; }

	cancelSelect();
	try {
		await navigator.share({ files });
	} catch (e) {
		if (e.name !== 'AbortError') {
			showAlert('저장에 실패했어요.');
			console.error(e);
		}
	}
}

function deleteSelected() {
	if (selectedIds.size === 0) return;
	showConfirm(`${selectedIds.size}장을 삭제할까요?`, '삭제한 사진은 복구할 수 없어요.', { danger: true, confirmText: '삭제' })
		.then(ok => {
			if (!ok) return;
			// TODO: API 연결
			cancelSelect();
		});
}


/* ── 사진 업로드 ── */
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

			const res = await uploadPhoto(formData, (pct) => updateUploadItem(file.name, 'uploading', pct));
			results.push(res.data);
			updateUploadItem(file.name, 'done');
		} catch (e) {
			updateUploadItem(file.name, 'fail');
			console.error(e);
		}
		updateUploadProgress(++done, fileArr.length);
	}

	const newPhotos = results.filter(Boolean);
	if (newPhotos.length > 0) {
		allPhotos = [...newPhotos, ...allPhotos];
		renderGalleryGrid();
		showAlert(`${newPhotos.length}장 추가됐어요!`);
	}

	setTimeout(hideUploadSheet, 1200);
	document.getElementById('fileInput').value = '';
}

async function uploadPhoto(formData, onProgress) {
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		xhr.open('POST', '/api/photo/upload');
		xhr.upload.onprogress = (e) => {
			if (e.lengthComputable) onProgress(Math.round(e.loaded / e.total * 100));
		};
		xhr.onload = () => {
			if (xhr.status >= 200 && xhr.status < 300) {
				try { resolve(JSON.parse(xhr.responseText)); } catch { resolve(null); }
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
        <div class="ufi-pct"></div>
        <div class="ufi-icon"></div>
      </div>`;
		document.getElementById('uploadFileList').prepend(el);
		uploadItems[name] = el;
	}

	const pctEl = el.querySelector('.ufi-pct');
	const iconEl = el.querySelector('.ufi-icon');

	if (status === 'uploading') {
		pctEl.textContent = pct != null ? pct + '%' : '';
		iconEl.innerHTML = `<div class="ufi-spinner"></div>`;
		el.className = 'upload-file-item uploading';
	} else if (status === 'done') {
		pctEl.textContent = '';
		iconEl.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><polyline points="20 6 9 17 4 12"/></svg>`;
		el.className = 'upload-file-item done';
	} else if (status === 'fail') {
		pctEl.textContent = '실패';
		iconEl.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
		el.className = 'upload-file-item fail';
	}
}


/* ════════════════════════════════════════════════════
   Photo Viewer — Swiper 기반
════════════════════════════════════════════════════ */
(function initPhotoViewer() {
	let pvSwiper = null;
	let pvThumbSwiper = null;
	let _pvOpen = false;

	/* ── 스크롤 잠금 / 해제 ─────────────────────────── */
	// iOS Safari에서 body overflow만으로는 부족하므로
	// scrollWrap의 overflow를 직접 제어하고 포지션을 고정합니다.
	let _scrollLockY = 0;

	function lockScroll() {
		const wrap = document.getElementById('scrollWrap');
		if (!wrap) return;
		_scrollLockY = wrap.scrollTop;               // 현재 스크롤 위치 저장
		wrap.style.overflow = 'hidden';              // 스크롤 차단
		wrap.style.touchAction = 'none';             // 터치 이벤트 차단
	}

	function unlockScroll() {
		const wrap = document.getElementById('scrollWrap');
		if (!wrap) return;
		wrap.style.overflow = '';
		wrap.style.touchAction = '';
		wrap.scrollTop = _scrollLockY;               // 저장했던 위치 복원
	}

	/* ── 썸네일 스트립 빌드 ──────────────────────────── */
	function buildThumbStrip() {
		const strip = document.getElementById('pvThumbStrip');
		if (!strip) return;
		strip.innerHTML = '';

		allPhotos.forEach((p, i) => {
			const item = document.createElement('div');
			item.className = 'pv-thumb-item';
			item.dataset.idx = i;

			if (p.file_path) {
				item.innerHTML = `<img src="${p.file_path}" loading="lazy" alt="">`;
			} else {
				item.innerHTML = `<div class="pv-thumb-ph">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
						<rect x="3" y="3" width="18" height="18" rx="2"/>
						<circle cx="8.5" cy="8.5" r="1.5"/>
						<polyline points="21 15 16 10 5 21"/>
					</svg>
				</div>`;
			}

			item.addEventListener('click', () => {
				pvSwiper?.slideTo(i);
			});

			strip.appendChild(item);
		});
	}

	/* ── 썸네일 active 상태 업데이트 ────────────────── */
	function updateThumbActive(idx) {
		const strip = document.getElementById('pvThumbStrip');
		if (!strip) return;

		strip.querySelectorAll('.pv-thumb-item').forEach((el, i) => {
			el.classList.toggle('active', i === idx);
		});

		// 활성 썸네일이 보이도록 스크롤
		const activeEl = strip.querySelector(`.pv-thumb-item[data-idx="${idx}"]`);
		if (activeEl) {
			activeEl.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
		}
	}

	/* ── 뷰어 열기 ──────────────────────────────────── */
	window.openPhotoViewer = function (startIdx) {
		if (!allPhotos?.length) return;
		_pvOpen = true;

		// 슬라이드 생성
		const wrapper = document.getElementById('pvSwiperWrapper');
		wrapper.innerHTML = '';

		allPhotos.forEach(p => {
			const slide = document.createElement('div');
			slide.className = 'swiper-slide pv-slide';

			if (p.file_path) {
				slide.innerHTML = `<div class="pv-spinner"></div><img data-src="${p.file_path}" alt="">`;
				const img = slide.querySelector('img');
				img.onload = () => { img.classList.add('pv-loaded'); slide.querySelector('.pv-spinner')?.remove(); };
				img.onerror = () => {
					slide.querySelector('.pv-spinner')?.remove();
					img.remove();
					const ph = document.createElement('div');
					ph.className = 'pv-slide-ph';
					ph.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`;
					slide.appendChild(ph);
				};
			} else {
				slide.innerHTML = `<div class="pv-slide-ph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>`;
			}
			wrapper.appendChild(slide);
		});

		// Swiper 초기화
		if (pvSwiper) { pvSwiper.destroy(true, true); pvSwiper = null; }

		pvSwiper = new Swiper('#pvSwiper', {
			initialSlide: startIdx ?? 0,
			speed: 300,
			grabCursor: true,
			keyboard: { enabled: true },
			navigation: {
				prevEl: '.pv-arrow--prev',
				nextEl: '.pv-arrow--next',
			},
			on: {
				slideChange: onSlideChange,
				afterInit: onSlideChange,
			},
		});

		// 첫 로드
		loadSlidesAround(startIdx ?? 0);
		pvSwiper.on('slideChange', () => loadSlidesAround(pvSwiper.activeIndex));

		// 썸네일 스트립
		buildThumbStrip();
		updateThumbActive(startIdx ?? 0);

		// 스크롤 잠금 → 오픈
		lockScroll();
		const viewer = document.getElementById('photoViewer');
		viewer.classList.add('open');
		viewer.setAttribute('aria-hidden', 'false');
	};

	/* ── 주변 슬라이드 이미지 로드 ── */
	function loadSlidesAround(idx) {
		[idx - 1, idx, idx + 1].forEach(i => {
			const slide = pvSwiper?.slides?.[i];
			if (!slide) return;
			const img = slide.querySelector('img[data-src]');
			if (!img) return;
			img.src = img.dataset.src;
			delete img.dataset.src;
		});
	}

	/* ── 슬라이드 변경 콜백 ── */
	function onSlideChange() {
		const total = allPhotos?.length ?? 0;
		const cur = (pvSwiper?.activeIndex ?? 0) + 1;
		document.getElementById('pvCounter').textContent = `${cur} / ${total}`;


		// 썸네일 active
		updateThumbActive(pvSwiper?.activeIndex ?? 0);
	}

	/* ── 뷰어 닫기 ── */
	function closePv() {
		if (!_pvOpen) return;
		_pvOpen = false;

		const viewer = document.getElementById('photoViewer');
		viewer.classList.remove('open');
		viewer.setAttribute('aria-hidden', 'true');

		unlockScroll();
	}

	// 닫기 버튼
	document.getElementById('pvClose').addEventListener('click', closePv);

	// ESC
	document.addEventListener('keydown', e => {
		if (e.key === 'Escape' && _pvOpen) closePv();
	});

	// 공유/저장 버튼
	document.getElementById('pvShare').addEventListener('click', async () => {
		const idx = pvSwiper?.activeIndex ?? 0;
		const photo = allPhotos?.[idx];
		if (!photo?.file_path) return;

		let file = blobCache.get(photo.id);
		if (!file && photo.file_path) {
			try {
				const res = await fetch(photo.file_path, { mode: 'cors' });
				const blob = await res.blob();
				const ext = blob.type.split('/')[1]?.split('+')[0] || 'jpg';
				file = new File([blob], `photo_${photo.id}.${ext}`, { type: blob.type });
			} catch { file = null; }
		}

		if (file && navigator.share && navigator.canShare?.({ files: [file] })) {
			try { await navigator.share({ files: [file] }); return; }
			catch (e) { if (e.name === 'AbortError') return; }
		}

		const a = document.createElement('a');
		a.href = photo.file_path;
		a.download = photo.file_path.split('/').pop() || `photo_${photo.id}.jpg`;
		a.click();
	});

})();



/* ── 플레이어 핸들러 ── */
function playHighlight(id) { showAlert('하이라이트 재생 준비 중'); }
function playVideo(id) { showAlert('동영상 재생 준비 중'); }
init();
requestAnimationFrame(initIndicator);