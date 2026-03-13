package kr.co.siggy.family.auth.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import kr.co.siggy.family.auth.dao.AuthDao;
import kr.co.siggy.family.common.BaseController;
import kr.co.siggy.family.schedule.dao.ScheduleDao;


@Service
public class AuthService extends BaseController{
	
	@Autowired
	private AuthDao authDao;
	
	public Map<String, Object> login(Map<String, Object> data) {
		Map<String, Object> profile = authDao.login(data);
		Long count = Long.valueOf(profile.get("count").toString());
		if (count != 1) {
		    return null;
		}
		return profile;
	}


	
	
	
}
