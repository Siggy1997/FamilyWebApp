package kr.co.siggy.family.trip.service;

import java.util.List;
import java.util.Map;

import org.jspecify.annotations.Nullable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import kr.co.siggy.family.common.BaseController;
import kr.co.siggy.family.trip.dao.TripDao;


@Service
public class TripService extends BaseController{
	
	@Autowired
	private TripDao tripDao;
	
	/**
	 * 여행
	 */
	public List<Map<String, Object>> tripList(Map<String, Object> data) {
		List<Map<String, Object>> tripList = tripDao.tripList(data);
		return tripList;
	}

	public Map<String, Object> tripDetail(Map<String, Object> data) {
		Map<String, Object> tripDetail = tripDao.tripDetail(data);
		return tripDetail;
	}

	public void tripCreate(Map<String, Object> data) {
		tripDao.tripCreate(data);
	}

	
	/**
	 * 사진
	 */
	public List<Map<String, Object>> photoList(Map<String, Object> data) {
		List<Map<String, Object>> photoList = tripDao.photoList(data);
		return null;
	}


	
	
	
}
