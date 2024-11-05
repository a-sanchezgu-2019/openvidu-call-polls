package io.openvidu.call.java.models.polls.exceptions;

public class AlreadyClosedPollException extends PollException {

    private String participant;

    public AlreadyClosedPollException(String sessionId, String participant, String errorMessage) {
        super(sessionId, errorMessage);
        this.participant = participant;
    }

    public AlreadyClosedPollException(String sessionId, String participant, String errorMessage, Throwable cause) {
        super(sessionId, errorMessage, cause);
        this.participant = participant;
    }

    public AlreadyClosedPollException(String sessionId, String participant, String errorMessage, Throwable cause, boolean enableSuppression, boolean writableStackTrace) {
        super(sessionId, errorMessage, cause, enableSuppression, writableStackTrace);
        this.participant = participant;
    }

    public String getParticipant() {
        return participant;
    }

    public void setParticipant(String participant) {
        this.participant = participant;
    }

}
