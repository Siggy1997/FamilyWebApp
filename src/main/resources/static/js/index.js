/* ══ 날짜 피커 — 무한 스크롤 드럼롤 ══ */
const dateState = { target: null, year: null, month: null, day: null };
const picked    = { start: null, end: null };

const ITEM_H    = 40;
const CLONE_SET = 50;   // 위아래로 복제할 세트 수 (연도용 넉넉하게)

function openDatePicker(target) {
  dateState.target = target;
  const now = picked[target] ? new Date(picked[target]) : new Date();
  dateState.year  = now.getFullYear();
  dateState.month = now.getMonth() + 1;
  dateState.day   = now.getDate();

  document.getElementById('datePickerTitle').textContent =
    target === 'start' ? '출발일 선택' : '귀가일 선택';

  buildDrum();
  document.getElementById('datePickerModal').classList.add('show');
  document.getElementById('overlay').classList.add('show');
}

function closeDatePicker() {
  document.getElementById('datePickerModal').classList.remove('show');
  document.getElementById('overlay').classList.remove('show');
}

function buildDrum() {
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days   = Array.from({ length: daysInMonth(dateState.year, dateState.month) }, (_, i) => i + 1);

  fillInfiniteDrum('drum-year',  null,   dateState.year,  true,  v => { dateState.year  = v; rebuildDays(); });
  fillFiniteDrum  ('drum-month', months, dateState.month, false, v => { dateState.month = v; rebuildDays(); });
  fillFiniteDrum  ('drum-day',   days,   dateState.day,   false, v => { dateState.day   = v; });
}

function rebuildDays() {
  const days = Array.from(
    { length: daysInMonth(dateState.year, dateState.month) },
    (_, i) => i + 1
  );
  const cur = Math.min(dateState.day, days.length);
  dateState.day = cur;
  fillFiniteDrum('drum-day', days, cur, false, v => { dateState.day = v; });
}

/* ── 무한 스크롤 (연도) ── */
function fillInfiniteDrum(id, _unused, selected, isYear, onChange) {
  const col = document.getElementById(id);
  col.innerHTML = '';

  // 중앙 기준 앞뒤로 CLONE_SET 년 생성
  const START = selected - CLONE_SET;
  const END   = selected + CLONE_SET;
  const items = Array.from({ length: END - START + 1 }, (_, i) => START + i);
  const centerIdx = CLONE_SET; // selected 위치

  col.innerHTML = items.map(v =>
    `<div class="drum-item${v === selected ? ' active' : ''}" data-val="${v}">${v}년</div>`
  ).join('');

  col.scrollTop = centerIdx * ITEM_H;

  let ticking = false;
  col.onscroll = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const i   = Math.round(col.scrollTop / ITEM_H);
        const val = items[i];
        if (val == null) { ticking = false; return; }

        col.querySelectorAll('.drum-item').forEach((el, j) => {
          el.classList.toggle('active', j === i);
        });

        // 끝에 가까워지면 앞뒤로 아이템 추가 (가상 무한)
        if (i < 10) {
          _prependYearItems(col, items, val, onChange);
        } else if (i > items.length - 10) {
          _appendYearItems(col, items, val, onChange);
        }

        onChange(val);
        ticking = false;
      });
      ticking = true;
    }
  };
}

function _prependYearItems(col, items, curVal, onChange) {
  const first   = items[0];
  const addCount = 20;
  const newItems = Array.from({ length: addCount }, (_, i) => first - addCount + i);

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
  // 스크롤 위치 보정 (prepend 하면 밀리므로)
  col.scrollTop += addCount * ITEM_H;
}

function _appendYearItems(col, items, curVal, onChange) {
  const last     = items[items.length - 1];
  const addCount = 20;
  const newItems = Array.from({ length: addCount }, (_, i) => last + i + 1);

  newItems.forEach(v => {
    const el = document.createElement('div');
    el.className = 'drum-item';
    el.dataset.val = v;
    el.textContent = v + '년';
    col.appendChild(el);
    items.push(v);
  });
}

/* ── 유한 스크롤 (월/일) — snap 루프 ── */
function fillFiniteDrum(id, items, selected, _unused, onChange) {
  const col = document.getElementById(id);
  // 무한처럼 보이도록 3벌 복제
  const REPS = 3;
  const repeated = Array.from({ length: REPS }, () => items).flat();
  const midStart = items.length; // 두번째 세트 시작 인덱스

  col.innerHTML = repeated.map((v, absI) => {
    const active = absI >= midStart && absI < midStart + items.length && v === selected;
    const label  = id === 'drum-month' ? v + '월' : v + '일';
    return `<div class="drum-item${active ? ' active' : ''}" data-val="${v}">${label}</div>`;
  }).join('');

  // 선택값을 두 번째 세트 위치로 스크롤
  const selIdx  = midStart + items.indexOf(selected);
  col.scrollTop = selIdx * ITEM_H;

  let ticking = false;
  col.onscroll = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        let scrollTop = col.scrollTop;
        const totalH  = items.length * ITEM_H;

        // 루프: 첫 세트 끝으로 가면 중간 세트로 점프
        if (scrollTop < totalH * 0.25) {
          col.scrollTop = scrollTop + totalH;
          scrollTop = col.scrollTop;
        } else if (scrollTop > totalH * 2.25) {
          col.scrollTop = scrollTop - totalH;
          scrollTop = col.scrollTop;
        }

        const i   = Math.round(scrollTop / ITEM_H);
        const val = repeated[i];
        if (val == null) { ticking = false; return; }

        col.querySelectorAll('.drum-item').forEach((el, j) => {
          el.classList.toggle('active', j === i);
        });

        onChange(val);
        ticking = false;
      });
      ticking = true;
    }
  };
}

