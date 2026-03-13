package kr.co.siggy.family.video.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import kr.co.siggy.family.common.BaseController;
import kr.co.siggy.family.common.ResponseDTO;
import kr.co.siggy.family.video.service.VideoService;


@RestController
@RequestMapping(value = "/api/video")
public class VideoController extends BaseController {

	@Autowired
	private VideoService videoService;
    
    /** 여행 비디오 목록 조회 */
    @PostMapping("/video/list")
    public ResponseDTO videoList(@RequestBody Map<String, Object> data) {
    	List<Map<String, Object>> videoList = videoService.videoList(data);
    	return ResponseDTO.ok(videoList);
    }

	
}
