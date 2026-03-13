package kr.co.siggy.family.trip.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import kr.co.siggy.family.common.BaseController;
import kr.co.siggy.family.common.ResponseDTO;
import kr.co.siggy.family.trip.service.TripService;


@RestController
@RequestMapping(value = "/api/trip")
public class TripController extends BaseController {

	@Autowired
	private TripService tripService;

	/** 전체 여행 목록 조회 */
	@PostMapping("/group")
	public ResponseDTO tripInfo(@RequestBody(required = false) Map<String, Object> data) {
		Map<String, Object> tripGroup = tripService.tripGroup(data);
		return ResponseDTO.ok(tripGroup);
	}
	 /** 전체 여행 목록 조회 */

	@PostMapping("/list")
    public ResponseDTO tripList(@RequestBody(required = false) Map<String, Object> data) {
    	List<Map<String, Object>> tripList = tripService.tripList(data);
        return ResponseDTO.ok(tripList);
    }

    /** 여행 단건 조회 */
    @PostMapping("/detail")
    public ResponseDTO tripDetail(@RequestBody Map<String, Object> data) {
    	Map<String, Object> tripDetail = tripService.tripDetail(data);
        return ResponseDTO.ok(tripDetail); 
    }

    /** 여행 추가 */
    @PostMapping("/create")
    public ResponseDTO tripCreate(@RequestBody Map<String, Object> data) {
        tripService.tripCreate(data);
        return ResponseDTO.ok();
    }
//
//    /** 여행 수정 */
//    @PostMapping("/trips/update")
//    public ResponseEntity<?> update(@RequestBody Map<String, Object> data) {
//        tripService.update(data);
//        return ResponseEntity.ok(Map.of("result", "ok"));
//    }
//
//    /** 여행 삭제 */
//    @PostMapping("/trips/delete")
//    public ResponseEntity<?> delete(@RequestBody Map<String, Object> data) {
//        tripService.delete(data);
//        return ResponseEntity.ok(Map.of("result", "ok"));
//    }
	
}