function confirmDate() {
  const { target, year, month, day } = dateState;
  const mm  = String(month).padStart(2, '0');
  const dd  = String(day).padStart(2, '0');
  const val = `${year}-${mm}-${dd}`;

  picked[target] = val;

  const label = document.getElementById(`label-${target}`);
  const btn   = document.getElementById(`btn-${target}`);
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
    const btn = document.getElementById(`btn-${t}`);
    if (btn) btn.classList.remove('has-value');
  });
}

function daysInMonth(y, m) {
  return new Date(y, m, 0).getDate();
}

/* ═══════════════════════════════
   index.js — 메인 페이지 전용
═══════════════════════════════ */

let trips = [];
const appEl = document.getElementById('app');

/* ── 스크롤 → nav 전환 ── */
const scrollWrap = document.getElementById('scrollWrap');
const navBar     = document.getElementById('navBar');
const bigHeader  = document.getElementById('bigHeader');

scrollWrap.addEventListener('scroll', () => {
  const threshold = bigHeader.offsetHeight - 40;
  navBar.classList.toggle('scrolled', scrollWrap.scrollTop > threshold);
}, { passive: true });

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
  ].map(g => `<div style="background:${g};"></div>`);

  sec.innerHTML = `
    <div class="section-label">최근 여행</div>
    <div class="hero-card" onclick="goTrip(${trip.id})">
      <div class="hero-ph">${cells.join('')}</div>
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
  let html = '';

  trips.forEach((trip, i) => {
    const delay = Math.min(i * 0.05, 0.25);
    const thumb = `
      <div class="trip-thumb-ph">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
      </div>`;

    html += `
      <div class="trip-card" style="animation-delay:${delay}s" onclick="goTrip(${trip.id})">
        <div class="trip-thumb">${thumb}</div>
        <div class="trip-info">
          <div class="trip-name">${trip.title}</div>
          <div class="trip-sub">${trip.location || ''}</div>
        </div>
      </div>`;
  });

  html += `
    <button class="add-trip-card" onclick="openModal('addModal')">
      <div class="add-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </div>
      <span class="add-label">여행 추가</span>
    </button>`;

  grid.innerHTML = html;
}

/* ── 페이지 이동 ── */
function goTrip(id) {
  Router.push(`/trip.html?id=${id}`, appEl);
}

/* ── 데이터 로드 ── */
async function loadTrips() {
  try {
    trips = await TripsAPI.trips.list();
    renderHero(trips[0] ?? null);
    renderGrid();
  } catch (e) {
    showToast('여행 목록을 불러오지 못했어요.');
    console.error(e);
  }
}

/* ── 여행 추가 ── */
async function submitTrip() {
  const title    = document.getElementById('f-title').value.trim();
  const location = document.getElementById('f-location').value.trim();
  const start    = picked.start || null;
  const end      = picked.end   || null;
  const memo     = document.getElementById('f-memo').value.trim();

  if (!title) {
    showToast('여행 제목을 입력해주세요.');
    document.getElementById('f-title').focus();
    return;
  }

  const btn = document.getElementById('btnSubmit');
  btn.classList.add('loading');
  btn.disabled = true;

  // 폼에서 입력한 값을 먼저 로컬에 저장
  const payload = {
    title,
    location:   location || null,
    started_at: start    || null,
    ended_at:   end      || null,
    memo:       memo     || null,
  };

  try {
    const res = await TripsAPI.trips.create(payload);

    // 서버가 id만 돌려줘도 폼 입력값으로 채워서 바로 렌더
    const newTrip = {
      photo_count: 0,
      video_count: 0,
      ...payload,
      ...res,  // 서버 응답값으로 덮어씀 (id, created_at 등)
    };

    trips.unshift(newTrip);
    renderHero(trips[0]);
    renderGrid();
    closeModal('addModal');
    ['f-title', 'f-location', 'f-memo']
      .forEach(id => document.getElementById(id).value = '');
    resetDatePicker();
    showToast(`"${newTrip.title}" 추가됐어요!`);
  } catch (e) {
    showToast('추가에 실패했어요.');
    console.error(e);
  } finally {
    btn.classList.remove('loading');
    btn.disabled = false;
  }
}

/* ── 초기 실행 ── */
loadTrips();