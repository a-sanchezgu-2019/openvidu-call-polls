package io.openvidu.call.java.models.polls.creation;

import java.util.ArrayList;
import java.util.List;

import io.openvidu.call.java.models.polls.PollOption;

public abstract class PollWithOptionsFactory extends PollFactory {

    @Override
    public boolean validate() {
        if(!super.validate())
            return false;
        Object objOptions = attributes.get("options");
        if(objOptions == null || !(objOptions instanceof List))
            return false;
        for(Object objOption: (List<?>) objOptions) {
            if(objOption == null || !(objOption instanceof String))
                return false;
        }
        return true;
    }

    protected List<PollOption> prepareOptions() {
        Object objOptions = attributes.get("options");
        if(objOptions == null || !(objOptions instanceof List))
            return null;
        List<PollOption> options = new ArrayList<>();
        for(Object objOption: (List<?>) objOptions) {
            if(objOption == null || !(objOption instanceof String))
                return null;
            options.add(new PollOption((String) objOption, 0, null));
        }
        return options;
    }
    
}