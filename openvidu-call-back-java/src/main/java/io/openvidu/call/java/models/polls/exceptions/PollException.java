package io.openvidu.call.java.models.polls.exceptions;

public class PollException extends Exception {

    private String sessionId;

    public PollException() {
        super();
    }

    public PollException(String errorMessage) {
        super(errorMessage);
    }

    public PollException(Throwable cause) {
        super(cause);
    }

    public PollException(String sessionId, String errorMessage) {
        super(errorMessage);
        this.sessionId = sessionId;
    }

    public PollException(String errorMessage, Throwable cause) {
        super(errorMessage, cause);
    }

    public PollException(String sessionId, String errorMessage, Throwable cause) {
        super(errorMessage, cause);
        this.sessionId = sessionId;
    }

    public PollException(String errorMessage, Throwable cause, boolean enableSuppression, boolean writableStackTrace) {
        super(errorMessage, cause, enableSuppression, writableStackTrace);
    }

    public PollException(String sessionId, String errorMessage, Throwable cause, boolean enableSuppression, boolean writableStackTrace) {
        super(errorMessage, cause, enableSuppression, writableStackTrace);
        this.sessionId = sessionId;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }
    
}
