package kr.co.siggy.family.schedule.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import kr.co.siggy.family.common.BaseController;
import kr.co.siggy.family.schedule.service.ScheduleService;


@RestController
@RequestMapping(value = "/api/video")
public class ScheduleController extends BaseController {

	@Autowired
	private ScheduleService scheduleService;

    
    /** 여행 게획 목록 조회 */
    @PostMapping("/list")
    public ResponseEntity<?> scheduleList(@RequestBody Map<String, Object> data) {
    	List<Map<String, Object>> scheduleList = scheduleService.scheduleList(data);
    	return ResponseEntity.ok(scheduleList);
    }

	
}
