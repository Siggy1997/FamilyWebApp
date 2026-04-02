package kr.co.siggy.family.trip.service;

import java.util.HashMap;
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
	

	public Map<String, Object> tripGroup(Map<String, Object> param) {
		Map<String, Object> tripGrp = new HashMap<>();
		Map<String, Object> grpInfo = tripDao.grpInfo(param);
		List<Map<String, Object>> grpMember = tripDao.grpMember(param);
		
		tripGrp.put("grpInfo", grpInfo);
		tripGrp.put("grpMember", grpMember);
		return tripGrp;
	}
	
	public Map<String, Object> tripList(Map<String, Object> param) {
		Map<String, Object> response = new HashMap<>();
		// 여행 목록
		List<Map<String, Object>> tripList = tripDao.tripList(param);
		
		String recentTripId = "";
		if (tripList != null && !tripList.isEmpty()) {
			recentTripId = String.valueOf(tripList.get(0).get("id"));
		}
		// 최근 여행 첨부사진 5개
		List<Map<String, Object>> recentTripPath = tripDao.recentTripFilePath(recentTripId);
		
		response.put("tripList", tripList);
		response.put("recentTripPath", recentTripPath);
		
		return response;
	}

	public Map<String, Object> tripDetail(Map<String, Object> param) {
		Map<String, Object> tripDetail = tripDao.tripDetail(param);
		return tripDetail;
	}

	public void tripCreate(Map<String, Object> param) {
		tripDao.tripCreate(param);
	}
	
}
