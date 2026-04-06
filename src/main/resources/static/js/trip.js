/* ═══════════════════════════════════════════════════════
   trip.js — 여행 상세 페이지
═══════════════════════════════════════════════════════ */

/* ── 상수 / 전역 상태 ── */
const SESSION_ID    = sessionStorage.getItem('id');
const SESSION_GROUP = sessionStorage.getItem('group_id');
const TRIP_ID       = new URLSearchParams(location.search).get('id');
const BATCH_SIZE    = 12;

let tripData      = null;
let currentTab    = 'highlight';
let allPhotos     = [];
let selectMode    = false;
let selectedIds   = new Set();
let renderedCount = 0;
let imgObserver   = null;
let sentinel      = null;

const blobCache = new Map();

/* ════════════════════════════════════════════════════
   초기화
════════════════════════════════════════════════════ */
function init() {
	if (!TRIP_ID) { showAlert('여행 정보를 찾을 수 없어요.'); return; }

	showSkeleton();

	API.trip.detail({ id: TRIP_ID }, (trip) => {
		tripData = trip;
		renderInfo(trip);
	});

	API.photo.list({ trip_id: TRIP_ID }, renderGallery);
	API.video.list({ trip_id: TRIP_ID }, renderVideos);

	const firstBtn = document.querySelector('.tab-btn.active');
	if (firstBtn) moveIndicator(firstBtn);
}

/* ════════════════════════════════════════════════════
   렌더링
════════════════════════════════════════════════════ */
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

	const dateStr  = fmtRange(trip.started_at, trip.ended_at);
	const memoHtml = trip.memo ? `<div class="trip-memo">${trip.memo}</div>` : '';

	const chipLocation = trip.location ? `
		<div class="trip-meta-chip">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
				<circle cx="12" cy="10" r="3"/>
			</svg>
			${trip.location}
		</div>` : '';

	const chipDate = dateStr ? `
		<div class="trip-meta-chip">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<rect x="3" y="4" width="18" height="18" rx="2"/>
				<line x1="16" y1="2" x2="16" y2="6"/>
				<line x1="8" y1="2" x2="8" y2="6"/>
				<line x1="3" y1="10" x2="21" y2="10"/>
			</svg>
			${dateStr}
		</div>` : '';

	document.getElementById('tripInfoBlock').innerHTML = `
		<div class="trip-title">${trip.title}</div>
		<div class="trip-meta-row">
			${chipLocation}
			${chipDate}
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

function renderVideos(videos) {
	const sec   = document.getElementById('sectionVideos');
	const total = videos?.length ?? 0;

	if (total === 0) {
		sec.innerHTML = `
			<div class="section-count-label">0개</div>
			<div class="video-empty">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
					<polygon points="23 7 16 12 23 17 23 7"/>
					<rect x="1" y="5" width="15" height="14" rx="2"/>
				</svg>
				동영상이 없어요
			</div>`;
		return;
	}

	const items = videos.map(v => `
		<div class="video-item" onclick="playVideo(${v.id})">
			<div class="video-thumb">
				${v.thumb_path
					? `<img src="${v.thumb_path}">`
					: `<div class="video-thumb-ph">
						<svg viewBox="0 0 24 24" fill="currentColor">
							<polygon points="5 3 19 12 5 21 5 3"/>
						</svg>
					</div>`}
				<div class="video-play-icon">
					<svg viewBox="0 0 24 24" fill="currentColor">
						<polygon points="5 3 19 12 5 21 5 3"/>
					</svg>
				</div>
			</div>
			<div class="video-meta">
				<div class="video-name">${v.file_name || '동영상'}</div>
				<div class="video-sub">${fmtDuration(v.duration_sec)}</div>
			</div>
		</div>`).join('');

	sec.innerHTML = `<div class="section-count-label">${total}개</div><div class="video-list">${items}</div>`;
}

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
		(days[key] ??= []).push(s);
	});

	const html = Object.entries(days).map(([day, items]) => `
		<div class="schedule-day-label">Day ${day}</div>
		${items.map(s => `
			<div class="schedule-item">
				<div class="schedule-time">${s.time ?? ''}</div>
				<div class="schedule-dot"></div>
				<div class="schedule-content">
					<div class="schedule-title">${s.title}</div>
					${s.location ? `<div class="schedule-loc">${s.location}</div>` : ''}
				</div>
			</div>`).join('')}`).join('');

	sec.innerHTML = `<div class="schedule-list">${html}</div>`;
}

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
				${h.thumb_path ? `<img src="${h.thumb_path}" style="width:100%;height:100%;object-fit:cover">` : ''}
				<div class="highlight-play-btn">
					<svg viewBox="0 0 24 24" fill="currentColor">
						<polygon points="5 3 19 12 5 21 5 3"/>
					</svg>
				</div>
			</div>
			<div class="highlight-info">
				<div class="highlight-title">${h.title || '하이라이트'}</div>
				<div class="highlight-meta">${h.clip_count ?? 0}개 클립</div>
			</div>
		</div>`;
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

