package io.openvidu.call.java.models.polls;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import io.openvidu.call.java.models.polls.exceptions.AlreadyClosedPollException;
import io.openvidu.call.java.models.polls.exceptions.AlreadyRespondedPollException;
import io.openvidu.call.java.models.polls.exceptions.InvalidResponsePollException;
import io.openvidu.call.java.models.polls.exceptions.NoParticipantsPollException;
import io.openvidu.call.java.models.polls.exceptions.PollException;

public abstract class Poll {

    public abstract boolean validResponse(PollResponse response);
    // public abstract PollDTO toDTO();

    private String sessionId;
    private boolean anonymous;
    private String question;
    private PollStatus status;
    private Map<String, String> participants;
    private int totalParticipants;

    public Poll(String sessionId, boolean anonymous, String question, PollStatus status, Map<String, String> participants) {
        this.sessionId = Objects.requireNonNull(sessionId, "sessionId must not be null");
        this.anonymous = anonymous;
        this.question = Objects.requireNonNull(question, "question must not be null");
        this.status = Objects.requireNonNull(status, "status must not be null");
        this.participants = participants;
        if(this.participants == null) {
            this.participants = new HashMap<String, String>();
            this.totalParticipants = 0;
        } else {
            this.totalParticipants = this.participants.size();
        }
    }

    public Poll(String sessionId, boolean anonymous, String question, PollStatus status) {
        this(sessionId, anonymous, question, status, null);
    }

    public void respond(PollResponse response) throws AlreadyRespondedPollException, AlreadyClosedPollException, InvalidResponsePollException {
        response = Objects.requireNonNull(response, "response must not be null");
        if(!validResponse(response))
            throw new InvalidResponsePollException(sessionId, response, "invalid response format");
        if(status == PollStatus.CLOSED)
            throw new AlreadyClosedPollException(sessionId, response.getToken(), "poll has already been closed");
        if(participants.containsKey(response.getToken()))
            throw new AlreadyRespondedPollException(sessionId, response.getToken(), "poll has already been responded by this participant");
        participants.put(response.getToken(), response.getNickname());
        totalParticipants++;
    }

    public boolean validate() {
        return participants.size() == totalParticipants;
    }

    public void close() throws AlreadyClosedPollException, PollException, NoParticipantsPollException {
        if(status.equals(PollStatus.CLOSED))
            throw new AlreadyClosedPollException(sessionId, null, "poll has already been closed");
        if(!validate())
            throw new PollException(sessionId, "tried to close a poll with an invalid state");
        if(this.getTotalParticipants() < 1)
            throw new NoParticipantsPollException(sessionId, "Cannot close a poll without participants.");
        status = PollStatus.CLOSED;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = Objects.requireNonNull(sessionId, "sessionId must not be null");
    }

    public boolean isAnonymous() {
        return anonymous;
    }

    public void setAnonymous(boolean anonymous) {
        this.anonymous = anonymous;
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = Objects.requireNonNull(question, "question must not be null");
    }

    public PollStatus getStatus() {
        return status;
    }

    public void setStatus(PollStatus status) {
        this.status = Objects.requireNonNull(status, "status must not be null");
    }

    public Map<String, String> getParticipants() {
        return participants;
    }

    public void setParticipants(Map<String, String> participants) {
        this.participants = Objects.requireNonNull(participants, "participants must not be null");
    }

    public int getTotalParticipants() {
        return totalParticipants;
    }

    public void setTotalParticipants(int totalParticipants) {
        this.totalParticipants = totalParticipants;
    }

    public PollResult generatePollResult() {
        if(this.status != PollStatus.CLOSED)
            return null;
        List<String> participants = this.isAnonymous()? null: new ArrayList<>(this.getParticipants().values());
        return new PollResult(sessionId, "", anonymous, question, participants, null);
    }

}
