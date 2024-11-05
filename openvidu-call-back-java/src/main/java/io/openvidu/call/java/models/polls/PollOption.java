package io.openvidu.call.java.models.polls;

import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

public class PollOption {

    private String text;
    private int result;
    private Set<String> participants;

    public PollOption(String text, int result, Set<String> participants) {
        this.text = Objects.requireNonNull(text, "text must not be null");
        this.result = result;
        this.participants = participants;
        if(this.participants == null)
            this.participants = new HashSet<>();
    }

    public void setText(String text) {
        this.text = Objects.requireNonNull(text, "text must not be null");
    }

    public String getText() {
        return text;
    }

    public int getResult() {
        return result;
    }

    public void setResult(int result) {
        this.result = result;
    }

    public void modifyResult(int modifier) {
        this.result += modifier;
    }

    public Set<String> getParticipants() {
        return participants;
    }

    public void setParticipants(Set<String> participants) {
        this.participants = Objects.requireNonNull(participants, "participants must not be null");
    }

    public boolean hasParticipant(String participant) {
        return participants.contains(participant);
    }

    public void addParticipant(String participant) {
        participants.add(participant);
    }

    public boolean removeParticipant(String participant) {
        return participants.remove(participant);
    }
    
}
