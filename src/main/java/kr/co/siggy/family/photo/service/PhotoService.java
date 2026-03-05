package kr.co.siggy.family.photo.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import kr.co.siggy.family.common.BaseController;
import kr.co.siggy.family.photo.dao.PhotoDao;


@Service
public class PhotoService extends BaseController{
	
	@Autowired
	private PhotoDao photoDao;
	
	public List<Map<String, Object>> photoList(Map<String, Object> data) {
		List<Map<String, Object>> photoList = photoDao.photoList(data);
		return photoList;
	}


	
	
	
}
