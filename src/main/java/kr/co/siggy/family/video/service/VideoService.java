package kr.co.siggy.family.video.service;

import java.util.List;
import java.util.Map;

import org.jspecify.annotations.Nullable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import kr.co.siggy.family.common.BaseController;
import kr.co.siggy.family.trip.dao.TripDao;
import kr.co.siggy.family.video.dao.VideoDao;


@Service
public class VideoService extends BaseController{
	
	@Autowired
	private VideoDao videoDao;

	public List<Map<String, Object>> videoList(Map<String, Object> data) {
		List<Map<String, Object>> videoList = videoDao.videoList(data);
		return videoList;
	}


	
	
	
}
