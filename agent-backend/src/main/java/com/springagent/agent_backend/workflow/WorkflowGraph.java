package com.springagent.agent_backend.workflow;

import java.util.*;

public class WorkflowGraph {

    public static class WorkflowDefinition {
        private String id;
        private String name;
        private String description;
        private List<WorkflowNode> nodes = new ArrayList<>();
        private List<WorkflowEdge> edges = new ArrayList<>();

        public WorkflowDefinition() {}

        public WorkflowDefinition(String id, String name, String description, List<WorkflowNode> nodes, List<WorkflowEdge> edges) {
            this.id = id;
            this.name = name;
            this.description = description;
            this.nodes = nodes != null ? nodes : new ArrayList<>();
            this.edges = edges != null ? edges : new ArrayList<>();
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public List<WorkflowNode> getNodes() { return nodes; }
        public void setNodes(List<WorkflowNode> nodes) { this.nodes = nodes; }
        public List<WorkflowEdge> getEdges() { return edges; }
        public void setEdges(List<WorkflowEdge> edges) { this.edges = edges; }
    }

    public static class WorkflowNode {
        private String id;
        private String type; // TRIGGER_MANUAL, TRIGGER_WEBHOOK, TRIGGER_CRON, AI_GEMINI_REASONER, HTTP_REST_REQUEST, CODE_TRANSFORM, SECURITY_SAST_SCAN, BRANCH_IF_ELSE, FILE_SYSTEM_OUTPUT
        private String name;
        private String description;
        private double posX;
        private double posY;
        private Map<String, Object> config = new HashMap<>();

        public WorkflowNode() {}

        public WorkflowNode(String id, String type, String name, String description, double posX, double posY, Map<String, Object> config) {
            this.id = id;
            this.type = type;
            this.name = name;
            this.description = description;
            this.posX = posX;
            this.posY = posY;
            this.config = config != null ? config : new HashMap<>();
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public double getPosX() { return posX; }
        public void setPosX(double posX) { this.posX = posX; }
        public double getPosY() { return posY; }
        public void setPosY(double posY) { this.posY = posY; }
        public Map<String, Object> getConfig() { return config; }
        public void setConfig(Map<String, Object> config) { this.config = config; }
    }

    public static class WorkflowEdge {
        private String id;
        private String source;
        private String target;
        private String sourceHandle = "default"; // default, true, false
        private String targetHandle = "default";

        public WorkflowEdge() {}

        public WorkflowEdge(String id, String source, String target, String sourceHandle) {
            this.id = id;
            this.source = source;
            this.target = target;
            this.sourceHandle = sourceHandle != null ? sourceHandle : "default";
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getSource() { return source; }
        public void setSource(String source) { this.source = source; }
        public String getTarget() { return target; }
        public void setTarget(String target) { this.target = target; }
        public String getSourceHandle() { return sourceHandle; }
        public void setSourceHandle(String sourceHandle) { this.sourceHandle = sourceHandle; }
        public String getTargetHandle() { return targetHandle; }
        public void setTargetHandle(String targetHandle) { this.targetHandle = targetHandle; }
    }

    public static class NodeExecutionResult {
        private String nodeId;
        private String nodeName;
        private String nodeType;
        private String status = "PENDING"; // PENDING, RUNNING, SUCCESS, FAILED, SKIPPED
        private long durationMs = 0;
        private Map<String, Object> inputData = new HashMap<>();
        private Map<String, Object> outputData = new HashMap<>();
        private List<String> logs = new ArrayList<>();
        private String errorMessage;

        public NodeExecutionResult() {}

        public NodeExecutionResult(String nodeId, String nodeName, String nodeType) {
            this.nodeId = nodeId;
            this.nodeName = nodeName;
            this.nodeType = nodeType;
        }

        public String getNodeId() { return nodeId; }
        public void setNodeId(String nodeId) { this.nodeId = nodeId; }
        public String getNodeName() { return nodeName; }
        public void setNodeName(String nodeName) { this.nodeName = nodeName; }
        public String getNodeType() { return nodeType; }
        public void setNodeType(String nodeType) { this.nodeType = nodeType; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public long getDurationMs() { return durationMs; }
        public void setDurationMs(long durationMs) { this.durationMs = durationMs; }
        public Map<String, Object> getInputData() { return inputData; }
        public void setInputData(Map<String, Object> inputData) { this.inputData = inputData; }
        public Map<String, Object> getOutputData() { return outputData; }
        public void setOutputData(Map<String, Object> outputData) { this.outputData = outputData; }
        public List<String> getLogs() { return logs; }
        public void setLogs(List<String> logs) { this.logs = logs; }
        public String getErrorMessage() { return errorMessage; }
        public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
    }

    public static class WorkflowRun {
        private String id;
        private String workflowId;
        private String workflowName;
        private String status = "RUNNING"; // RUNNING, SUCCESS, FAILED
        private long startTime;
        private long endTime;
        private long totalDurationMs = 0;
        private Map<String, NodeExecutionResult> nodeResults = new HashMap<>();
        private Map<String, Object> finalPayload = new HashMap<>();

        public WorkflowRun() {
            this.startTime = System.currentTimeMillis();
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getWorkflowId() { return workflowId; }
        public void setWorkflowId(String workflowId) { this.workflowId = workflowId; }
        public String getWorkflowName() { return workflowName; }
        public void setWorkflowName(String workflowName) { this.workflowName = workflowName; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public long getStartTime() { return startTime; }
        public void setStartTime(long startTime) { this.startTime = startTime; }
        public long getEndTime() { return endTime; }
        public void setEndTime(long endTime) { this.endTime = endTime; }
        public long getTotalDurationMs() { return totalDurationMs; }
        public void setTotalDurationMs(long totalDurationMs) { this.totalDurationMs = totalDurationMs; }
        public Map<String, NodeExecutionResult> getNodeResults() { return nodeResults; }
        public void setNodeResults(Map<String, NodeExecutionResult> nodeResults) { this.nodeResults = nodeResults; }
        public Map<String, Object> getFinalPayload() { return finalPayload; }
        public void setFinalPayload(Map<String, Object> finalPayload) { this.finalPayload = finalPayload; }
    }
}
