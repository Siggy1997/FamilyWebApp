(function() {
	const BASE = '/';
	
	if ('serviceWorker' in navigator) {
		navigator.serviceWorker.register('/sw.js', { scope: '/' });
	}
	
	// ── manifest
	const manifest = document.createElement('link');
	manifest.rel = 'manifest';
	manifest.href = '/manifest.json';
	document.head.appendChild(manifest);
	
	const metas = [
		{ name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no' },
		{ name: 'mobile-web-app-capable', content: 'yes' },
		{ name: 'apple-mobile-web-app-capable', content: 'yes' },
		{ name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
	];
	metas.forEach(({ name, content }) => {
		const meta = document.createElement('meta');
		meta.name = name;
		meta.content = content;
		document.head.appendChild(meta);
	});

	const _strIdx = window.location.href.indexOf('/html');
	const _endIdx = window.location.href.indexOf('.html');
	const pageName = (_strIdx !== -1 && _endIdx !== -1)
		? window.location.href.substring(_strIdx + 6, _endIdx)
		: null;

	const styles = [
		'css/common/common.css',
		...(pageName ? ['css/' + pageName + '.css'] : []),
	];

	styles.forEach(href => {
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = BASE + href;
		document.head.appendChild(link);
	});

	const scripts = [
		'js/common/api.js',
		'js/common/popup.js',
		'js/common/common.js',
		'js/' + pageName + '.js',
	];
	console.log(styles);

	function loadNext(index) {
		if (index >= scripts.length) return;
		const script = document.createElement('script');
		script.src = BASE + scripts[index];
		script.onload = () => loadNext(index + 1);
		script.onerror = () => loadNext(index + 1);
		document.body.appendChild(script);
	}

	// body가 준비된 후 실행
	if (document.body) {
		loadNext(0);
	} else {
		document.addEventListener('DOMContentLoaded', () => loadNext(0));
	}
	
})();