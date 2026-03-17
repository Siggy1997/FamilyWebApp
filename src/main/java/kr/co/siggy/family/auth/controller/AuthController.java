package kr.co.siggy.family.auth.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import kr.co.siggy.family.auth.service.AuthService;
import kr.co.siggy.family.common.BaseController;
import kr.co.siggy.family.common.ResponseDTO;

@RestController
@RequestMapping(value = "/api/auth")
public class AuthController extends BaseController {

	@Autowired
	private AuthService authService;

	/** 여행 게획 목록 조회 */
	@PostMapping("/login")
	public ResponseDTO login(@RequestBody Map<String, Object> data) {
		Map<String, Object> profile = authService.login(data);
		if (profile == null) {
			return ResponseDTO.loginFail("아이디 또는 비밀번호가 틀렸어요.");
		} else {
		}
		return ResponseDTO.ok(profile);
	}

}
