package io.openvidu.call.java.models.polls;

import java.util.List;
import java.util.Map;

import javax.management.InvalidAttributeValueException;

import io.openvidu.call.java.models.polls.exceptions.AlreadyClosedPollException;
import io.openvidu.call.java.models.polls.exceptions.AlreadyRespondedPollException;
import io.openvidu.call.java.models.polls.exceptions.InvalidResponsePollException;

public class SingleOptionPoll extends PollWithOptions {

    public SingleOptionPoll(String sessionId, boolean anonymous, String question, PollStatus status, List<PollOption> options) throws InvalidAttributeValueException {
        super(sessionId, anonymous, question, status, options);
    }

    public SingleOptionPoll(String sessionId, boolean anonymous, String question, PollStatus status, Map<String, String> participants, List<PollOption> options) throws InvalidAttributeValueException {
        super(sessionId, anonymous, question, status, participants, options);
    }

    private Integer parseOptionIndex(Object obj) {
        if(obj == null)
            return null;
        if(obj instanceof Integer)
            return (Integer) obj;
        if(obj instanceof Double || obj instanceof Float)
            return ((Double) obj).intValue();
        return null;
    }

    @Override
    public boolean validResponse(PollResponse response) {
        Integer optionIndex = parseOptionIndex(response.getArg("optionIndex"));
        if(optionIndex == null)
            return false;
        if(optionIndex >= super.getOptions().size())
            return false;
        return true;
    }

    @Override
    public void respond(PollResponse response) throws AlreadyRespondedPollException, AlreadyClosedPollException, InvalidResponsePollException {
        super.respond(response);
        PollOption option = super.getOption(parseOptionIndex(response.getArg("optionIndex")));
        option.modifyResult(1);
        option.addParticipant(response.getToken());
    }

    @Override
    public boolean validate() {
        if(!super.validate())
            return false;
        int sum = 0;
        for(PollOption option: super.getOptions()) {
            int result = option.getResult();
            if(option.getParticipants().size() != result)
                return false;
            sum += result;
        }
        return sum == super.getTotalParticipants();
    }

    @Override
    public PollResult generatePollResult() {
        PollResult result = super.generatePollResult();
        if(result == null)
            return null;
        result.setType("single_option");
        return result;
    }
    
}