/* ════════════════════════════════════════════════════
   탭
════════════════════════════════════════════════════ */
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
	const ind     = document.getElementById('tabIndicator');
	const barRect = document.getElementById('tabBar').getBoundingClientRect();
	const btnRect = btnEl.getBoundingClientRect();
	const pad     = 10;
	ind.style.left  = (btnRect.left - barRect.left + pad) + 'px';
	ind.style.width = (btnRect.width - pad * 2) + 'px';
}

/* ════════════════════════════════════════════════════
   갤러리
════════════════════════════════════════════════════ */
const GALLERY_EMPTY_HTML = `
	<div class="gallery-empty">
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="32" height="32">
			<rect x="3" y="3" width="18" height="18" rx="2"/>
			<circle cx="8.5" cy="8.5" r="1.5"/>
			<polyline points="21 15 16 10 5 21"/>
		</svg>
		사진을 추가해보세요
	</div>`;

function renderGallery(photos) {
	allPhotos = photos ?? [];
	const sec = document.getElementById('sectionGallery');

	sec.innerHTML = `
		<div class="gallery-header">
			<div class="section-count-label" id="galleryCount">${allPhotos.length}장</div>
			<button class="gallery-upload-btn" onclick="triggerUpload()">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
					<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
					<polyline points="17 8 12 3 7 8"/>
					<line x1="12" y1="3" x2="12" y2="15"/>
				</svg>
				사진 추가
			</button>
		</div>`;

	if (allPhotos.length === 0) {
		sec.innerHTML += GALLERY_EMPTY_HTML;
		return;
	}

	renderGalleryGrid();
}

function renderGalleryGrid() {
	const sec = document.getElementById('sectionGallery');

	sec.querySelector('.gallery-grid')?.remove();
	sec.querySelector('.gallery-empty')?.remove();
	sec.querySelector('.gallery-sentinel')?.remove();

	imgObserver?.disconnect();
	renderedCount = 0;

	if (allPhotos.length === 0) {
		sec.innerHTML += GALLERY_EMPTY_HTML;
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
		entries.forEach(({ isIntersecting, target: img }) => {
			if (!isIntersecting || !img.dataset.src) return;
			img.src = img.dataset.src;
			delete img.dataset.src;
			img.onload  = () => img.classList.add('loaded');
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

	const CHECK_SVG = `
		<div class="gallery-check">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
				<polyline points="20 6 9 17 4 12"/>
			</svg>
		</div>`;

	const PH_SVG = `
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
			<rect x="3" y="3" width="18" height="18" rx="2"/>
			<circle cx="8.5" cy="8.5" r="1.5"/>
			<polyline points="21 15 16 10 5 21"/>
		</svg>`;

	batch.forEach((p, batchIdx) => {
		const i   = renderedCount + batchIdx;
		const el  = document.createElement('div');
		el.className  = `gallery-item touch-lock${selectedIds.has(p.id) ? ' selected' : ''}`;
		el.dataset.id  = p.id;
		el.dataset.idx = i;

		attachPhotoLongPress(el, p.id, i);

		el.innerHTML = p.file_path
			? `<div class="img-wrap"><div class="img-skeleton"></div><img data-src="${p.file_path}" alt=""></div>${CHECK_SVG}`
			: `<div class="gallery-item-ph">${PH_SVG}</div>${CHECK_SVG}`;

		if (p.file_path) imgObserver.observe(el.querySelector('img'));
		grid.appendChild(el);
	});

	renderedCount += batch.length;
}

/* ── Blob 프리페치 ── */
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

/* ════════════════════════════════════════════════════
   터치 인터랙션
════════════════════════════════════════════════════ */
let _isScrolling = false;

(function initScrollGuard() {
	const wrap = document.getElementById('scrollWrap');
	if (!wrap) return;
	wrap.addEventListener('touchstart', () => { _isScrolling = false; }, { passive: true });
	wrap.addEventListener('touchmove',  () => { _isScrolling = true;  }, { passive: true });
	wrap.addEventListener('touchend',   () => { setTimeout(() => { _isScrolling = false; }, 50); }, { passive: true });
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
			selectMode ? toggleSelect(photoId) : openPhotoViewer(idx);
		},
	});
}

/* ════════════════════════════════════════════════════
   선택 모드
════════════════════════════════════════════════════ */
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
	const cnt       = selectedIds.size;
	const allCached = [...selectedIds].every(id => blobCache.has(id));

	document.getElementById('selectActionCount').textContent = `${cnt}개 선택`;

	const btnDelete   = document.querySelector('.select-action-btn--delete');
	const btnDownload = document.querySelector('.select-action-btn--download');

	if (btnDelete) {
		btnDelete.style.opacity = cnt === 0 ? '0.35' : '1';
		btnDelete.disabled      = cnt === 0;
	}
	if (btnDownload) {
		btnDownload.style.opacity = cnt === 0 ? '0.35' : (allCached ? '1' : '0.6');
		btnDownload.disabled      = !(cnt > 0 && allCached);
	}

	if (selectMode) {
		document.getElementById('navTitle').textContent = cnt > 0 ? `${cnt}장 선택` : '선택';
	}
}

