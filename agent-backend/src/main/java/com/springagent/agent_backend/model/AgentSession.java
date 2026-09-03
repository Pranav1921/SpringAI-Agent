package com.springagent.agent_backend.model;

import java.util.ArrayList;
import java.util.List;

public class AgentSession {
    public enum State {RUNNING, AWAITING_INPUT, COMPLETED}

    private State state = State.RUNNING;
    private String pendingQuestion;
    private final List<String> conversationHistory = new ArrayList<>();


    public State getState() {
        return state;
    }
    public void setState(State state){
        this.state= state;
    }

    public String getPendingQuestion(){
        return pendingQuestion;
    }
    public void setPendingQuestion(String pendingQuestion){
        this.pendingQuestion=pendingQuestion;


    }
    public List<String> getConversationHistory(){
        return conversationHistory;
    }
}
