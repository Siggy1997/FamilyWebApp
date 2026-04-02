package kr.co.siggy.family.photo.dao;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;
import org.springframework.web.multipart.MultipartFile;

import kr.co.siggy.family.common.BaseDao;


@Repository
public class PhotoDao extends BaseDao{

	private String nameSpace = "Photo";
	
	public List<Map<String, Object>> photoList(Map<String, Object> param) {
		return sqlSession.selectList(nameSpace + ".photoList", param);
	}

	public void photoUpload(Map<String, Object> param) {
		sqlSession.insert(nameSpace + ".photoUpload", param);
	}



}
