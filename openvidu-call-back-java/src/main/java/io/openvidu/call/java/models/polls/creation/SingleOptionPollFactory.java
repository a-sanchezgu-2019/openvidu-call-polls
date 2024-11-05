package io.openvidu.call.java.models.polls.creation;

import java.util.List;

import javax.management.InvalidAttributeValueException;

import io.openvidu.call.java.models.polls.Poll;
import io.openvidu.call.java.models.polls.PollOption;
import io.openvidu.call.java.models.polls.PollStatus;
import io.openvidu.call.java.models.polls.SingleOptionPoll;

public class SingleOptionPollFactory extends PollWithOptionsFactory {

    @Override
    public Poll build() throws InvalidAttributeValueException {
        if(!validate())
            return null;
        List<PollOption> options = prepareOptions();
        return new SingleOptionPoll((String) attributes.get("sessionId"), (Boolean) attributes.get("anonymous"), (String) attributes.get("question"), PollStatus.PENDING, options);
    }
    
}
