/**
 * memories. — API Layer
 * 백엔드 BASE_URL만 바꾸면 실제 서버와 연동됩니다.
 */
console.log
const API = (() => {
	const BASE_URL = 'http://172.16.200.194:8082/api'; // 예: 'http://raspberrypi.local:3000/api'

	async function request(method, path, body = null) {
		const options = {
			method,
			headers: { 'Content-Type': 'application/json' },
		};
		if (body) options.body = JSON.stringify(body);
		console.log("#### Request (path) : ", path);
		console.log("#### Request (req): ", body);

		const res = await fetch(`${BASE_URL}${path}`, options);
		if (!res.ok) {
			const err = await res.json().catch(() => ({ message: res.statusText }));
			throw new Error(err.message || '서버 오류가 발생했어요.');
		}
		const data = await res.json();
		console.log("#### Response (data): ", data);
		return data;
	}

	return {
		// ── 여행 ──────────────────────────────────
		trips: {
			/** 전체 여행 목록 조회 */
			list(data = {}) {
				return request('POST', '/trip/list', data);
			},
			//여행 단건 조회
			detail(data = {}) {
				return request('POST', '/trip/detail', data);
			},
			/** 여행 추가*/
			create(data = {}) {
				return request('POST', '/trip/create', data);
			},
			/** 여행 수정
			 */
			update(data = {}) {
				return request('POST', '/trip/update', data);
			},
			/** 여행 삭제
			 * @param {{ id }} data
			 */
			delete(data = {}) {
				return request('POST', '/trip/delete', data);
			},
		},

		// ── 사진 ──────────────────────────────────
		photos: {
			/** 여행 사진 목록
			 * @param {{ trip_id }} data
			 */
			list(data = {}) {
				return request('POST', '/photo/list', data);
			},
			/** 사진 추가
			 * @param {{ trip_id, file_path, file_name, taken_at?, memo? }} data
			 */
			create(data = {}) {
				return request('POST', '/photo/create', data);
			},
			/** 사진 삭제
			 * @param {{ id }} data
			 */
			delete(data = {}) {
				return request('POST', '/photo/delete', data);
			},
		},

		// ── 동영상 ────────────────────────────────
		videos: {
			/** 여행 동영상 목록
			 * @param {{ trip_id }} data
			 */
			list(data = {}) {
				return request('POST', '/video/list', data);
			},
			/** 동영상 추가
			 * @param {{ trip_id, file_path, file_name, duration_sec?, memo? }} data
			 */
			create(data = {}) {
				return request('POST', '/video/create', data);
			},
			/** 동영상 삭제
			 * @param {{ id }} data
			 */
			delete(data = {}) {
				return request('POST', '/video/delete', data);
			},
		},

		// ── 하이라이트 ────────────────────────────
		highlights: {
			/** 하이라이트 목록
			 * @param {{ trip_id? }} data   trip_id 없으면 전체
			 */
			list(data = {}) {
				return request('POST', '/highlight/list', data);
			},
			/** 하이라이트 생성 요청
			 * @param {{ trip_id?, title, clip_ids[] }} data
			 */
			create(data = {}) {
				return request('POST', '/highlight/create', data);
			},
			/** 하이라이트 삭제
			 * @param {{ id }} data
			 */
			delete(data = {}) {
				return request('POST', '/highlight/delete', data);
			},
		},
	};
})();

// ── Mock (백엔드 없을 때 테스트용) ────────────────
const MOCK_TRIPS = [
	{ id: 1, title: '제주 여름 여행', location: '제주도', started_at: '2024-08-12', ended_at: '2024-08-15', photo_count: 87, video_count: 3, emoji: '🌊' },
	{ id: 2, title: '속초 나들이', location: '속초', started_at: '2024-05-03', ended_at: '2024-05-05', photo_count: 64, video_count: 1, emoji: '🏔️' },
	{ id: 3, title: '부산 겨울 여행', location: '부산', started_at: '2023-12-23', ended_at: '2023-12-26', photo_count: 112, video_count: 5, emoji: '🎡' },
	{ id: 4, title: '경주 역사 탐방', location: '경주', started_at: '2023-09-14', ended_at: '2023-09-16', photo_count: 78, video_count: 2, emoji: '🏯' },
];

const MockAPI = {
	trips: {
		list(data = {}) {
			return Promise.resolve([...MOCK_TRIPS]);
		},
		get(data = {}) {
			return Promise.resolve(MOCK_TRIPS.find(t => t.id === data.id) ?? null);
		},
		create(data = {}) {
			const trip = { id: Date.now(), photo_count: 0, video_count: 0, emoji: '✈️', ...data };
			MOCK_TRIPS.unshift(trip);
			return Promise.resolve(trip);
		},
		update(data = {}) {
			const idx = MOCK_TRIPS.findIndex(t => t.id === data.id);
			if (idx !== -1) MOCK_TRIPS[idx] = { ...MOCK_TRIPS[idx], ...data };
			return Promise.resolve(MOCK_TRIPS[idx] ?? null);
		},
		delete(data = {}) {
			const idx = MOCK_TRIPS.findIndex(t => t.id === data.id);
			if (idx !== -1) MOCK_TRIPS.splice(idx, 1);
			return Promise.resolve({ ok: true });
		},
	},
	photos: {
		list(data = {}) { return Promise.resolve([]); },
		create(data = {}) { return Promise.resolve({ id: Date.now(), ...data }); },
		delete(data = {}) { return Promise.resolve({ ok: true }); },
	},
	videos: {
		list(data = {}) { return Promise.resolve([]); },
		create(data = {}) { return Promise.resolve({ id: Date.now(), ...data }); },
		delete(data = {}) { return Promise.resolve({ ok: true }); },
	},
	highlights: {
		list(data = {}) { return Promise.resolve([]); },
		create(data = {}) { return Promise.resolve({ id: Date.now(), status: 'pending', ...data }); },
		delete(data = {}) { return Promise.resolve({ ok: true }); },
	},
};

// 개발 중엔 MockAPI, 실서버 연동 시 API 로 교체
const TripsAPI = API;