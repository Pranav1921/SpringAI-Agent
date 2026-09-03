package com.springagent.agent_backend.controller;

import com.springagent.agent_backend.agent.AgentService;
import com.springagent.agent_backend.model.AgentEvent;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class AgentController {

    private final AgentService agentService;
    private final com.springagent.agent_backend.tools.CheckpointService checkpointService;
    private final com.springagent.agent_backend.tools.FileSystemTool fileSystemTool;

    public AgentController(AgentService agentService,
                           com.springagent.agent_backend.tools.CheckpointService checkpointService,
                           com.springagent.agent_backend.tools.FileSystemTool fileSystemTool) {
        this.agentService = agentService;
        this.checkpointService = checkpointService;
        this.fileSystemTool = fileSystemTool;
    }

    private static final Map<String, Map<String, Object>> userSessions = new java.util.concurrent.ConcurrentHashMap<>();

    private final RestClient githubClient = RestClient.builder()
            .baseUrl("https://api.github.com")
            .defaultHeader("Accept", "application/vnd.github.v3+json")
            .build();

    @GetMapping("/user")
    public Map<String, Object> getUserProfile(@AuthenticationPrincipal OAuth2User principal,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantId) {
        String tenantKey = (tenantId != null && !tenantId.isBlank()) ? tenantId.toLowerCase() : "pranav1921";

        if (userSessions.containsKey(tenantKey)) {
            return userSessions.get(tenantKey);
        }

        if (principal != null) {
            String login = principal.getAttribute("login") != null ? principal.getAttribute("login").toString() : tenantKey;
            String name = principal.getAttribute("name") != null ? principal.getAttribute("name").toString() : login;
            String avatar = principal.getAttribute("avatar_url") != null ? principal.getAttribute("avatar_url").toString()
                    : "https://avatars.githubusercontent.com/u/9919?v=4";

            Map<String, Object> profile = new HashMap<>();
            profile.put("login", login);
            profile.put("name", name);
            profile.put("avatar_url", avatar);
            profile.put("organization", "GitHub • " + login);
            profile.put("html_url", "https://github.com/" + login);
            profile.put("authenticated", true);
            profile.put("authType", "GITHUB_OAUTH");
            userSessions.put(login.toLowerCase(), profile);
            return profile;
        }

        // Fetch real public profile from GitHub API
        try {
            Map<String, Object> gh = githubClient.get()
                    .uri("/users/" + tenantKey)
                    .retrieve()
                    .body(Map.class);
            if (gh != null && gh.containsKey("login")) {
                String login = (String) gh.get("login");
                Map<String, Object> profile = new HashMap<>();
                profile.put("login", login);
                profile.put("name", gh.getOrDefault("name", login));
                profile.put("avatar_url", gh.getOrDefault("avatar_url", "https://github.com/" + login + ".png"));
                profile.put("organization", gh.getOrDefault("company", "GitHub • " + login));
                profile.put("bio", gh.getOrDefault("bio", ""));
                profile.put("public_repos", gh.getOrDefault("public_repos", 0));
                profile.put("followers", gh.getOrDefault("followers", 0));
                profile.put("html_url", gh.getOrDefault("html_url", "https://github.com/" + login));
                profile.put("authenticated", true);
                profile.put("authType", "GITHUB_PUBLIC");
                userSessions.put(tenantKey, profile);
                return profile;
            }
        } catch (Exception ignored) {}

        Map<String, Object> defaultProfile = new HashMap<>();
        defaultProfile.put("login", tenantKey);
        defaultProfile.put("name", tenantKey);
        defaultProfile.put("avatar_url", "https://github.com/" + tenantKey + ".png");
        defaultProfile.put("organization", "Workspace • " + tenantKey);
        defaultProfile.put("html_url", "https://github.com/" + tenantKey);
        defaultProfile.put("authenticated", true);
        defaultProfile.put("authType", "LOCAL");
        return defaultProfile;
    }

    @PostMapping("/user/login")
    public Map<String, Object> loginUser(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String token = body.get("token");
        String cleanUser = (username != null && !username.isBlank()) ? username.trim() : "Pranav1921";

        // Try authenticated GitHub query if token or username provided
        if (token != null && !token.isBlank()) {
            try {
                Map<String, Object> gh = githubClient.get()
                        .uri("/user")
                        .header("Authorization", "Bearer " + token.trim())
                        .retrieve()
                        .body(Map.class);
                if (gh != null && gh.containsKey("login")) {
                    String login = (String) gh.get("login");
                    Map<String, Object> profile = new HashMap<>();
                    profile.put("login", login);
                    profile.put("name", gh.getOrDefault("name", login));
                    profile.put("avatar_url", gh.getOrDefault("avatar_url", "https://github.com/" + login + ".png"));
                    profile.put("organization", gh.getOrDefault("company", "GitHub • " + login));
                    profile.put("bio", gh.getOrDefault("bio", ""));
                    profile.put("public_repos", gh.getOrDefault("public_repos", 0));
                    profile.put("followers", gh.getOrDefault("followers", 0));
                    profile.put("html_url", gh.getOrDefault("html_url", "https://github.com/" + login));
                    profile.put("authenticated", true);
                    profile.put("authType", "GITHUB_PAT");
                    userSessions.put(login.toLowerCase(), profile);
                    return profile;
                }
            } catch (Exception e) {
                System.err.println("GitHub token auth failed: " + e.getMessage());
            }
        }

        try {
            Map<String, Object> gh = githubClient.get()
                    .uri("/users/" + cleanUser)
                    .retrieve()
                    .body(Map.class);
            if (gh != null && gh.containsKey("login")) {
                String login = (String) gh.get("login");
                Map<String, Object> profile = new HashMap<>();
                profile.put("login", login);
                profile.put("name", gh.getOrDefault("name", login));
                profile.put("avatar_url", gh.getOrDefault("avatar_url", "https://github.com/" + login + ".png"));
                profile.put("organization", gh.getOrDefault("company", "GitHub • " + login));
                profile.put("bio", gh.getOrDefault("bio", ""));
                profile.put("public_repos", gh.getOrDefault("public_repos", 0));
                profile.put("followers", gh.getOrDefault("followers", 0));
                profile.put("html_url", gh.getOrDefault("html_url", "https://github.com/" + login));
                profile.put("authenticated", true);
                profile.put("authType", "GITHUB_PUBLIC");
                userSessions.put(cleanUser.toLowerCase(), profile);
                return profile;
            }
        } catch (Exception ignored) {}

        Map<String, Object> profile = new HashMap<>();
        profile.put("login", cleanUser);
        profile.put("name", cleanUser);
        profile.put("avatar_url", "https://github.com/" + cleanUser + ".png");
        profile.put("organization", "Workspace • " + cleanUser);
        profile.put("html_url", "https://github.com/" + cleanUser);
        profile.put("authenticated", true);
        profile.put("authType", "LOCAL");

        userSessions.put(cleanUser.toLowerCase(), profile);
        return profile;
    }

    @PostMapping("/user/logout")
    public Map<String, Object> logoutUser(@RequestHeader(value = "X-Tenant-Id", required = false) String tenantId) {
        if (tenantId != null) {
            userSessions.remove(tenantId.toLowerCase());
        }
        return Map.of("status", "LOGGED_OUT", "message", "User session cleared");
    }

    @PostMapping("/task")
    public Map<String, Object> executeTask(@RequestBody TaskRequest request) {
        String mode = request.getMode() != null ? request.getMode() : "agent";
        String prompt = request.getPrompt() != null ? request.getPrompt() : "";
        String systemInstruction = request.getSystemInstruction();
        Double temperature = request.getTemperature();

        if ("ask".equalsIgnoreCase(mode)) {
            String answer = agentService.executeAskMode(prompt, systemInstruction, temperature);
            return Map.of(
                    "status", "SUCCESS",
                    "mode", mode,
                    "prompt", prompt,
                    "response", answer != null ? answer : "",
                    "message", "Answer generated successfully");
        }

        // Launch asynchronous execution while streaming thoughts and answer to SSE
        agentService.processTaskAsync(prompt, mode);

        return Map.of(
                "status", "ACCEPTED",
                "mode", mode,
                "prompt", prompt,
                "message", "Task queued for execution");
    }

    // --- Google AI Studio APIs ---

    @GetMapping("/studio/models")
    public List<Map<String, Object>> getStudioModels() {
        return List.of(
                Map.of(
                        "id", "spring-ai-pro",
                        "name", "Spring AI Pro",
                        "description", "Autonomous coding, architecture synthesis & reasoning model",
                        "contextWindow", 128000,
                        "recommended", true
                ),
                Map.of(
                        "id", "deepseek-coder:6.7b",
                        "name", "DeepSeek Coder 6.7B",
                        "description", "Specialized low-latency code synthesis engine (Local Ollama)",
                        "contextWindow", 16384,
                        "recommended", false
                ),
                Map.of(
                        "id", "spring-ai-flash",
                        "name", "Spring AI Flash",
                        "description", "High-frequency reasoning and real-time query model",
                        "contextWindow", 32768,
                        "recommended", false
                )
        );
    }

    @PostMapping("/studio/get-code")
    public Map<String, String> getCodeSnippets(@RequestBody TaskRequest request) {
        String prompt = request.getPrompt() != null ? request.getPrompt().replace("\"", "\\\"").replace("\n", "\\n") : "Hello";
        String system = request.getSystemInstruction() != null ? request.getSystemInstruction().replace("\"", "\\\"").replace("\n", "\\n") : "You are Spring AI Agent.";
        double temp = request.getTemperature() != null ? request.getTemperature() : 0.7;
        String model = request.getModel() != null ? request.getModel() : "spring-ai-pro";

        String curlCode = """
curl -X POST http://localhost:8080/api/task \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "%s",
    "systemInstruction": "%s",
    "model": "%s",
    "temperature": %.2f,
    "mode": "ask"
  }'
""".formatted(prompt, system, model, temp).trim();

        String pythonCode = """
# Install: pip install requests
import requests

url = "http://localhost:8080/api/task"
payload = {
    "prompt": "%s",
    "systemInstruction": "%s",
    "model": "%s",
    "temperature": %.2f,
    "mode": "ask"
}

response = requests.post(url, json=payload)
print(response.json().get("response"))
""".formatted(prompt, system, model, temp).trim();

        String tsCode = """
// Run in Node.js or Browser
async function runSpringAIPrompt() {
  const response = await fetch("http://localhost:8080/api/task", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: "%s",
      systemInstruction: "%s",
      model: "%s",
      temperature: %.2f,
      mode: "ask"
    })
  });
  const data = await response.json();
  console.log(data.response);
}

runSpringAIPrompt();
""".formatted(prompt, system, model, temp).trim();

        String javaCode = """
// Spring AI & HTTP Client
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class SpringAIClient {
    public static void main(String[] args) throws Exception {
        String json = \"\"\"
            {
              "prompt": "%s",
              "systemInstruction": "%s",
              "model": "%s",
              "temperature": %.2f,
              "mode": "ask"
            }
            \"\"\";

        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:8080/api/task"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        System.out.println(response.body());
    }
}
""".formatted(prompt, system, model, temp).trim();

        return Map.of(
                "curl", curlCode,
                "python", pythonCode,
                "typescript", tsCode,
                "java", javaCode
        );
    }

    private static final List<Map<String, Object>> savedStudioPrompts = new java.util.concurrent.CopyOnWriteArrayList<>();

    @GetMapping("/studio/prompts")
    public List<Map<String, Object>> getSavedPrompts() {
        if (savedStudioPrompts.isEmpty()) {
            savedStudioPrompts.add(Map.of(
                    "id", "sample-1",
                    "title", "Full-Stack Web App Synthesizer",
                    "prompt", "Build a modern interactive dashboard with glassmorphism cards and charts",
                    "systemInstruction", "You are Spring AI Agent, an expert AI Software Architect.",
                    "temperature", 0.7,
                    "updatedAt", "Just now"
            ));
        }
        return savedStudioPrompts;
    }

    @PostMapping("/studio/prompts")
    public Map<String, Object> saveStudioPrompt(@RequestBody Map<String, Object> promptData) {
        String id = promptData.getOrDefault("id", java.util.UUID.randomUUID().toString()).toString();
        Map<String, Object> item = new HashMap<>(promptData);
        item.put("id", id);
        item.put("updatedAt", java.time.LocalTime.now().toString().substring(0, 5));
        savedStudioPrompts.removeIf(p -> id.equals(p.get("id")));
        savedStudioPrompts.add(0, item);
        return item;
    }

    @GetMapping(value = "/agent/events", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamEvents() {
        SseEmitter emitter = new SseEmitter(0L); // Infinite timeout, no AsyncRequestTimeoutException
        agentService.registerEmitter(emitter);
        return emitter;
    }

    @GetMapping("/agent/history")
    public List<AgentEvent> getHistory() {
        return agentService.getEventHistory();
    }

    @PostMapping("/agent/clear")
    public Map<String, String> clearMemory() {
        agentService.clearMemory();
        return Map.of("status", "MEMORY_CLEARED");
    }

    @PostMapping("/agent/stop")
    public Map<String, String> stopTask() {
        agentService.stopTask();
        return Map.of("status", "TASK_STOPPED");
    }

    @GetMapping("/checkpoints")
    public List<Map<String, String>> getCheckpoints() {
        return checkpointService.listCheckpoints();
    }

    @PostMapping("/checkpoints/restore")
    public Map<String, String> restoreCheckpoint(@RequestBody Map<String, String> body) {
        String hash = body.get("hash");
        String result = checkpointService.restoreCheckpoint(hash);
        return Map.of("result", result, "status", "SUCCESS");
    }
}

class TaskRequest {
    private String prompt;
    private String mode;
    private String systemInstruction;
    private Double temperature;
    private Double topP;
    private String model;
    private String title;

    public TaskRequest() {
    }

    public TaskRequest(String prompt, String mode) {
        this.prompt = prompt;
        this.mode = mode;
    }

    public String getPrompt() {
        return prompt;
    }

    public void setPrompt(String prompt) {
        this.prompt = prompt;
    }

    public String getMode() {
        return mode;
    }

    public void setMode(String mode) {
        this.mode = mode;
    }

    public String getSystemInstruction() {
        return systemInstruction;
    }

    public void setSystemInstruction(String systemInstruction) {
        this.systemInstruction = systemInstruction;
    }

    public Double getTemperature() {
        return temperature;
    }

    public void setTemperature(Double temperature) {
        this.temperature = temperature;
    }

    public Double getTopP() {
        return topP;
    }

    public void setTopP(Double topP) {
        this.topP = topP;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }
}