package io.openvidu.call.java.models.polls.exceptions;

import io.openvidu.call.java.models.polls.creation.PollDefinition;

public class InvalidDefinitionPollException extends PollException {

    private PollDefinition definition;

    public InvalidDefinitionPollException(PollDefinition definition, String errorMessage) {
        super(definition == null? null: definition.getSessionId(), errorMessage);
        this.definition = definition;
    }

    public InvalidDefinitionPollException(PollDefinition definition, String errorMessage, Throwable cause) {
        super(definition == null? null: definition.getSessionId(), errorMessage, cause);
        this.definition = definition;
    }

    public InvalidDefinitionPollException(PollDefinition definition, String errorMessage, Throwable cause, boolean enableSuppression, boolean writableStackTrace) {
        super(definition == null? null: definition.getSessionId(), errorMessage, cause, enableSuppression, writableStackTrace);
        this.definition = definition;
    }

    public PollDefinition getDefinition() {
        return definition;
    }

    public void setDefinition(PollDefinition definition) {
        this.definition = definition;
    }

}