/* ════════════════════════════════════════════════════
   선택 저장 / 삭제
════════════════════════════════════════════════════ */
async function downloadSelected() {
	if (selectedIds.size === 0) return;
	const targets = allPhotos.filter(p => selectedIds.has(p.id) && p.file_path);
	if (targets.length === 0) { showAlert('저장할 사진이 없어요.'); return; }

	const canShareFiles = typeof navigator.share === 'function' && typeof navigator.canShare === 'function';

	if (!canShareFiles) {
		targets.forEach((p, i) => {
			setTimeout(() => {
				const a  = document.createElement('a');
				a.href   = p.file_path;
				a.download = p.file_path.split('/').pop() || `photo_${p.id}.jpg`;
				a.click();
			}, i * 120);
		});
		showAlert(`${targets.length}장 다운로드 시작`);
		cancelSelect();
		return;
	}

	const files = targets.map(p => blobCache.get(p.id)).filter(Boolean);
	if (files.length === 0)            { showAlert('사진을 불러오지 못했어요.'); return; }
	if (!navigator.canShare({ files })) { showAlert('이 기기에서는 지원되지 않아요.'); return; }

	cancelSelect();
	try {
		await navigator.share({ files });
	} catch (e) {
		if (e.name !== 'AbortError') { showAlert('저장에 실패했어요.'); console.error(e); }
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

/* ════════════════════════════════════════════════════
   사진 업로드
════════════════════════════════════════════════════ */
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
			formData.append('trip_id', TRIP_ID);

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
		showAlert(`${newPhotos.length}장 추가`);

		API.push.sendGroup({
			id:       SESSION_ID,
			group_id: SESSION_GROUP,
			msg:      `${tripData?.title || '여행'}에 ${newPhotos.length}개의 사진이 추가되었어요`,
			url:      `/html/trip.html?id=${TRIP_ID}`,
		}, (res) => console.log('push sent', res));
	}

	setTimeout(hideUploadSheet, 1200);
	document.getElementById('fileInput').value = '';
}

