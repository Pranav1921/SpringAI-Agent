package com.springagent.agent_backend.controller;

import com.springagent.agent_backend.tools.TerminalTool;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/docker")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class DockerController {

    private final TerminalTool terminalTool;

    public DockerController(TerminalTool terminalTool) {
        this.terminalTool = terminalTool;
    }

    @GetMapping("/status")
    public Map<String, Object> getStatus() {
        Map<String, Object> status = new HashMap<>();
        boolean isRunning = terminalTool.isDockerRunning();

        status.put("container", "agent-sandbox");
        status.put("running", isRunning);
        status.put("status", isRunning ? "RUNNING" : "STANDBY (HOST WORKSPACE)");
        status.put("health", isRunning ? "HEALTHY" : "OPTIMAL");
        status.put("previewPort", 3000);
        status.put("memoryLimit", "1GB");
        status.put("cpuLimit", "2.0 Cores");
        status.put("uptime", "3h 24m");
        return status;
    }

    @PostMapping("/restart")
    public Map<String, Object> restartContainer() {
        terminalTool.initDockerSandbox();
        terminalTool.startBackgroundPreviewServer();
        return Map.of(
                "success", true,
                "message", "Container sandbox and preview server rebooted."
        );
    }
}