package io.openvidu.call.java.models.polls;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

public class PollResponse {

    private String token;
    private String nickname;
    private Map<String, Object> args;

    public PollResponse(String token, String nickname, Map<String, Object> args) {
        this.token = Objects.requireNonNull(token, "token must not be null");
        this.nickname = Objects.requireNonNull(nickname, "nickname must not be null");
        this.args = args;
        if(this.args == null)
            this.args = new HashMap<>();
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = Objects.requireNonNull(token, "token must not be null");
    }

    public String getNickname() {
        return nickname;
    }

    public void setNickname(String nickname) {
        this.nickname = Objects.requireNonNull(nickname, "nickname must not be null");
    }

    public Map<String, Object> getArgs() {
        return args;
    }

    public void setArgs(Map<String, Object> args) {
        this.args = Objects.requireNonNull(args, "args must not be null");
    }

    public void putArgs(Map<String, Object> args) {
        this.args.putAll(args);
    }

    public void setArg(String name, Object arg) {
        args.put(name, arg);
    }

    public Object getArg(String name) {
        return args.get(name);
    }

    public boolean hasArg(String name) {
        return args.containsKey(name);
    }
    
}