async function uploadPhoto(formData, onProgress) {
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		xhr.open('POST', '/api/photo/upload');
		xhr.upload.onprogress = ({ lengthComputable, loaded, total }) => {
			if (lengthComputable) onProgress(Math.round(loaded / total * 100));
		};
		xhr.onload  = () => {
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

/* ── 업로드 시트 ── */
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
				<div class="ufi-pct"></div>
				<div class="ufi-icon"></div>
			</div>`;
		document.getElementById('uploadFileList').prepend(el);
		uploadItems[name] = el;
	}

	const pctEl  = el.querySelector('.ufi-pct');
	const iconEl = el.querySelector('.ufi-icon');

	const STATE = {
		uploading: {
			cls:  'upload-file-item uploading',
			icon: `<div class="ufi-spinner"></div>`,
			pct:  pct != null ? pct + '%' : '',
		},
		done: {
			cls:  'upload-file-item done',
			icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><polyline points="20 6 9 17 4 12"/></svg>`,
			pct:  '',
		},
		fail: {
			cls:  'upload-file-item fail',
			icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
			pct:  '실패',
		},
	};

	const s = STATE[status];
	if (!s) return;
	el.className      = s.cls;
	pctEl.textContent = s.pct;
	iconEl.innerHTML  = s.icon;
}

