package kr.co.siggy.family.push.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpSession;
import kr.co.siggy.family.common.BaseController;
import kr.co.siggy.family.common.ResponseDTO;
import kr.co.siggy.family.push.service.PushNotiService;

@RestController
@RequestMapping(value = "/api/push")
public class PushNotiController extends BaseController {
 
	@Autowired
	private PushNotiService pushService;

	/* ── 구독 등록 ── */
	@PostMapping("/subscribe")
	public ResponseDTO subscribe(@RequestBody Map<String, Object> body, HttpSession session) {
		logger.info("api/push/subscribe");
	    String id = (String) body.get("id");
	    if (id == null) return ResponseDTO.fail("fail");

	    Map<String, String> keys = (Map<String, String>) body.get("keys");

	    // service로 넘길 data 구성
	    Map<String, Object> data = new HashMap<>();
	    data.put("id",   id);
	    data.put("endpoint", body.get("endpoint"));
	    data.put("p256dh",   keys.get("p256dh"));
	    data.put("auth",     keys.get("auth"));
	    logger.info("{}", body.get("endpoint"));
	    logger.info("{}", keys.get("p256dh"));
	    logger.info("{}", keys.get("auth"));
	    pushService.subscribe(data);
	    return ResponseDTO.ok();
	}

	/* ── 구독 취소 ── */
	@PostMapping("/unsubscribe")
	public ResponseDTO unsubscribe(@RequestBody Map<String, Object> body) {
		pushService.unsubscribe(body);
		return ResponseDTO.ok();
	}
	
	@PostMapping("/group")
	public ResponseDTO sendToGroup(@RequestBody Map<String, Object> body) {
		logger.info("api/push/group");
		logger.info(body.toString());
		pushService.sendToGroup(body);
		return ResponseDTO.ok();
	}
	
	/* ── 푸시 리스트 ── */
	@PostMapping("/list")
	public ResponseDTO pushList(@RequestBody Map<String, Object> body) {
		logger.info("api/push/list");
		List<Map<String, Object>> pushList = pushService.pushList(body);
		
		return ResponseDTO.ok(pushList);
	}
	
	/* ── 푸시 리스트 ── */
	@PostMapping("/read")
	public ResponseDTO pushRead(@RequestBody Map<String, Object> body) {
		logger.info("api/push/pushRead");
		pushService.pushRead(body);
		return ResponseDTO.ok();
	}
	
	/* ── 테스트 발송 (개발용) ── */
	@PostMapping("/test")
	public ResponseDTO test(@RequestBody Map<String, Object> body) {
		logger.info("api/push/test");
	    String id = (String) body.get("id");
	    if (id == null) return ResponseDTO.fail("fail");

	    Map<String, Object> data = new HashMap<>();
	    data.put("group_id", body.get("group_id"));
	    data.put("id", id);
	    data.put("title",  "memories. 테스트 🔔");
	    data.put("msg",   "푸시 알림이 정상 동작해요!");
	    data.put("url",    "/html/index.html");
	    pushService.sendToGroup(data);
	    return ResponseDTO.ok();
	}
}
