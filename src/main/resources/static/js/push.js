/* ═══════════════════════════════
   push.js — 알림 리스트
═══════════════════════════════ */

const id = sessionStorage.getItem('id');
const group_id = sessionStorage.getItem("group_id");

function init() {
	API.push.list({ id, group_id }, (res) => {
		renderList(res ?? []);
	});
}

function renderList(list) {
	const container = document.getElementById('pushList');

	if (!list.length) {
		container.innerHTML = `
			<div class="push-empty">
				<svg viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" stroke-width="1.5" width="48" height="48">
					<path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
				</svg>
				<span class="push-empty-text">알림 내역이 없어요</span>
			</div>`;
		return;
	}

	// 날짜별 그룹핑
	function getLocalDate(offsetDays = 0) {
		const d = new Date();
		d.setDate(d.getDate() + offsetDays);
		return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
	}

	const today = getLocalDate(0);
	const yesterday = getLocalDate(-1);

	// 날짜별 그룹핑
	const groups = {};
	list.forEach(item => {
		const date = (item.created_at ?? '').substring(0, 10);
		if (!groups[date]) groups[date] = [];
		groups[date].push(item);
	});


	function dateLabel(d) {
		if (d === today) return '오늘';
		if (d === yesterday) return '어제';
		return d.replace(/-/g, '.');
	}

	let html = '';
	let globalIdx = 0;

	Object.keys(groups).sort((a, b) => b.localeCompare(a)).forEach(date => {
		const items = groups[date];
		html += `<div class="date-group"><div class="date-label">${dateLabel(date)}</div>`;
		items.forEach((item, i) => {
			html += `
				<div class="push-item" style="animation-delay:${Math.min(globalIdx * 0.04, 0.24)}s"
				onclick="onItemClick(${item.idx}, '${(item.target_url ?? '').replace(/'/g, "\\'")}')" >					
					<div class="push-icon">
						<svg viewBox="0 0 24 24" fill="none" stroke="var(--brown)" stroke-width="1.7" width="19" height="19">
							<path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
						</svg>
					</div>
					<div class="push-content">
						<div class="push-body">${item.msg ?? ''}</div>
						<div class="push-meta">
							<span class="push-time">${(item.created_at ?? '').substring(11, 16)}</span>
						</div>
					</div>
					<div class="new-push  ${item.read_YN === 'N' ? 'notRead' : ''}"> 
					</div>
				</div>
				${i < items.length - 1 ? '<div class="push-divider"></div>' : ''}
			`;
			globalIdx++;
		});
		html += `</div>`;
	});

	container.innerHTML = html;
}

function onItemClick(idx, url) {
	API.push.read({idx}, (res) => {
		console.log(res);
	})
	if (!url) return;
	Router.push(url, document.querySelector('.app'));
	/*location.replace(url);*/
}

init();