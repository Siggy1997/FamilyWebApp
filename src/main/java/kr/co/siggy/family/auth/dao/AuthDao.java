package kr.co.siggy.family.auth.dao;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import kr.co.siggy.family.common.BaseDao;


@Repository
public class AuthDao extends BaseDao{

	private String nameSpace = "Auth";

	public Map<String, Object> login(Map<String, Object> data) {
		return sqlSession.selectOne(nameSpace + ".login", data);
	}



}
