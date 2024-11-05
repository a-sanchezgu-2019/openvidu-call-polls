package io.openvidu.call.java.models.polls.creation;

import java.util.List;

import javax.management.InvalidAttributeValueException;

import io.openvidu.call.java.models.polls.MultipleOptionPoll;
import io.openvidu.call.java.models.polls.Poll;
import io.openvidu.call.java.models.polls.PollOption;
import io.openvidu.call.java.models.polls.PollStatus;

public class MultipleOptionPollFactory extends PollWithOptionsFactory {

    @Override
    public boolean validate() {
        if(!super.validate())
            return false;
        Object objMinOptions = attributes.get("minOptions");
        if(objMinOptions == null || !(objMinOptions instanceof Integer || objMinOptions instanceof Double || objMinOptions instanceof Float))
            return false;
        Object objMaxOptions = attributes.get("maxOptions");
        if(objMaxOptions == null || !(objMaxOptions instanceof Integer || objMaxOptions instanceof Double || objMaxOptions instanceof Float))
            return false;
        return true;
    }

    @Override
    public Poll build() throws InvalidAttributeValueException {
        if(!validate())
            return null;
        List<PollOption> options = prepareOptions();
        Integer minOptions = attributes.get("minOptions") instanceof Integer? (Integer) attributes.get("minOptions"): ((Double) attributes.get("minOptions")).intValue();
        Integer maxOptions = attributes.get("maxOptions") instanceof Integer? (Integer) attributes.get("maxOptions"): ((Double) attributes.get("maxOptions")).intValue();
        return new MultipleOptionPoll((String) attributes.get("sessionId"), (Boolean) attributes.get("anonymous"), (String) attributes.get("question"), PollStatus.PENDING, null, options, minOptions, maxOptions);
    }
    
}
