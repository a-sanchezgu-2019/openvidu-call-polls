package io.openvidu.call.java.models.DTO;

import java.util.List;
import java.util.ArrayList;

import io.openvidu.call.java.models.Poll;

public class PollDTO {

    public class PollResponseDTO {

        private String text;
        private int result;
        private List<String> participants;

        public PollResponseDTO(String text, int result) {
            this.text = text;
            this.result = result;
            participants = new ArrayList<>();
        }

        public PollResponseDTO(String text, int result, List<String> participants) {
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
    private List<PollResponseDTO> responses;
    private int totalResponses;
    private List<String> participants;
    private int responseIndex;

    public PollDTO(Poll poll, String participantId) {

        this.sessionId = poll.getSessionId();
        this.status = poll.getStatus();
        this.anonymous = poll.isAnonymous();
        this.question = poll.getQuestion();
        this.responses = new ArrayList<>();
        this.totalResponses = poll.getTotalResponses();
        this.participants = new ArrayList<>();
        this.responseIndex = -1;
        
        boolean addParticipants = !this.anonymous && (participantId == null || this.status.equals("closed"));
        
        if(addParticipants) {
            for(String participant: poll.getParticipants().values()) {
                this.participants.add(participant);
            }
        }
        
        for(int responseIndex = 0; responseIndex < poll.getResponses().size(); responseIndex++) {
            Poll.PollResponse response = poll.getResponses().get(responseIndex);
            PollResponseDTO responseDTO = new PollResponseDTO(response.getText(), response.getResult());
            for(String responseParticipantId: response.getParticipants()) {
                if(responseParticipantId.equals(participantId)) {
                    this.responseIndex = responseIndex;
                    if(!this.status.equals("closed"))
                        this.status = "responded";
                }
                if(addParticipants)
                    responseDTO.appendParticipant(poll.getParticipants().get(responseParticipantId));
            }
            this.responses.add(responseDTO);
        }

    }

    public PollDTO(Poll poll) {
        this(poll, null);
    }

    public PollDTO(String sessionId, String status, boolean anonymous, String question, List<PollResponseDTO> responses, int totalResponses, List<String> participants, int responseIndex) {
        this.sessionId = sessionId;
        this.status = status;
        this.anonymous = anonymous;
        this.question = question;
        this.responses = responses;
        this.totalResponses = totalResponses;
        this.participants = participants;
        this.responseIndex = responseIndex;
    }

    public PollDTO(String sessionId, String status, boolean anonymous, String question, List<PollResponseDTO> responses, int totalResponses, int responseIndex) {
        this.sessionId = sessionId;
        this.status = status;
        this.anonymous = anonymous;
        this.question = question;
        this.responses = responses;
        this.totalResponses = totalResponses;
        this.participants = new ArrayList<>();
        this.responseIndex = responseIndex;
    }

    public PollDTO(String sessionId, String status, boolean anonymous, String question, List<PollResponseDTO> responses, int totalResponses, List<String> participants) {
        this.sessionId = sessionId;
        this.status = status;
        this.anonymous = anonymous;
        this.question = question;
        this.responses = responses;
        this.totalResponses = totalResponses;
        this.participants = participants;
        this.responseIndex = -1;
    }

    public PollDTO(String sessionId, String status, boolean anonymous, String question, List<PollResponseDTO> responses, int totalResponses) {
        this.sessionId = sessionId;
        this.status = status;
        this.anonymous = anonymous;
        this.question = question;
        this.responses = responses;
        this.totalResponses = totalResponses;
        this.participants = new ArrayList<>();
        this.responseIndex = -1;
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

    public List<PollResponseDTO> getResponses() {
        return responses;
    }

    public void setResponses(List<PollResponseDTO> responses) {
        this.responses = responses;
    }

    public int getTotalResponses() {
        return totalResponses;
    }

    public void setTotalResponses(int totalResponses) {
        this.totalResponses = totalResponses;
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
    
    public int getResponseIndex() {
        return this.responseIndex;
    }

    public void setResponseIndex(int responseIndex) {
        this.responseIndex = responseIndex;
    }

}
