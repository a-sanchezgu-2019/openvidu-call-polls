package io.openvidu.call.java.models.DTO;

import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;

import io.openvidu.call.java.models.polls.Poll;
import io.openvidu.call.java.models.polls.PollOption;
import io.openvidu.call.java.models.polls.PollStatus;
import io.openvidu.call.java.models.polls.PollWithOptions;
import io.openvidu.call.java.models.polls.PreferenceOrderPoll;
import io.openvidu.call.java.models.polls.SingleOptionPoll;
import io.openvidu.call.java.models.polls.LotteryPoll;
import io.openvidu.call.java.models.polls.MultipleOptionPoll;

public class PollDTO {

    private String sessionId;
    private String status;
    private boolean anonymous;
    private String question;
    private String type;
    private int totalParticipants;
    private List<String> participants;
    private Map<String, Object> data;
    private List<Integer> responseIndices;

    public PollDTO(Poll poll, String participantId) {

        this.sessionId = poll.getSessionId();
        this.status = poll.getStatus().toString();
        this.anonymous = poll.isAnonymous();
        this.question = poll.getQuestion();
        this.participants = new ArrayList<>();
        this.totalParticipants = poll.getParticipants().size();
        this.responseIndices = new ArrayList<>();
        this.data = new HashMap<>();
        
        boolean addParticipants = !this.anonymous && (participantId == null || this.status.equals("closed"));
        
        if(addParticipants) {
            for(String participant: poll.getParticipants().values()) {
                this.participants.add(participant);
            }
        }
        
        if(poll instanceof PollWithOptions) {

            PollWithOptions pollWO = (PollWithOptions) poll;
            ArrayList<PollOption> optionsDTO = new ArrayList<>();
            for(PollOption option: pollWO.getOptions()) {
                PollOption optionDTO = new PollOption(option.getText(), option.getResult(), null);
                if(addParticipants) {
                    for(String partId: option.getParticipants()) {
                        if(poll.getParticipants().containsKey(partId))
                            optionDTO.addParticipant(poll.getParticipants().get(partId));
                    }
                }
                optionsDTO.add(optionDTO);
            }
            this.data.put("options", optionsDTO);

            if(participantId != null) { // Destinatary is a participant
                if(poll instanceof PreferenceOrderPoll) {
                    PreferenceOrderPoll pollPO = (PreferenceOrderPoll) poll;
                    List<Integer> preferenceOrder = pollPO.getPreferenceOrder(participantId);
                    if(preferenceOrder != null) {
                        if(poll.getParticipants().containsKey(participantId) && poll.getStatus() == PollStatus.PENDING)
                            this.status = PollStatus.RESPONDED.toString();
                        this.responseIndices.addAll(preferenceOrder);
                    }
                } else {
                    for(int index = 0; index < pollWO.getNumOptions(); index++) {
                        if(pollWO.getOption(index).getParticipants().contains(participantId)) {
                            this.responseIndices.add(index);
                            if(poll.getStatus() == PollStatus.PENDING)
                                this.status = PollStatus.RESPONDED.toString();
                        }
                    }
                }
            }

            if(poll instanceof SingleOptionPoll) {
                this.type = "single_option";
            } else if(poll instanceof MultipleOptionPoll) {
                this.type = "multiple_option";
                MultipleOptionPoll pollMO = (MultipleOptionPoll) poll;
                this.data.put("minOptions", pollMO.getMinOptions());
                this.data.put("maxOptions", pollMO.getMaxOptions());
            } else if(poll instanceof PreferenceOrderPoll) {
                this.type = "preference_order";
                PreferenceOrderPoll pollPO = (PreferenceOrderPoll) poll;
                this.data.put("minOptions", pollPO.getMinOptions());
                this.data.put("maxOptions", pollPO.getMaxOptions());
                this.data.put("pointsMapping", pollPO.getPointsMapping());
            }

        } else if(poll instanceof LotteryPoll) {

            String winner = ((LotteryPoll) poll).getWinner();
            if(winner != null)
                winner = poll.getParticipants().get(winner);
            this.data.put("winner", winner);

            if(participantId != null) { // Destinatary is a participant
                if(participantId == winner)
                    this.responseIndices.add(1);
                else if(poll.getParticipants().containsKey(participantId)) {
                    this.responseIndices.add(0);
                    if(poll.getStatus() == PollStatus.PENDING)
                        this.status = PollStatus.RESPONDED.toString();
                }
            }

            this.type = "lottery";

        }

    }

    public PollDTO(Poll poll) {
        this(poll, null);
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

    public int getTotalParticipants() {
        return totalParticipants;
    }

    public void setTotalParticipants(int totalParticipants) {
        this.totalParticipants = totalParticipants;
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
    
    public List<Integer> getResponseIndices() {
        return this.responseIndices;
    }

    public void setResponseIndex(List<Integer> responseIndices) {
        this.responseIndices = responseIndices;
    }

}
