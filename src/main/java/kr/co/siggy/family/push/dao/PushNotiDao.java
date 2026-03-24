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

	public List<Map<String, Object>> sendToGroup(Map<String, Object> data) {
		return sqlSession.selectList(nameSpace + ".sendToGroup", data);
	}

	public List<Map<String, Object>> findAll() {
		// TODO Auto-generated method stub
		return null;
	}

	public void insertPush(Map<String, Object> data) {
		sqlSession.insert(nameSpace + ".insertPush", data);
	}

	public List<Map<String, Object>> pushList(Map<String, Object> data) {
		return sqlSession.selectList(nameSpace + ".pushList", data);
	}

	public void pushRead(Map<String, Object> body) {
		sqlSession.update(nameSpace + ".pushRead", body);
	}



}
