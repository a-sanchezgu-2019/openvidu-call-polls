package io.openvidu.call.java.models.polls.creation;

import java.util.Map;
import java.util.Objects;

import javax.management.InvalidAttributeValueException;

import io.openvidu.call.java.models.polls.Poll;
import io.openvidu.call.java.models.polls.exceptions.InvalidDefinitionPollException;

public class PollBuilder {

    private PollDefinition definition;

    public PollBuilder() {
        definition = new PollDefinition(null, null, null, false, null);
    }

    public PollBuilder(PollDefinition definition) {
        this.definition = Objects.requireNonNull(definition, "definition must not be null");
    }

    public void setSessionId(String sessionId) {
        definition.setSessionId(sessionId);
    }

    public String getSessionId() {
        return definition.getSessionId();
    }

    public void setType(String type) {
        definition.setType(type);
    }

    public String getType() {
        return definition.getType();
    }

    public void setQuestion(String question) {
        definition.setQuestion(question);
    }

    public String getQuestion() {
        return definition.getQuestion();
    }

    public void setAnonymous(boolean anonymous) {
        definition.setAnonymous(anonymous);
    }

    public boolean isAnonymous() {
        return definition.isAnonymous();
    }

    public void putArg(String arg, Object value) {
        definition.putArg(arg, value);
    }

    public void putArgs(Map<String, Object> args) {
        definition.putArgs(args);
    }

    public Object getArg(String arg) {
        return definition.getArg(arg);
    }

    public Map<String, Object> getArgs() {
        return definition.getArgs();
    }

    private PollFactory selectPollFactory() {
        // This switch is the extension point of poll types.
        // You should declarate new poll (polls package) and poll factory (polls.creation package) classes and link them here.
        switch(definition.getType().toLowerCase()) {
            case "lottery":
                return new LotteryPollFactory();
            case "single_option":
                return new SingleOptionPollFactory();
            case "multiple_option":
                return new MultipleOptionPollFactory();
            case "preference_order":
                return new PreferenceOrderPollFactory();
            default:
                return null;
        }
    }

    public boolean validate() {
        PollFactory factory = selectPollFactory();
        if(factory == null)
            return false;
        factory.set("sessionId", definition.getSessionId());
        factory.set("question", definition.getQuestion());
        factory.set("anonymous", definition.isAnonymous());
        factory.setAll(definition.getArgs());
        return factory.validate();
    }

    public Poll build() throws InvalidDefinitionPollException, InvalidAttributeValueException {
        PollFactory factory = selectPollFactory();
        if(factory == null)
            throw new InvalidDefinitionPollException(definition, "Invalid poll type: '"+definition.getType()+"'");
        factory.set("sessionId", definition.getSessionId());
        factory.set("question", definition.getQuestion());
        factory.set("anonymous", definition.isAnonymous());
        factory.setAll(definition.getArgs());
        if(!factory.validate())
            throw new InvalidDefinitionPollException(definition, "Invalid poll definition. The poll factory "+factory.getClass().getSimpleName()+" could not parse it.");
        return factory.build();
    }
    
}
