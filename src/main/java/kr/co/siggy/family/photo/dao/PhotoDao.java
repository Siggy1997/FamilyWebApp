package kr.co.siggy.family.photo.dao;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import kr.co.siggy.family.common.BaseDao;


@Repository
public class PhotoDao extends BaseDao{

	private String nameSpace = "Photo";
	
	public List<Map<String, Object>> photoList(Map<String, Object> data) {
		return sqlSession.selectList(nameSpace + ".photoList", data);
	}



}
