package kr.co.siggy.family.push.service;

import java.security.Security;
import java.util.Base64;
import java.util.List;
import java.util.Map;

import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import kr.co.siggy.family.common.BaseController;
import kr.co.siggy.family.push.dao.PushNotiDao;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;

@Service
public class PushNotiService extends BaseController {
    static {
        Security.addProvider(new BouncyCastleProvider());
    }
    @Autowired
    private PushNotiDao pushDao;

    @Value("${vapid.public.key}")
    private String vapidPublicKey;

    @Value("${vapid.private.key}")
    private String vapidPrivateKey;

    @Value("${vapid.subject}")
    private String vapidSubject;

    /* ── 구독 저장 ── */
    public void subscribe(Map<String, Object> data) {
            pushDao.updateSubscription(data);
    }

    /* ── 구독 취소 ── */
    public void unsubscribe(Map<String, Object> data) {
        pushDao.deleteByEndpoint(data);
    }

    /* ── 특정 유저에게 발송 ── */
    public void sendToUser(Map<String, Object> data) {
        List<Map<String, Object>> subs = pushDao.sendToUser(data);
        for (Map<String, Object> sub : subs) {
            send(sub,(String) data.get("body"), (String) data.get("url"));
        }
    }

    /* ── 모든 유저에게 발송 ── */
    public void sendToAll(Map<String, Object> data) {
        List<Map<String, Object>> subs = pushDao.findAll();
        for (Map<String, Object> sub : subs) {
            send(sub,(String) data.get("body"), (String) data.get("url"));
        }
    }

    /* ── 단건 발송 ── */
    private void send(Map<String, Object> sub, String msg, String url) {
        try {
            String payload = String.format(
                "\"body\":\"%s\",\"url\":\"%s\",\"tag\":\"memories-push\"}",
                msg, url
            );

            String endpoint = (String) sub.get("endpoint");
            String p256dh   = (String) sub.get("p256dh");
            String auth     = (String) sub.get("auth");

            PushService pushService = new PushService(vapidPublicKey,vapidPrivateKey,vapidSubject);
            Notification notification = new Notification(endpoint,p256dh,auth,payload);

            pushService.send(notification);

            logger.info("[Push] 발송 성공: userId={}", sub.get("user_id"));

        } catch (Exception e) {

            logger.error("[Push] 발송 실패: {}", e.getMessage());
            if (e.getMessage() != null && e.getMessage().contains("410")) {
                pushDao.deleteByEndpoint(sub);
            }
        }
    }

	public void pushList(Map<String, Object> body) {
		// TODO Auto-generated method stub
		
	}
}