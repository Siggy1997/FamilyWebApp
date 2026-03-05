package kr.co.siggy.family.schedule.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import kr.co.siggy.family.common.BaseController;
import kr.co.siggy.family.schedule.dao.ScheduleDao;


@Service
public class ScheduleService extends BaseController{
	
	@Autowired
	private ScheduleDao scheduleDao;

	

	public List<Map<String, Object>> scheduleList(Map<String, Object> data) {
		List<Map<String, Object>> scheduleList = scheduleDao.scheduleList(data);
		return scheduleList;
	}


	
	
	
}
