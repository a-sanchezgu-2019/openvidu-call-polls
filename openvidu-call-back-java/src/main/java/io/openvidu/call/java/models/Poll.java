package io.openvidu.call.java.models;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

public class Poll {

    public class PollResponse {

        private String text;
        private int result;
        private List<String> participants;

        public PollResponse(String text, int result) {
            this.text = text;
            this.result = result;
            participants = new ArrayList<>();
        }

        public PollResponse(String text, int result, List<String> participants) {
            this.text = text;
            this.result = result;
            this.participants = participants;
        }

        public String getText() {
            return text;
        }

        public void setText(String text) {
            this.text = text;
        }

        public int getResult() {
            return result;
        }

        public void setResult(int result) {
            this.result = result;
        }

        public List<String> getParticipants() {
            return participants;
        }

        public void setParticipants(List<String> participants) {
            this.participants = participants;
        }

        public void appendParticipant(String participant) {
            this.participants.add(participant);
        }

        public String getParticipant(int index) throws IndexOutOfBoundsException {
            return this.participants.get(index);
        }

        public boolean removeParticipant(String participant) {
            return this.participants.remove(participant);
        }

        public String popParticipant(int index) throws IndexOutOfBoundsException {
            return this.participants.remove(index);
        }

    }

    private String sessionId;
    private String status;
    private boolean anonymous;
    private String question;
    private List<PollResponse> responses;
    private int totalResponses;
    private Map<String, String> participants;

    public Poll(String sessionId, String status, boolean anonymous, String question, List<PollResponse> responses, int totalResponses, Map<String, String> participants) {
        this.sessionId = sessionId;
        this.status = status;
        this.anonymous = anonymous;
        this.question = question;
        this.responses = responses;
        this.totalResponses = totalResponses;
        this.participants = participants;
    }

    public Poll(String sessionId, String status, boolean anonymous, String question, List<PollResponse> responses, int totalResponses) {
        this.sessionId = sessionId;
        this.status = status;
        this.anonymous = anonymous;
        this.question = question;
        this.responses = responses;
        this.totalResponses = totalResponses;
        this.participants = new HashMap<>();
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
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

    public List<PollResponse> getResponses() {
        return responses;
    }

    public void setResponses(List<PollResponse> responses) {
        this.responses = responses;
    }

    public int getTotalResponses() {
        return totalResponses;
    }

    public void setTotalResponses(int totalResponses) {
        this.totalResponses = totalResponses;
    }

    public Map<String, String> getParticipants() {
        return participants;
    }

    public void setParticipants(Map<String, String> participants) {
        this.participants = participants;
    }

    public void putParticipant(String participantId, String nickname) {
        this.participants.put(participantId, nickname);
    }

    public String getParticipant(String participantId) {
        return this.participants.get(participantId);
    }

    public String removeParticipant(String participantId) {
        return this.participants.remove(participantId);
    }
    
}
