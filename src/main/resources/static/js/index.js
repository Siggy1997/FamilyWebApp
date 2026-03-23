
/* ═══════════════════════════════
   index.js — 메인 페이지
═══════════════════════════════ */

let trips = [];
const id 			= sessionStorage.getItem("id");
const avatar_path 	= sessionStorage.getItem("avatar_path");
const group_id 		= sessionStorage.getItem("group_id");

function init() {
	const reqData = { id, group_id };
	let done = 0;
	function checkDone() {
		done++;
		if (done === 2) hideLoading();
	}

	const profile = document.getElementById('navProfileBtn');
	const hasAvatarImg = avatar_path && avatar_path !== 'undefined' && avatar_path !== 'null' && avatar_path.trim() !== '';
	profile.innerHTML = hasAvatarImg
		? `<img src="${avatar_path}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`
		: `<svg viewBox="0 0 24 24" fill="none" stroke="#5c3d1e" stroke-width="1.7" width="25" height="25">
			<circle cx="12" cy="8" r="4"/>
			<path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
		   </svg>`;
	API.trip.group(reqData, (res) => {
		renderGrpInfo(res.grpInfo, res.grpMember);
		checkDone();
	});

	API.trip.list(reqData, (res) => {
		trips = res ?? [];
		renderHero(trips[0] ?? null);
		renderGrid();
		checkDone();
	});
}

function renderGrpInfo(grpInfo, grpMember) {
	const eyebrow = document.getElementById('greeting-eyebrow');
	eyebrow.innerHTML = `<span class="eyebrow-line"></span><span>${grpInfo.name}</span>`;

	const profilesRow = document.getElementById('profiles-row');
	const members = Array.isArray(grpMember) ? grpMember : [grpMember];

	profilesRow.innerHTML = members
		.filter(member => member.id != id)
		.map(member => {
			const avatar = member.avatar_path
				? `<img src="${member.avatar_path}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`
				: `<svg viewBox="0 0 24 24" fill="none" stroke="#c8b09a" stroke-width="1.5" width="22" height="22">
				<circle cx="12" cy="8" r="4"/>
				<path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
			   </svg>`;

			return `
			<div class="profile-item">
				<div class="profile-avatar">${avatar}</div>
			</div>`;
		})
		.join('');
}

/* ── Hero 렌더링 ── */
function renderHero(trip) {
	const sec = document.getElementById('heroSection');
	if (!trip) { sec.innerHTML = ''; return; }

	const cells = [
		'linear-gradient(155deg,#c9a882,#a07050)',
		'linear-gradient(155deg,#7ab8c8,#3a88a8)',
		'linear-gradient(155deg,#88a870,#508040)',
		'linear-gradient(155deg,#d4b090,#b07860)',
		'linear-gradient(155deg,#c8a888,#987058)',
	].map(g => `<div style="background:${g}"></div>`).join('');

	sec.innerHTML = `
    <div class="section-label">최근 여행</div>
    <div class="hero-card" onclick="goTrip(${trip.id})">
      <div class="hero-ph">${cells}</div>
      <div class="hero-overlay">
        <div class="hero-tag">${trip.location || '—'}</div>
        <div class="hero-name">${trip.title}</div>
        <div class="hero-bottom">
          <div class="hero-meta">사진 ${trip.photo_count ?? 0}장</div>
          <div class="hero-go">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        </div>
      </div>
    </div>`;
}

/* ── Grid 렌더링 ── */
function renderGrid() {
	const grid = document.getElementById('tripsGrid');

	const cards = trips.map((trip, i) => `
    <div class="trip-card" style="animation-delay:${Math.min(i * 0.05, 0.25)}s" onclick="goTrip(${trip.id})">
      <div class="trip-thumb">
        <div class="trip-thumb-ph">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
        </div>
      </div>
      <div class="trip-info">
        <div class="trip-name">${trip.title}</div>
        <div class="trip-sub">${trip.location || ''}</div>
      </div>
    </div>`).join('');

	grid.innerHTML = cards + `
    <button class="add-trip-card" onclick="openModal('addModal')">
      <div class="add-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </div>
      <span class="add-label">여행 추가</span>
    </button>`;
}


/* ══ 날짜 피커 — 무한 스크롤 드럼롤 ══ */
const dateState = { target: null, year: null, month: null, day: null };
const picked = { start: null, end: null };

const ITEM_H = 40;
const CLONE_SET = 50;

