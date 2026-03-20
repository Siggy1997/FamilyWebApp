const API = (() => {
	const BASE_URL = '/api';

	async function request(method, path, body = null, onSuccess) {
		const options = {
			method,
			headers: { 'Content-Type': 'application/json' },
		};
		if (body) options.body = JSON.stringify(body);

		try {
			console.log("### URL : ",BASE_URL + path);
			console.log("### REQUEST : ", body);
			const res = await fetch(`${BASE_URL}${path}`, options);
			// 서버 애러
			if (!res.ok) {
				const err = await res.json().catch(() => ({ message: res.statusText }));
				console.log('서버 오류 : ', err)
			    showAlert('서버 오류가 발생했어요.');
				return;
			}
			const rst = await res.json();
			console.log("### RESPONSE : ", rst);
			// 로그인 에러
			if (rst.resultCode === '200') {
				console.log("success");
				onSuccess?.(rst.data);
			} else if (rst.resultCode === '997') {
				console.log("로그인 실패 : ", rst.resultMsg);
			    showAlert('로그인 실패', rst.resultMsg);
			    localStorage.clear();
			    return;
			} else {
			    showAlert('실패');
			}
		} catch (e) {
			console.error(`[API Error] ${method} ${path}`, e.message);
			showAlert('네트워크 오류가 발생했어요.');
		}
	}

	return {
		login: {
			signIn(data = {}, onSuccess) {
				return request('POST', '/auth/login', data, onSuccess);
			},
		},
		trip: {
			group(data = {}, onSuccess) {
				return request('POST', '/trip/group', data, onSuccess);
			},
			list(data = {}, onSuccess) {
				return request('POST', '/trip/list', data, onSuccess);
			},
			detail(data = {}, onSuccess) {
				return request('POST', '/trip/detail', data, onSuccess);
			},
			create(data = {}, onSuccess) {
				return request('POST', '/trip/create', data, onSuccess);
			},
			update(data = {}, onSuccess) {
				return request('POST', '/trip/update', data, onSuccess);
			},
			delete(data = {}, onSuccess) {
				return request('POST', '/trip/delete', data, onSuccess);
			},
		},
		photo: {
			list(data = {}, onSuccess) {
				return request('POST', '/photo/list', data, onSuccess);
			},
			upload(data = {}, onSuccess) {
				return request('POST', '/photo/create', data, onSuccess);
			},
			delete(data = {}, onSuccess) {
				return request('POST', '/photo/delete', data, onSuccess);
			},
		},
		video: {
			list(data = {}, onSuccess) {
				return request('POST', '/video/list', data, onSuccess);
			},
			create(data = {}, onSuccess) {
				return request('POST', '/video/create', data, onSuccess);
			},
			delete(data = {}, onSuccess) {
				return request('POST', '/video/delete', data, onSuccess);
			},
		},
		highlight: {
			list(data = {}, onSuccess) {
				return request('POST', '/highlight/list', data, onSuccess);
			},
			create(data = {}, onSuccess) {
				return request('POST', '/highlight/create', data, onSuccess);
			},
			delete(data = {}, onSuccess) {
				return request('POST', '/highlight/delete', data, onSuccess);
			},
		},
		push: {
			send(data = {}, onSuccess) {
				return request('POST', '/push/send', data, onSuccess);
			},
		}
	};
})();