/* ════════════════════════════════════════════════════
   Photo Viewer — Swiper 기반
════════════════════════════════════════════════════ */
(function initPhotoViewer() {
	let pvSwiper   = null;
	let _pvUiHidden  = false;
	let _pvTouchMoved = false;
	let _pvTouchStartX = 0;
	let _pvTouchStartY = 0;
	let _scrollLockY   = 0;

	const PH_SLIDE_HTML = `
		<div class="pv-slide-ph">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
				<rect x="3" y="3" width="18" height="18" rx="2"/>
				<circle cx="8.5" cy="8.5" r="1.5"/>
				<polyline points="21 15 16 10 5 21"/>
			</svg>
		</div>`;

	/* ── 스크롤 잠금 / 해제 ── */
	function lockScroll() {
		const wrap = document.getElementById('scrollWrap');
		if (!wrap) return;
		_scrollLockY = wrap.scrollTop;
		wrap.style.overflow   = 'hidden';
		wrap.style.touchAction = 'none';
		document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')?.setAttribute('content', 'black');
		document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#000000');
	}

	function unlockScroll() {
		const wrap = document.getElementById('scrollWrap');
		if (!wrap) return;
		wrap.style.overflow    = '';
		wrap.style.touchAction = '';
		wrap.scrollTop = _scrollLockY;
		document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')?.setAttribute('content', 'black-translucent');
		document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#ffffff');
	}

	/* ── UI 토글 ── */
	function showPvUI() {
		_pvUiHidden = false;
		document.getElementById('photoViewer')?.classList.remove('ui-hidden');
	}

	function hidePvUI() {
		_pvUiHidden = true;
		document.getElementById('photoViewer')?.classList.add('ui-hidden');
	}

	function togglePvUI() {
		_pvUiHidden ? showPvUI() : hidePvUI();
	}

	/* ── 썸네일 스트립 ── */
	function buildThumbStrip() {
		const strip = document.getElementById('pvThumbStrip');
		if (!strip) return;
		strip.innerHTML = '';

		allPhotos.forEach((p, i) => {
			const item = document.createElement('div');
			item.className  = 'pv-thumb-item';
			item.dataset.idx = i;
			item.innerHTML   = p.file_path
				? `<img src="${p.file_path}" loading="lazy" alt="">`
				: `<div class="pv-thumb-ph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>`;
			item.addEventListener('click', () => pvSwiper?.slideTo(i));
			strip.appendChild(item);
		});
	}

	function updateThumbActive(idx) {
		const strip = document.getElementById('pvThumbStrip');
		if (!strip) return;
		strip.querySelectorAll('.pv-thumb-item').forEach((el, i) => el.classList.toggle('active', i === idx));
		strip.querySelector(`.pv-thumb-item[data-idx="${idx}"]`)?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
	}

	/* ── 주변 슬라이드 이미지 로드 ── */
	function loadSlidesAround(idx) {
		[idx - 1, idx, idx + 1].forEach(i => {
			const img = pvSwiper?.slides?.[i]?.querySelector('img[data-src]');
			if (!img) return;
			img.src = img.dataset.src;
			delete img.dataset.src;
		});
	}

	/* ── 슬라이드 생성 ── */
	function createSlide(p) {
		const slide = document.createElement('div');
		slide.className = 'swiper-slide pv-slide';

		if (!p.file_path) {
			slide.innerHTML = PH_SLIDE_HTML;
			return slide;
		}

		slide.innerHTML = `
			<div class="swiper-zoom-container">
				<div class="pv-spinner"></div>
				<img data-src="${p.file_path}" alt="">
			</div>`;

		const img = slide.querySelector('img');
		img.onload  = () => { img.classList.add('pv-loaded'); slide.querySelector('.pv-spinner')?.remove(); };
		img.onerror = () => {
			slide.querySelector('.pv-spinner')?.remove();
			img.remove();
			const ph = document.createElement('div');
			ph.className = 'pv-slide-ph';
			ph.innerHTML = PH_SLIDE_HTML;
			slide.appendChild(ph);
		};

		return slide;
	}

	/* ── 뷰어 열기 ── */
	window.openPhotoViewer = function (startIdx) {
		if (!allPhotos?.length) return;

		showPvUI();

		const wrapper = document.getElementById('pvSwiperWrapper');
		wrapper.innerHTML = '';
		allPhotos.forEach(p => wrapper.appendChild(createSlide(p)));

		pvSwiper?.destroy(true, true);

		pvSwiper = new Swiper('#pvSwiper', {
			initialSlide: startIdx ?? 0,
			speed:        300,
			grabCursor:   true,
			zoom:         true,
			keyboard:     { enabled: true },
			navigation:   { prevEl: '.pv-arrow--prev', nextEl: '.pv-arrow--next' },
			on: {
				slideChange() { updateThumbActive(this.activeIndex); loadSlidesAround(this.activeIndex); },
				afterInit()   { updateThumbActive(this.activeIndex); loadSlidesAround(this.activeIndex); },
			},
		});

		buildThumbStrip();
		updateThumbActive(startIdx ?? 0);
		loadSlidesAround(startIdx ?? 0);

		/* ── 탭 → UI 토글 (줌 중 제외) ── */
		const pvEl = document.getElementById('pvSwiper');
		pvEl.ontouchstart = (e) => {
			_pvTouchMoved  = false;
			_pvTouchStartX = e.touches[0].clientX;
			_pvTouchStartY = e.touches[0].clientY;
		};
		pvEl.ontouchmove = (e) => {
			if (Math.abs(e.touches[0].clientX - _pvTouchStartX) > 8 ||
				Math.abs(e.touches[0].clientY - _pvTouchStartY) > 8) {
				_pvTouchMoved = true;
			}
		};
		pvEl.ontouchend = () => {
			if (!_pvTouchMoved && pvSwiper?.zoom?.scale === 1) togglePvUI();
		};
		pvEl.onclick = () => { if (window.innerWidth > 768) togglePvUI(); };

		lockScroll();
		const viewer = document.getElementById('photoViewer');
		viewer.classList.add('open');
		viewer.setAttribute('aria-hidden', 'false');
	};

	/* ── 뷰어 닫기 ── */
	function closePv() {
		if (_pvUiHidden) return;
		_pvUiHidden = false;
		const viewer = document.getElementById('photoViewer');
		viewer.classList.remove('open');
		viewer.setAttribute('aria-hidden', 'true');
		showPvUI();
		unlockScroll();
	}

	/* ── 닫기 / 공유 버튼 ── */
	document.getElementById('pvClose')?.addEventListener('click', closePv);

	document.getElementById('pvShare')?.addEventListener('click', async () => {
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
			} catch {
				file = null;
			}
		}

		if (file && navigator.share && navigator.canShare?.({ files: [file] })) {
			try {
				await navigator.share({ files: [file] });
				return;
			} catch (e) {
				if (e.name === 'AbortError') return;
			}
		}

		const a = document.createElement('a');
		a.href = photo.file_path;
		a.download = photo.file_path.split('/').pop() || `photo_${photo.id}.jpg`;
		a.click();
	});
})();

/* ════════════════════════════════════════════════════
   유틸
════════════════════════════════════════════════════ */
function fmtDate(str) {
	return str ? str.slice(0, 10).replace(/-/g, '.') : '';
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

/* ── 플레이어 핸들러 ── */
function playHighlight(id) { showAlert('하이라이트 재생 준비 중'); }
function playVideo(id)     { showAlert('동영상 재생 준비 중'); }

/* ── 실행 ── */
init();
requestAnimationFrame(initIndicator);