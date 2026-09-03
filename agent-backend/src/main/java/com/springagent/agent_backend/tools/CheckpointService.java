package com.springagent.agent_backend.tools;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CheckpointService {

    private final TerminalTool terminalTool;

    public CheckpointService(TerminalTool terminalTool) {
        this.terminalTool = terminalTool;
    }

    public String createCheckpoint(String description) {
        try {
            terminalTool.ensureGitInitialized();
            terminalTool.executeCommand("git add -A");
            String safeDesc = description.replaceAll("\"", "'");
            String commitMsg = "checkpoint: " + safeDesc;
            String out = terminalTool.executeCommand("git commit -m \"" + commitMsg + "\"");
            return out.isBlank() ? "Checkpoint created." : out;
        } catch (Exception e) {
            return "Checkpoint note: " + e.getMessage();
        }
    }

    public List<Map<String, String>> listCheckpoints() {
        List<Map<String, String>> list = new ArrayList<>();
        try {
            terminalTool.ensureGitInitialized();
            String log = terminalTool.executeCommand("git log -n 15 --pretty=format:\"%h|%s|%ar\"");
            if (log != null && !log.isBlank()) {
                String[] lines = log.split("\\r?\\n");
                for (String line : lines) {
                    String[] parts = line.replaceAll("\"", "").split("\\|", 3);
                    if (parts.length == 3) {
                        Map<String, String> cp = new HashMap<>();
                        cp.put("hash", parts[0].trim());
                        cp.put("message", parts[1].trim());
                        cp.put("time", parts[2].trim());
                        list.add(cp);
                    }
                }
            }
        } catch (Exception ignored) {}
        return list;
    }

    public String restoreCheckpoint(String commitHash) {
        if (commitHash == null || commitHash.isBlank()) {
            return "ERROR: Commit hash required.";
        }
        try {
            terminalTool.executeCommand("git checkout " + commitHash.trim() + " -- .");
            return "Workspace restored successfully to checkpoint: " + commitHash;
        } catch (Exception e) {
            return "ERROR restoring checkpoint: " + e.getMessage();
        }
    }
}
