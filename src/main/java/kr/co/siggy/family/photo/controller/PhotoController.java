package kr.co.siggy.family.photo.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import kr.co.siggy.family.common.BaseController;
import kr.co.siggy.family.photo.service.PhotoService;


@RestController
@RequestMapping(value = "/api/photo")
public class PhotoController extends BaseController {

	@Autowired
	private PhotoService photoService;

    /** 여행 이미지 목록 조회 */
    @PostMapping("/list")
    public ResponseEntity<?> photoList(@RequestBody Map<String, Object> data) {
    	List<Map<String, Object>> photoList = photoService.photoList(data);
        return ResponseEntity.ok(photoList);
    }

	
}
