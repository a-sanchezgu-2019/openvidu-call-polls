package io.openvidu.call.java.models.polls;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class PollResult {
    
    private String sessionId;
    private String type;
    private boolean anonymous;
    private String question;
    private List<String> participants;
    private Map<String, Object> data;

    public PollResult(String sessionId, String type, boolean anonymous, String question, List<String> participants,
            Map<String, Object> data) {
        this.sessionId = sessionId;
        this.type = type;
        this.anonymous = anonymous;
        this.question = question;
        this.participants = participants != null? participants: new ArrayList<>();
        this.data = data != null? data: new LinkedHashMap<>();
    }

    public PollResult(String sessionId, String type, boolean anonymous, String question) {
        this(sessionId, type, anonymous, question, null, null);
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
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
        this.question = question;
    }

    public List<String> getParticipants() {
        return this.participants;
    }

    public void setParticipants(List<String> participants) {
        this.participants = participants;
    }

    public void addParticipant(String participant) {
        this.participants.add(participant);
    }

    public Object getData(String key) {
        return this.data.get(key);
    }

    public void putData(String key, Object value) {
        this.data.put(key, value);
    }

}
