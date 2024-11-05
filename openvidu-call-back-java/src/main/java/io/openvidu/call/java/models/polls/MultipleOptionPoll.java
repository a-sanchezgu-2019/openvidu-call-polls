package io.openvidu.call.java.models.polls;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.management.InvalidAttributeValueException;

import io.openvidu.call.java.models.polls.exceptions.AlreadyClosedPollException;
import io.openvidu.call.java.models.polls.exceptions.AlreadyRespondedPollException;
import io.openvidu.call.java.models.polls.exceptions.InvalidResponsePollException;

public class MultipleOptionPoll extends PollWithOptions {

    private int minOptions;
    private int maxOptions;

    public MultipleOptionPoll(String sessionId, boolean anonymous, String question, PollStatus status, Map<String, String> participants, List<PollOption> options) throws InvalidAttributeValueException {
        super(sessionId, anonymous, question, status, participants, options);
        minOptions = 1;
        maxOptions = options.size();
    }

    public MultipleOptionPoll(String sessionId, boolean anonymous, String question, PollStatus status, Map<String, String> participants, List<PollOption> options, int maxOptions) throws InvalidAttributeValueException {
        super(sessionId, anonymous, question, status, participants, options);
        if(maxOptions > options.size())
            throw new InvalidAttributeValueException("maxOptions cant be greater than the number of options");
        if(maxOptions < minOptions)
            throw new InvalidAttributeValueException("maxOptions must be greater or equal to minOptions");
        minOptions = 1;
        this.maxOptions = maxOptions;
    }

    public MultipleOptionPoll(String sessionId, boolean anonymous, String question, PollStatus status, Map<String, String> participants, List<PollOption> options, int minOptions, int maxOptions) throws InvalidAttributeValueException {
        super(sessionId, anonymous, question, status, participants, options);
        if(minOptions < 1)
            throw new InvalidAttributeValueException("minOptions must be greater or equal to 1");
        if(maxOptions > options.size())
            throw new InvalidAttributeValueException("maxOptions cant be greater than the number of options");
        if(maxOptions < minOptions)
            throw new InvalidAttributeValueException("maxOptions must be greater or equal to minOptions");
        this.minOptions = minOptions;
        this.maxOptions = maxOptions;
    }

    private List<Integer> extractResponseOptions(PollResponse response) {
        List<Integer> options = new ArrayList<>();
        Object objOptions = response.getArg("options");
        if(objOptions == null || !(objOptions instanceof String))
            return null;
        for(String objOption: ((String) objOptions).split(",")) {
            int option;
            try {
                option = Integer.valueOf(objOption);
            } catch(NumberFormatException e) {
                return null;
            }
            options.add(option);
        }
        return options;
    }

    public int getMinOptions() {
        return this.minOptions;
    }

    public int getMaxOptions() {
        return this.maxOptions;
    }

    public void setMinOptions(int minOptions) {
        this.minOptions = minOptions;
    }

    public void setMaxOptions(int maxOptions) {
        this.maxOptions = maxOptions;
    }

    @Override
    public boolean validResponse(PollResponse response) {
        Object objOptions = response.getArg("options");
        if(objOptions == null || !(objOptions instanceof String))
            return false;
        List<Integer> options = extractResponseOptions(response);
        int numPollOptions = super.getNumOptions();
        int numResponseOptions = options.size();
        if(numResponseOptions > maxOptions || numResponseOptions < minOptions)
            return false;
        for(Integer option: options) {
            if(option == null || option < 0 || option >= numPollOptions)
                return false;
        }
        return true;
    }

    @Override
    public void respond(PollResponse response) throws AlreadyRespondedPollException, AlreadyClosedPollException, InvalidResponsePollException {
        super.respond(response);
        List<Integer> options = extractResponseOptions(response);
        for(int optionIndex: options) {
            PollOption option = super.getOption(optionIndex);
            option.modifyResult(1);
            option.addParticipant(response.getToken());
        }
    }

    @Override
    public boolean validate() {
        if(!super.validate())
            return false;
        Map<String, Integer> numResponses = new HashMap<>();
        for(PollOption option: super.getOptions()) {
            for(String participantToken: option.getParticipants()) {
                if(!numResponses.containsKey(participantToken))
                    numResponses.put(participantToken, 1);
                else
                    numResponses.put(participantToken, numResponses.get(participantToken) + 1);
            }
        }
        for(int numResp: numResponses.values()) {
            if(numResp > maxOptions || numResp < minOptions)
                return false;
        }
        return true;
    }

    @Override
    public PollResult generatePollResult() {
        PollResult result = super.generatePollResult();
        if(result == null)
            return null;
        result.setType("multiple_option");
        result.putData("minOptions", this.minOptions);
        result.putData("maxOptions", this.maxOptions);
        return result;
    }

}