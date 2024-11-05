package io.openvidu.call.java.models.polls.creation;

import java.util.HashMap;
import java.util.Map;

import javax.management.InvalidAttributeValueException;

import io.openvidu.call.java.models.polls.Poll;

public abstract class PollFactory {
    
    protected Map<String, Object> attributes = new HashMap<>();

    public abstract Poll build() throws InvalidAttributeValueException;

    public boolean validate() {
        Object objSessionId = attributes.get("sessionId");
        if(objSessionId == null || !(objSessionId instanceof String))
            return false;
        Object objQuestion = attributes.get("question");
        if(objQuestion == null || !(objQuestion instanceof String))
            return false;
        Object objAnonymous = attributes.get("anonymous");
        if(objAnonymous == null || !(objAnonymous instanceof Boolean))
            return false;
        return true;
    }

    public void clear() {
        attributes.clear();
    }

    public void set(String attr, Object value) {
        attributes.put(attr, value);
    }

    public void setAll(Map<String, Object> attrs) {
        attributes.putAll(attrs);
    }

    public Object get(String attr) {
        return attributes.get(attr);
    }

    public boolean has(String attr) {
        return attributes.containsKey(attr);
    }

    public Object remove(String attr) {
        return attributes.remove(attr);
    }

}
