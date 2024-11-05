package io.openvidu.call.java.models.polls.creation;

import io.openvidu.call.java.models.polls.LotteryPoll;
import io.openvidu.call.java.models.polls.Poll;
import io.openvidu.call.java.models.polls.PollStatus;

public class LotteryPollFactory extends PollFactory {

    @Override
    public Poll build() {
        if(!validate())
            return null;
        return new LotteryPoll((String) attributes.get("sessionId"), (Boolean) attributes.get("anonymous"), (String) attributes.get("question"), PollStatus.PENDING);
    }
    
}
