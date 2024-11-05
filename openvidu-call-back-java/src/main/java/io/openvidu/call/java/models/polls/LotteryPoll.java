package io.openvidu.call.java.models.polls;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Random;

import io.openvidu.call.java.models.polls.exceptions.PollException;

public class LotteryPoll extends Poll {

    private String winner = null;

    public LotteryPoll(String sessionId, boolean anonymous, String question, PollStatus status) {
        super(sessionId, anonymous, question, status);
    }

    public LotteryPoll(String sessionId, boolean anonymous, String question, PollStatus status, Map<String, String> participants) {
        super(sessionId, anonymous, question, status, participants);
    }

    public LotteryPoll(String sessionId, boolean anonymous, String question, PollStatus status, String winner) {
        super(sessionId, anonymous, question, status);
        this.winner = winner;
    }

    public LotteryPoll(String sessionId, boolean anonymous, String question, PollStatus status, Map<String, String> participants, String winner) {
        super(sessionId, anonymous, question, status, participants);
        this.winner = winner;
    }

    @Override
    public boolean validResponse(PollResponse response) {
        return true;
    }

    @Override
    public void close() throws PollException {
        super.close();
        newWinner();
    }

    @Override
    public PollResult generatePollResult() {
        PollResult result = super.generatePollResult();
        if(result == null)
            return null;
        result.setType("lottery");
        result.putData("winner", this.getParticipants().get(this.winner));
        return result;
    }

    public void setWinner(String winner) {
        this.winner = super.getStatus().equals(PollStatus.CLOSED)? Objects.requireNonNull(winner): winner;
    }

    public String getWinner() {
        return winner;
    }

    public String newWinner() {
        List<String> tokensList = new ArrayList<>(super.getParticipants().keySet());
        winner = tokensList.get((new Random()).nextInt(tokensList.size()));
        return winner;
    }
    
}
