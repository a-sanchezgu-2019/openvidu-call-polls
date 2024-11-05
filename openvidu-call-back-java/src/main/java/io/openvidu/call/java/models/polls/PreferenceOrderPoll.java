package io.openvidu.call.java.models.polls;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import javax.management.InvalidAttributeValueException;

import io.openvidu.call.java.models.polls.exceptions.AlreadyClosedPollException;
import io.openvidu.call.java.models.polls.exceptions.AlreadyRespondedPollException;
import io.openvidu.call.java.models.polls.exceptions.InvalidResponsePollException;

public class PreferenceOrderPoll extends PollWithOptions {

    private int minOptions;
    private int maxOptions;
    private Map<String, List<Integer>> preferenceOrders = new HashMap<>();
    private List<Integer> pointsMapping = new ArrayList<>();

    public PreferenceOrderPoll(String sessionId, boolean anonymous, String question, PollStatus status, Map<String, String> participants, List<PollOption> options) throws InvalidAttributeValueException {
        super(sessionId, anonymous, question, status, participants, options);
        minOptions = 1;
        maxOptions = options.size();
        for(int points = maxOptions; points > 0; points--) {
            pointsMapping.add(points);
        }
    }

    public PreferenceOrderPoll(String sessionId, boolean anonymous, String question, PollStatus status, Map<String, String> participants, List<PollOption> options, int maxOptions) throws InvalidAttributeValueException {
        super(sessionId, anonymous, question, status, participants, options);
        if(maxOptions > options.size())
            throw new InvalidAttributeValueException("maxOptions cant be greater than the number of options");
        minOptions = 1;
        this.maxOptions = maxOptions;
        for(int points = maxOptions; points > 0; points--) {
            pointsMapping.add(points);
        }
    }

    public PreferenceOrderPoll(String sessionId, boolean anonymous, String question, PollStatus status, Map<String, String> participants, List<PollOption> options, int minOptions, int maxOptions) throws InvalidAttributeValueException {
        super(sessionId, anonymous, question, status, participants, options);
        if(minOptions < 1)
            throw new InvalidAttributeValueException("minOptions must be greater or equal to 1");
        if(maxOptions > options.size())
            throw new InvalidAttributeValueException("maxOptions cant be greater than the number of options");
        this.minOptions = minOptions;
        this.maxOptions = maxOptions;
        for(int points = maxOptions; points > 0; points--) {
            pointsMapping.add(points);
        }
    }

    public PreferenceOrderPoll(String sessionId, boolean anonymous, String question, PollStatus status, Map<String, String> participants, List<PollOption> options, List<Integer> pointsMapping) throws InvalidAttributeValueException {
        super(sessionId, anonymous, question, status, participants, options);
        minOptions = 1;
        maxOptions = options.size();
        this.pointsMapping = Objects.requireNonNull(pointsMapping, "pointsMapping must not be null");
        if(this.pointsMapping.size() < maxOptions)
            throw new InvalidAttributeValueException("pointsMapping size must be greater or equal to maxOptions.");
    }

    public PreferenceOrderPoll(String sessionId, boolean anonymous, String question, PollStatus status, Map<String, String> participants, List<PollOption> options, int maxOptions, List<Integer> pointsMapping) throws InvalidAttributeValueException {
        super(sessionId, anonymous, question, status, participants, options);
        if(maxOptions > options.size())
            throw new InvalidAttributeValueException("maxOptions cant be greater than the number of options");
        minOptions = 1;
        this.maxOptions = maxOptions;
        this.pointsMapping = Objects.requireNonNull(pointsMapping, "pointsMapping must not be null");
        if(this.pointsMapping.size() < maxOptions)
            throw new InvalidAttributeValueException("pointsMapping size must be greater or equal to maxOptions.");
    }
    
    public PreferenceOrderPoll(String sessionId, boolean anonymous, String question, PollStatus status, Map<String, String> participants, List<PollOption> options, int minOptions, int maxOptions, List<Integer> pointsMapping) throws InvalidAttributeValueException {
        super(sessionId, anonymous, question, status, participants, options);
        if(minOptions < 1)
            throw new InvalidAttributeValueException("minOptions must be greater or equal to 1");
        if(maxOptions > options.size())
            throw new InvalidAttributeValueException("maxOptions cant be greater than the number of options");
        this.minOptions = minOptions;
        this.maxOptions = maxOptions;
        this.pointsMapping = Objects.requireNonNull(pointsMapping, "pointsMapping must not be null");
        if(this.pointsMapping.size() < maxOptions)
            throw new InvalidAttributeValueException("pointsMapping size must be greater or equal to maxOptions.");
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
    
    public List<Integer> getPointsMapping() {
        return this.pointsMapping;
    }

    public void setPointsMapping(List<Integer> pointsMapping) {
        this.pointsMapping = pointsMapping;
    }

    public List<Integer> getPreferenceOrder(String participantId) {
        return this.preferenceOrders.get(participantId);
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
        for(int optionIndexIndex = 0; optionIndexIndex < options.size(); optionIndexIndex++) {
            int optionIndex = options.get(optionIndexIndex);
            int points = pointsMapping.get(optionIndexIndex);
            PollOption option = super.getOption(optionIndex);
            option.modifyResult(points);
            option.addParticipant(response.getToken());
        }
        this.preferenceOrders.put(response.getToken(), options);
    }

    @Override
    public boolean validate() {
        if(this.preferenceOrders.size() != this.getParticipants().size())
            return false;
        int optIndex;
        List<Integer> calculatedOptionResults = new ArrayList<>();
        for(optIndex = 0; optIndex < this.getNumOptions(); optIndex++)
            calculatedOptionResults.add(0);
        for(List<Integer> preferenceOrder: this.preferenceOrders.values()) {
            for(int prefIndex = 0; prefIndex < preferenceOrder.size(); prefIndex++) {
                optIndex = preferenceOrder.get(prefIndex);
                calculatedOptionResults.set(optIndex, calculatedOptionResults.get(optIndex) + this.pointsMapping.get(prefIndex));
            }
        }
        for(optIndex = 0; optIndex < this.getNumOptions(); optIndex++)
            if(this.getOption(optIndex).getResult() != calculatedOptionResults.get(optIndex))
                return false;
        return true;
    }

    @Override
    public PollResult generatePollResult() {
        PollResult result = super.generatePollResult();
        if(result == null)
            return null;
        result.setType("preference_order");
        result.putData("minOptions", this.minOptions);
        result.putData("maxOptions", this.maxOptions);
        result.putData("pointsMapping", this.pointsMapping);
        Map<String, List<Integer>> resultPreferenceOrders = new LinkedHashMap<>();
        if(!this.isAnonymous()) {
            for(Map.Entry<String, List<Integer>> entry: this.preferenceOrders.entrySet()) {
                String nickname = this.getParticipants().get(entry.getKey());
                if(nickname != null)
                    resultPreferenceOrders.put(nickname, entry.getValue());
            }
        }
        result.putData("preferenceOrders", resultPreferenceOrders);
        return result;
    }
    
}
