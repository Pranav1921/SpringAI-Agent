package com.springagent.agent_backend.model;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

public class AgentEvent {
    private String type;
    private String source;
    private String content;
    private String timestamp;
    private Map<String, Object> metadata;

    private static final DateTimeFormatter FORMATTER = 
            DateTimeFormatter.ofPattern("HH:mm:ss").withZone(ZoneId.systemDefault());

    public AgentEvent() {
        this.timestamp = FORMATTER.format(Instant.now());
        this.metadata = new HashMap<>();
    }

    public AgentEvent(String type, String source, String content) {
        this.type = type;
        this.source = source;
        this.content = content;
        this.timestamp = FORMATTER.format(Instant.now());
        this.metadata = new HashMap<>();
    }

    public AgentEvent(String type, String source, String content, Map<String, Object> metadata) {
        this.type = type;
        this.source = source;
        this.content = content;
        this.timestamp = FORMATTER.format(Instant.now());
        this.metadata = metadata != null ? metadata : new HashMap<>();
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public Map<String, Object> getMetadata() {
        return metadata;
    }

    public void setMetadata(Map<String, Object> metadata) {
        this.metadata = metadata;
    }
}