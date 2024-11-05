package io.openvidu.call.java.models.polls.creation;

import java.util.HashMap;
import java.util.Map;

public class PollDefinition {

    private String sessionId;
    private String type;
    private String question;
    private boolean anonymous;
    private Map<String, Object> args;

    public PollDefinition(String sessionId, String type, String question, boolean anonymous, Map<String, Object> args) {
        this.sessionId = sessionId;
        this.type = type;
        this.question = question;
        this.anonymous = anonymous;
        this.args = args;
        if(this.args == null)
            this.args = new HashMap<>();
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public boolean isAnonymous() {
        return anonymous;
    }

    public void setAnonymous(boolean anonymous) {
        this.anonymous = anonymous;
    }

    public Map<String, Object> getArgs() {
        return args;
    }

    public void setArgs(Map<String, Object> args) {
        this.args = args;
    }

    public void putArgs(Map<String, Object> args) {
        this.args.putAll(args);
    }

    public void putArg(String name, Object arg) {
        args.put(name, arg);
    }

    public Object getArg(String name) {
        return args.get(name);
    }
    
}
