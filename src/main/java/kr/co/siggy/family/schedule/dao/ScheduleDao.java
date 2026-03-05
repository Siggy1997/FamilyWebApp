package kr.co.siggy.family.schedule.dao;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import kr.co.siggy.family.common.BaseDao;


@Repository
public class ScheduleDao extends BaseDao{

	private String nameSpace = "Schedule";

	public List<Map<String, Object>> scheduleList(Map<String, Object> data) {
		return sqlSession.selectList(nameSpace + ".scheduleList", data);
	}



}
