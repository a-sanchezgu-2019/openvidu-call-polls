package io.openvidu.call.java.models.polls.creation;

import java.util.ArrayList;
import java.util.List;

import javax.management.InvalidAttributeValueException;

import io.openvidu.call.java.models.polls.Poll;
import io.openvidu.call.java.models.polls.PollOption;
import io.openvidu.call.java.models.polls.PollStatus;
import io.openvidu.call.java.models.polls.PreferenceOrderPoll;

public class PreferenceOrderPollFactory extends PollWithOptionsFactory {

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
        Integer minOptions = attributes.get("minOptions") instanceof Integer? (Integer) attributes.get("minOptions"): ((Double) attributes.get("minOptions")).intValue();
        Integer maxOptions = attributes.get("maxOptions") instanceof Integer? (Integer) attributes.get("maxOptions"): ((Double) attributes.get("maxOptions")).intValue();
        if(minOptions > maxOptions)
            return false;
        Object objPointsMapping = attributes.get("pointsMapping");
        if(objPointsMapping != null && !(objPointsMapping instanceof List))
            return false;
        List<?> pointsMapping = (List<?>) objPointsMapping;
        if(pointsMapping == null)
            return false;
        for(Object objPointsMap: pointsMapping) {
            if(objPointsMap == null || !(objPointsMap instanceof Integer || objPointsMap instanceof Double || objPointsMap instanceof Float))
                return false;
        }
        if(pointsMapping.size() < maxOptions)
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
        List<Integer> pointsMapping = new ArrayList<>();
        for(Object pointsMap: (List<?>) attributes.get("pointsMapping")) {
            if(pointsMap instanceof Integer)
                pointsMapping.add((Integer) pointsMap);
            else if(pointsMap instanceof Double || pointsMap instanceof Float)
                pointsMapping.add(((Double) pointsMap).intValue());
        }
        return new PreferenceOrderPoll((String) attributes.get("sessionId"), (Boolean) attributes.get("anonymous"), (String) attributes.get("question"), PollStatus.PENDING, null, options, minOptions, maxOptions, pointsMapping);
    }

}
