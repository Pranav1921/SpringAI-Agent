package com.springagent.agent_backend.controller;

import com.springagent.agent_backend.tools.TerminalTool;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/terminal")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class TerminalController {

    private final TerminalTool terminalTool;

    public TerminalController(TerminalTool terminalTool) {
        this.terminalTool = terminalTool;
    }

    @PostMapping("/exec")
    public Map<String, String> executeCommand(@RequestBody Map<String, String> body) {
        String command = body.get("command");
        if (command == null || command.isBlank()) {
            return Map.of("error", "Command is required", "output", "");
        }

        try {
            String output = terminalTool.executeCommand(command);
            return Map.of(
                    "status", "SUCCESS",
                    "command", command,
                    "output", output
            );
        } catch (Exception e) {
            return Map.of(
                    "status", "ERROR",
                    "command", command,
                    "output", "ERROR: " + e.getMessage()
            );
        }
    }
}
