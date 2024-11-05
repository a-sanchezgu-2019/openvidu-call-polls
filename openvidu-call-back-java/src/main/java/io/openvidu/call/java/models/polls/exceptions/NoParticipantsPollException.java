package io.openvidu.call.java.models.polls.exceptions;

public class NoParticipantsPollException extends PollException {

    public NoParticipantsPollException() {
        super();
    }

    public NoParticipantsPollException(String errorMessage) {
        super(errorMessage);
    }

    public NoParticipantsPollException(Throwable cause) {
        super(cause);
    }

    public NoParticipantsPollException(String sessionId, String errorMessage) {
        super(sessionId, errorMessage);
    }

    public NoParticipantsPollException(String errorMessage, Throwable cause) {
        super(errorMessage, cause);
    }

    public NoParticipantsPollException(String sessionId, String errorMessage, Throwable cause) {
        super(sessionId, errorMessage, cause);
    }

    public NoParticipantsPollException(String errorMessage, Throwable cause, boolean enableSuppression, boolean writableStackTrace) {
        super(errorMessage, cause, enableSuppression, writableStackTrace);
    }

    public NoParticipantsPollException(String sessionId, String errorMessage, Throwable cause, boolean enableSuppression, boolean writableStackTrace) {
        super(sessionId, errorMessage, cause, enableSuppression, writableStackTrace);
    }

}
