(function() {
	const BASE = '/';
	const VERSION = new Date().toISOString().slice(0, 16).replace(/[-T:]/g, '');

	// ── pageName 추출 (CSS/JS 파일명 결정)
	const _strIdx = window.location.href.indexOf('/html');
	const _endIdx = window.location.href.indexOf('.html');
	const pageName = (_strIdx !== -1 && _endIdx !== -1)
		? window.location.href.substring(_strIdx + 6, _endIdx)
		: null;

	// ── CSS 동기 삽입 (FOUC 방지 — 렌더링 전에 블로킹 로드)
	const styles = [
		'css/common/common.css',
		...(pageName ? ['css/' + pageName + '.css'] : []),
	];
	document.write(
		styles.map(href => `<link rel="stylesheet" href="${BASE}${href}?v=${VERSION}">`).join('')
	);

	// ── manifest
	const manifest = document.createElement('link');
	manifest.rel = 'manifest';
	manifest.href = '/manifest.json?v=' + VERSION;
	document.head.appendChild(manifest);

	// ── meta 태그
	const metas = [
		{ name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover' },
		{ name: 'mobile-web-app-capable', content: 'yes' },
		{ name: 'apple-mobile-web-app-capable', content: 'yes' },
/*		{ name: 'apple-mobile-web-app-status-bar-style', content: 'default' },*/
		{ name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' }
	];
	metas.forEach(({ name, content }) => {
		const meta = document.createElement('meta');
		meta.name = name;
		meta.content = content;
		document.head.appendChild(meta);
	});

	// ── JS 순차 로드
	const scripts = [
		'js/common/api.js',
		'js/common/popup.js',
		'js/common/common.js',
		...(pageName ? ['js/' + pageName + '.js'] : []),
	];

	function loadNext(index) {
		if (index >= scripts.length) return;
		const script = document.createElement('script');
		script.src = BASE + scripts[index] + '?v=' + VERSION;
		script.onload = () => loadNext(index + 1);
		script.onerror = () => loadNext(index + 1);
		document.body.appendChild(script);
	}

	if ('serviceWorker' in navigator) {
		navigator.serviceWorker.register('/sw.js', { scope: '/' });
	}

	if (document.body) {
		loadNext(0);
	} else {
		document.addEventListener('DOMContentLoaded', () => loadNext(0));
	}

})();