function openDatePicker(target) {
	dateState.target = target;
	const now = picked[target] ? new Date(picked[target]) : new Date();
	dateState.year = now.getFullYear();
	dateState.month = now.getMonth() + 1;
	dateState.day = now.getDate();

	document.getElementById('datePickerTitle').textContent =
		target === 'start' ? '출발일 선택' : '귀가일 선택';

	buildDrum();
	openModal('datePickerModal');
}

function closeDatePicker() {
	closeModal('datePickerModal');
}

function buildDrum() {
	const months = Array.from({ length: 12 }, (_, i) => i + 1);
	const days = Array.from({ length: daysInMonth(dateState.year, dateState.month) }, (_, i) => i + 1);

	fillInfiniteDrum('drum-year', dateState.year, v => { dateState.year = v; rebuildDays(); });
	fillFiniteDrum('drum-month', months, dateState.month, false, v => { dateState.month = v; rebuildDays(); });
	fillFiniteDrum('drum-day', days, dateState.day, false, v => { dateState.day = v; });
}

function rebuildDays() {
	const days = Array.from({ length: daysInMonth(dateState.year, dateState.month) }, (_, i) => i + 1);
	const cur = Math.min(dateState.day, days.length);
	dateState.day = cur;
	fillFiniteDrum('drum-day', days, cur, false, v => { dateState.day = v; });
}

/* ── 무한 스크롤 (연도) ── */
function fillInfiniteDrum(id, selected, onChange) {
	const col = document.getElementById(id);
	const START = selected - CLONE_SET;
	const END = selected + CLONE_SET;
	const items = Array.from({ length: END - START + 1 }, (_, i) => START + i);

	col.innerHTML = items.map(v =>
		`<div class="drum-item${v === selected ? ' active' : ''}" data-val="${v}">${v}년</div>`
	).join('');

	col.scrollTop = CLONE_SET * ITEM_H;

	let ticking = false;
	col.onscroll = () => {
		if (ticking) return;
		ticking = true;
		requestAnimationFrame(() => {
			const i = Math.round(col.scrollTop / ITEM_H);
			const val = items[i];
			if (val == null) { ticking = false; return; }

			col.querySelectorAll('.drum-item').forEach((el, j) => el.classList.toggle('active', j === i));

			if (i < 10) _prependYearItems(col, items, onChange);
			else if (i > items.length - 10) _appendYearItems(col, items, onChange);

			onChange(val);
			ticking = false;
		});
	};
}

function _prependYearItems(col, items, onChange) {
	const addCount = 20;
	const newItems = Array.from({ length: addCount }, (_, i) => items[0] - addCount + i);
	const frag = document.createDocumentFragment();
	newItems.forEach(v => {
		const el = document.createElement('div');
		el.className = 'drum-item';
		el.dataset.val = v;
		el.textContent = v + '년';
		frag.appendChild(el);
		items.unshift(v);
	});
	col.insertBefore(frag, col.firstChild);
	col.scrollTop += addCount * ITEM_H;
}

function _appendYearItems(col, items, onChange) {
	const addCount = 20;
	Array.from({ length: addCount }, (_, i) => items[items.length - 1] + i + 1).forEach(v => {
		const el = document.createElement('div');
		el.className = 'drum-item';
		el.dataset.val = v;
		el.textContent = v + '년';
		col.appendChild(el);
		items.push(v);
	});
}

/* ── 유한 스크롤 (월/일) ── */
function fillFiniteDrum(id, items, selected, _unused, onChange) {
	const col = document.getElementById(id);
	const REPS = 3;
	const repeated = Array.from({ length: REPS }, () => items).flat();
	const midStart = items.length;

	col.innerHTML = repeated.map((v, absI) => {
		const active = absI >= midStart && absI < midStart + items.length && v === selected;
		const label = id === 'drum-month' ? v + '월' : v + '일';
		return `<div class="drum-item${active ? ' active' : ''}" data-val="${v}">${label}</div>`;
	}).join('');

	col.scrollTop = (midStart + items.indexOf(selected)) * ITEM_H;

	let ticking = false;
	col.onscroll = () => {
		if (ticking) return;
		ticking = true;
		requestAnimationFrame(() => {
			let scrollTop = col.scrollTop;
			const totalH = items.length * ITEM_H;

			if (scrollTop < totalH * 0.25) col.scrollTop = scrollTop += totalH;
			else if (scrollTop > totalH * 2.25) col.scrollTop = scrollTop -= totalH;

			const i = Math.round(scrollTop / ITEM_H);
			const val = repeated[i];
			if (val == null) { ticking = false; return; }

			col.querySelectorAll('.drum-item').forEach((el, j) => el.classList.toggle('active', j === i));
			onChange(val);
			ticking = false;
		});
	};
}

