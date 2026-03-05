package kr.co.siggy.family.trip.dao;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import kr.co.siggy.family.common.BaseDao;


@Repository
public class TripDao extends BaseDao{

	private String nameSpace = "Trip";
	
	public List<Map<String, Object>> tripList(Map<String, Object> data) {
		return sqlSession.selectList(nameSpace + ".tripList", data);
	}

	public Map<String, Object> tripDetail(Map<String, Object> data) {
		return sqlSession.selectOne(nameSpace + ".tripDetail", data);
	}

	public void tripCreate(Map<String, Object> data) {
		sqlSession.insert(nameSpace + ".tripCreate", data);
	}
	
	
	/**
	 * 사진
	 */
	public List<Map<String, Object>> photoList(Map<String, Object> data) {
		return sqlSession.selectList(nameSpace + ".photoList", data);
	}



}
