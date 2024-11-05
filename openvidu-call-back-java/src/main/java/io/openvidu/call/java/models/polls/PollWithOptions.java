package io.openvidu.call.java.models.polls;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import javax.management.InvalidAttributeValueException;

public abstract class PollWithOptions extends Poll {

    private List<PollOption> options;

    public PollWithOptions(String sessionId, boolean anonymous, String question, PollStatus status, Map<String, String> participants, List<PollOption> options) throws InvalidAttributeValueException {
        super(sessionId, anonymous, question, status, participants);
        this.options = Objects.requireNonNull(options, "options must not be null");
        if(this.options.size() < 2)
            throw new InvalidAttributeValueException("options size must be greater than 2");
    }

    public PollWithOptions(String sessionId, boolean anonymous, String question, PollStatus status, List<PollOption> options) throws InvalidAttributeValueException {
        this(sessionId, anonymous, question, status, null, options);
    }

    public void setOptions(List<PollOption> options) throws InvalidAttributeValueException {
        this.options = Objects.requireNonNull(options, "options must not be null");
        if(this.options.size() < 2)
            throw new InvalidAttributeValueException("options size must be greater than 2");
    }

    public List<PollOption> getOptions() {
        return options;
    }

    public PollOption getOption(int index) throws IndexOutOfBoundsException {
        return options.get(index);
    }

    public int getNumOptions() {
        return options.size();
    }

    @Override
    public PollResult generatePollResult() {
        PollResult result = super.generatePollResult();
        if(result == null)
            return null;
        int resultSum = 0;
        List<Map<String, Object>> resultOptions = new ArrayList<>();
        for(PollOption option: this.options) {
            Map<String, Object> resultOption = new LinkedHashMap<>();
            resultOption.put("text", option.getText());
            List<String> resultOptionParticipants = new ArrayList<>();
            if(!this.isAnonymous()) {
                for(String participantToken: option.getParticipants())
                    resultOptionParticipants.add(this.getParticipants().get(participantToken));
            }
            resultOption.put("participants", resultOptionParticipants);
            resultOption.put("result", option.getResult());
            resultOptions.add(resultOption);
            resultSum += option.getResult();
        }
        for(int optIndex = 0; optIndex < this.getNumOptions(); optIndex++) {
            resultOptions.get(optIndex).put("percentage", this.options.get(optIndex).getResult() * 100.0 / resultSum);
        }
        result.putData("options", resultOptions);
        return result;
    }
    
}
