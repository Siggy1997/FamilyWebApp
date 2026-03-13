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
		//localStorage에 저장
		sessionStorage.setItem('id', 			res.id);
		sessionStorage.setItem('group_id', 		res.group_id);
		sessionStorage.setItem('name', 			res.name);
		sessionStorage.setItem('avatar_path', 	res.avatar_path);
		
		if(document.getElementById('auto-login').checked){
			localStorage.setItem('autoLogin', true);
			localStorage.setItem('savedId', id);
			localStorage.setItem('savedPw', pw);
						
		} else if (document.getElementById('chk-remember').checked) {
			localStorage.clear();
			localStorage.setItem('savedId', id);
		} else {
			localStorage.clear();
		}
		
		location.replace('/html/index.html');
	});
	btn.classList.remove('loading');
	btn.disabled = false;
}

document.addEventListener('keydown', e => {
	if (e.key === 'Enter') handleLogin();
});

init();