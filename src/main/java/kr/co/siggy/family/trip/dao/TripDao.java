package kr.co.siggy.family.trip.dao;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import kr.co.siggy.family.common.BaseDao;


@Repository
public class TripDao extends BaseDao{

	private String nameSpace = "Trip";
	

	public Map<String, Object> grpInfo(Map<String, Object> param) {
		return sqlSession.selectOne(nameSpace + ".grpInfo", param);
	}

	public List<Map<String, Object>> grpMember(Map<String, Object> param) {
		return sqlSession.selectList(nameSpace + ".grpMember", param);
	}
	
	public List<Map<String, Object>> tripList(Map<String, Object> param) {
		return sqlSession.selectList(nameSpace + ".tripList", param);
	}

	public List<Map<String, Object>> recentTripFilePath(String recentTripId) {
		return sqlSession.selectList(nameSpace + ".recentTripFilePath", recentTripId);
	}
	public Map<String, Object> tripDetail(Map<String, Object> param) {
		return sqlSession.selectOne(nameSpace + ".tripDetail", param);
	}

	public void tripCreate(Map<String, Object> param) {
		sqlSession.insert(nameSpace + ".tripCreate", param);
	}


	




}
