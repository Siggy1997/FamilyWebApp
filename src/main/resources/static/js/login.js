function init() {
	/** 아이디 저장 여부 **/
	const autoLogin = localStorage.getItem('autoLogin');
	const savedId = localStorage.getItem('savedId');
	const savedPw = localStorage.getItem('savedPw');
	if (autoLogin){
		showLoading();
		document.getElementById('input-id').value = savedId;
		document.getElementById('input-pw').value = savedPw;
		document.getElementById('chk-remember').checked = true;
		document.getElementById('auto-login').checked = true;
		handleLogin();
	}
	if (savedId) {
		document.getElementById('input-id').value = savedId;
		document.getElementById('chk-remember').checked = true;
	}
}

/** 비밀번호 토글 **/
function togglePw() {
	const input = document.getElementById('input-pw');
	const eyeOn = document.getElementById('icon-eye');
	const eyeOff = document.getElementById('icon-eye-off');
	if (input.type === 'password') {
		input.type = 'text';
		eyeOn.style.display = 'none';
		eyeOff.style.display = 'block';
	} else {
		input.type = 'password';
		eyeOn.style.display = 'block';
		eyeOff.style.display = 'none';
	}
}

/** 아이디 / 비밀번호 검증 **/
function validate() {
	let ok = true;
	const id = document.getElementById('input-id').value.trim();
	const pw = document.getElementById('input-pw').value;
	const fieldId = document.getElementById('field-id');
	const fieldPw = document.getElementById('field-pw');

	fieldId.classList.remove('has-error');
	fieldPw.classList.remove('has-error');

	if (!id) { fieldId.classList.add('has-error'); ok = false; }
	if (!pw) { fieldPw.classList.add('has-error'); ok = false; }
	return ok;
}

/** 로그인 **/
function handleLogin() {
	if (!validate()) return;
	// 버튼 로딩 표시
	const id = document.getElementById('input-id').value.trim()
	const pw = document.getElementById('input-pw').value;

	const btn = document.getElementById('btnLogin');
	btn.classList.add('loading');
	btn.disabled = true;
	
	// requestData
	const reqData = {id,pw,};

	// 통신
	API.login.signIn(reqData, (res) => {
			btn.classList.add('loading');
		//localStorage에 저장
		sessionStorage.setItem('id', 			res.id);
		sessionStorage.setItem('group_id', 		res.group_id);
		sessionStorage.setItem('name', 			res.name);
		sessionStorage.setItem('avatar_path', 	res.avatar_path);
		
		if(document.getElementById('auto-login').checked){
			localStorage.setItem('autoLogin', true);
			localStorage.setItem('savedId', 	id);
			localStorage.setItem('savedPw', 	pw);
			localStorage.setItem('group_id',	res.group_id);
			localStorage.setItem('name', 		res.name);
			localStorage.setItem('avatar_path', res.avatar_path);
						
		} else if (document.getElementById('chk-remember').checked) {
			localStorage.clear();
			localStorage.setItem('savedId', id);
		} else {
			localStorage.clear();
		}
		
/*		onLoginSuccess(res.id);*/
		
		location.replace('/html/index.html');
	});
	btn.classList.remove('loading');
	btn.disabled = false;
}


// 로그인 성공 후
async function onLoginSuccess(id) {
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
	const payload = {
		...sub.toJSON(),
		id: id,
    };
	API.push.subscribe(payload, (res) => {
		location.replace('/html/index.html');
	});
}

function urlBase64ToUint8Array(base64) {
  const pad = '='.repeat((4 - base64.length % 4) % 4);
  const b64 = (base64 + pad).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}


document.addEventListener('keydown', e => {
	if (e.key === 'Enter') handleLogin();
});

init();