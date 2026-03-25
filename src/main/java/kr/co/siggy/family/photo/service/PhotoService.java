package kr.co.siggy.family.photo.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import kr.co.siggy.family.common.BaseController;
import kr.co.siggy.family.photo.dao.PhotoDao;


@Service
public class PhotoService extends BaseController{
    @Value("${storage.root}")
    private String storageRoot;
	
    @Value("${storage.url-prefix}")
    private String urlPrefix;
    
	@Autowired
	private PhotoDao photoDao;
	
	public List<Map<String, Object>> photoList(Map<String, Object> data) {
		List<Map<String, Object>> photoList = photoDao.photoList(data);
		return photoList;
	}

	public Map<String, Object> photoUpload(MultipartFile file, String tripId) {

	    // 저장 디렉토리 생성
		Path dir = Paths.get(storageRoot, tripId);
	    try {
	        Files.createDirectories(dir);
	        logger.info("### Directory : {}", dir);
	    } catch (IOException e) {
	        throw new RuntimeException("디렉토리 생성 실패: " + dir, e);
	    }

	    // 파일명 생성
	    String original = file.getOriginalFilename();
	    String ext = original.substring(original.lastIndexOf(".") + 1);
	    String savedName = UUID.randomUUID().toString().replace("-", "") + "." + ext;

	    // 실제 파일 저장 경로
	    Path filePath = dir.resolve(savedName);

	    try {
	        file.transferTo(filePath);
	        logger.info("### File SAVE : {}", filePath);
	    } catch (IOException e) {
	        throw new RuntimeException("파일 저장 실패: " + filePath, e);
	    }

	    // DB에 저장할 상대 경로
	    String webPath = urlPrefix + "/trips/" + tripId + "/" + savedName;

	    // 파일 정보
	    long sizeBytes = file.getSize();

	    // DB 저장
	    Map<String, Object> param = new HashMap<>();
	    param.put("trip_id", tripId);
	    param.put("file_path", webPath);
	    param.put("file_name", savedName);
	    param.put("taken_at", null);
	    param.put("width", null);
	    param.put("height", null);
	    param.put("size_bytes", sizeBytes);

	    logger.info("{}", param);

	    photoDao.photoUpload(param);

	    return param;
	}


	
	
	
}
