package kr.co.siggy.family.common;

public class ResponseDTO {
    private String resultCode;
    private String resultMsg;
    private Object data;

    private ResponseDTO(String resultCode, String resultMsg, Object data) {
        this.resultCode = resultCode;
        this.resultMsg  = resultMsg;
        this.data    = data;
    }

    public static ResponseDTO ok(Object data) {
        return new ResponseDTO("200", "성공", data);
    }

    public static ResponseDTO ok() {
        return new ResponseDTO("200", "성공", null);
    }

    public static ResponseDTO fail(String msg) {
        return new ResponseDTO("999", msg, null);
    }

    public static ResponseDTO loginFail(String msg) {
    	return new ResponseDTO("997", msg, null);
    }

    public static ResponseDTO sessionFail(String msg) {
    	return new ResponseDTO("998", msg, null);
    }

    public String getResultCode() { return resultCode; }
    public String getResultMsg()  { return resultMsg; }
    public Object getData()    { return data; }
}