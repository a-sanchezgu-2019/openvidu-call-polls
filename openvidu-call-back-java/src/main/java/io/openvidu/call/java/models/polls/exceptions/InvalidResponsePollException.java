package io.openvidu.call.java.models.polls.exceptions;

import io.openvidu.call.java.models.polls.PollResponse;

public class InvalidResponsePollException extends PollException {

    private PollResponse response;

    public InvalidResponsePollException(String sessionId, PollResponse response, String errorMessage) {
        super(sessionId, errorMessage);
        this.response = response;
    }

    public InvalidResponsePollException(String sessionId, PollResponse response, String errorMessage, Throwable cause) {
        super(sessionId, errorMessage, cause);
        this.response = response;
    }

    public InvalidResponsePollException(String sessionId, PollResponse response, String errorMessage, Throwable cause, boolean enableSuppression, boolean writableStackTrace) {
        super(sessionId, errorMessage, cause, enableSuppression, writableStackTrace);
        this.response = response;
    }

    public PollResponse getResponse() {
        return response;
    }

    public void setResponse(PollResponse response) {
        this.response = response;
    }

}