function confirmDate() {
	const { target, year, month, day } = dateState;
	const mm = String(month).padStart(2, '0');
	const dd = String(day).padStart(2, '0');

	picked[target] = `${year}-${mm}-${dd}`;

	const label = document.getElementById(`label-${target}`);
	const btn = document.getElementById(`btn-${target}`);
	label.textContent = `${year}.${mm}.${dd}`;
	label.className = 'date-picker-value';
	btn.classList.add('has-value');

	closeDatePicker();
}

function resetDatePicker() {
	['start', 'end'].forEach(t => {
		picked[t] = null;
		const label = document.getElementById(`label-${t}`);
		if (label) { label.textContent = '날짜 선택'; label.className = 'date-picker-placeholder'; }
		document.getElementById(`btn-${t}`)?.classList.remove('has-value');
	});
}

function daysInMonth(y, m) {
	return new Date(y, m, 0).getDate();
}



/* ── 페이지 이동 ── */
function goTrip(id) {
	Router.push(`/html/trip.html?id=${id}`, document.querySelector('.app'));
}


/* ── 여행 추가 ── */
function submitTrip() {
	const title = document.getElementById('f-title').value.trim();
	const location = document.getElementById('f-location').value.trim();
	const memo = document.getElementById('f-memo').value.trim();

	if (!title) {
		showAlert('여행 제목을 입력해주세요.');
		document.getElementById('f-title').focus();
		return;
	}

	const btn = document.getElementById('btnSubmit');
	btn.classList.add('loading');
	btn.disabled = true;

	const payload = {
		title,
		location: location || null,
		started_at: picked.start || null,
		ended_at: picked.end || null,
		memo: memo || null,
	};

	API.trips.create(payload, (res) => {
		const newTrip = { photo_count: 0, ...payload, ...res };
		trips.unshift(newTrip);
		renderHero(trips[0]);
		renderGrid();
		closeModal('addModal');
		['f-title', 'f-location', 'f-memo'].forEach(id => document.getElementById(id).value = '');
		resetDatePicker();
		btn.classList.remove('loading');
		btn.disabled = false;
	});
}
document.querySelector('.nav-logo').addEventListener('click', () => {
	location.reload();
});

// 로그인 성공 후
async function onLoginSuccess() {
	try {
		console.log('push 시작');

		if (!('serviceWorker' in navigator)) {
			console.log('serviceWorker 미지원');
			return;
		}

		if (!('PushManager' in window)) {
			console.log('PushManager 미지원');
			return;
		}

		if (!('Notification' in window)) {
			console.log('Notification 미지원');
			return;
		}

		console.log('현재 권한:', Notification.permission);

		const reg0 = await navigator.serviceWorker.getRegistration();
		console.log('현재 등록 SW:', reg0);

		const permission = await Notification.requestPermission();
		console.log('권한 요청 결과:', permission);

		if (permission !== 'granted') return;

		const reg = await navigator.serviceWorker.ready;
		console.log('ready SW:', reg);

		let sub = await reg.pushManager.getSubscription();
		console.log('기존 subscription:', sub);

		if (!sub) {
			console.log('subscribe 진입');
			sub = await reg.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey: urlBase64ToUint8Array('BD1MXtvMmgVronEsvya_b51vHZhMDY9sVoPq8dZgQlNQmTQqFF2tRXAkkPe8vY8gSTG9PKeF-OT6ROPI8z1yng4'),
			});
			console.log('subscribe 완료', sub);
		}

		const res = await fetch('/api/push/subscribe', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(sub),
		});

		console.log('서버 저장 응답:', res.status);
	} catch (e) {
		console.error('push subscribe 에러', e);
	}
}
/*async function onLoginSuccess() {
	if (!('PushManager' in window)) return;
	if (Notification.permission === 'denied') return;

	const permission = await Notification.requestPermission();
	if (permission !== 'granted') return;

	const reg = await navigator.serviceWorker.ready;
	let sub = await reg.pushManager.getSubscription();
	if (!sub) {
		sub = await reg.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey: urlBase64ToUint8Array('BD1MXtvMmgVronEsvya_b51vHZhMDY9sVoPq8dZgQlNQmTQqFF2tRXAkkPe8vY8gSTG9PKeF-OT6ROPI8z1yng4'),
		});
	}

	fetch('/api/push/subscribe', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(sub),
	});
}*/

function urlBase64ToUint8Array(base64) {
	const pad = '='.repeat((4 - base64.length % 4) % 4);
	const b64 = (base64 + pad).replace(/-/g, '+').replace(/_/g, '/');
	const raw = atob(b64);
	return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

showLoading();
init();
