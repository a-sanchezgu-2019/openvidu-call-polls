package io.openvidu.call.java.models.polls;


public enum PollStatus implements Cloneable {
    PENDING("pending"),
    RESPONDED("responded"),
    CLOSED("closed");
    
    private final String name;
    
    PollStatus(String name) {
        this.name = name;
    }
    
    @Override
    public String toString() {
        return this.name;
    }

    public static PollStatus fromString(String name) {
        PollStatus status = null;
        switch (name.toLowerCase()) {
            case "pending":
                status = PollStatus.PENDING;
                break;
            case "responded":
                status = PollStatus.RESPONDED;
                break;
            case "closed":
                status = PollStatus.CLOSED;
                break;
        }
        return status;
    }

}
