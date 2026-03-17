package kr.co.siggy.family.push.dao;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import kr.co.siggy.family.common.BaseDao;


@Repository
public class PushNotiDao extends BaseDao{

	private String nameSpace = "PushNoti";


//	public Map<String, Object> findByEndpoint(Map<String, Object> data) {
//		return sqlSession.selectList(nameSpace + ".scheduleList", data);
//	}

	public void updateSubscription(Map<String, Object> data) {
		sqlSession.update(nameSpace + ".updateSubscription", data);
	}

	public void insertSubscription(Map<String, Object> data) {
		// TODO Auto-generated method stub
		
	}

	public void deleteByEndpoint(Map<String, Object> data) {
		// TODO Auto-generated method stub
		
	}

	public List<Map<String, Object>> findByUserId(Map<String, Object> data) {
		return sqlSession.selectList(nameSpace + ".findByUserId", data);
	}

	public List<Map<String, Object>> findAll() {
		// TODO Auto-generated method stub
		return null;
	}



}
