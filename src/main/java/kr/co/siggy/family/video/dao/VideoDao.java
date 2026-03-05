package kr.co.siggy.family.video.dao;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import kr.co.siggy.family.common.BaseDao;


@Repository
public class VideoDao extends BaseDao{

	private String nameSpace = "Video";
	
	public List<Map<String, Object>> videoList(Map<String, Object> data) {
		return sqlSession.selectList(nameSpace + ".videoList", data);
	}



}
