package kr.co.siggy.family.common;

import org.apache.ibatis.session.SqlSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;

public class BaseDao {
	protected Logger logger = LoggerFactory.getLogger(this.getClass().getName());
	
	@Autowired
	@Qualifier("sqlSession")
	protected SqlSession sqlSession;
}
