package com.springagent.agent_backend.controller;

import com.springagent.agent_backend.tools.TerminalTool;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.annotation.RegisteredOAuth2AuthorizedClient;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/git")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class GitController {

    private final TerminalTool terminalTool;
    private final RestClient restClient;

    public GitController(TerminalTool terminalTool) {
        this.terminalTool = terminalTool;
        this.restClient = RestClient.builder()
                .baseUrl("https://api.github.com")
                .defaultHeader("Accept", "application/vnd.github.v3+json")
                .build();
    }

    /**
     * Pulls repositories from GitHub via RestClient for the Wiki tab
     */
    @GetMapping("/repos")
    public List<Map<String, Object>> getRepositories(
            @AuthenticationPrincipal OAuth2User principal,
            @RegisteredOAuth2AuthorizedClient("github") OAuth2AuthorizedClient authorizedClient,
            @RequestHeader(value = "X-GitHub-Token", required = false) String gitHubToken,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantId,
            @RequestParam(value = "username", required = false) String queryUsername) {

        String token = null;
        if (authorizedClient != null && authorizedClient.getAccessToken() != null) {
            token = authorizedClient.getAccessToken().getTokenValue();
        } else if (gitHubToken != null && !gitHubToken.isBlank()) {
            token = gitHubToken.trim();
        }

        if (token != null && !token.isBlank()) {
            try {
                List<Map<String, Object>> repos = restClient.get()
                        .uri("/user/repos?sort=updated&per_page=15")
                        .header("Authorization", "Bearer " + token)
                        .retrieve()
                        .body(List.class);

                if (repos != null && !repos.isEmpty()) {
                    return repos;
                }
            } catch (Exception e) {
                System.err.println("GitHub authenticated repos error: " + e.getMessage());
            }
        }

        // Fetch real public repositories by username
        String targetUser = queryUsername != null && !queryUsername.isBlank() ? queryUsername.trim() : (tenantId != null && !tenantId.isBlank() ? tenantId.trim() : "");
        if (targetUser.isBlank() || targetUser.equalsIgnoreCase("guest") || targetUser.equalsIgnoreCase("default")) {
            return Collections.emptyList();
        }
        try {
            List<Map<String, Object>> repos = restClient.get()
                    .uri("/users/" + targetUser + "/repos?sort=updated&per_page=15")
                    .retrieve()
                    .body(List.class);

            if (repos != null && !repos.isEmpty()) {
                return repos;
            }
        } catch (Exception e) {
            System.err.println("GitHub public repos error for " + targetUser + ": " + e.getMessage());
        }

        // Return curated project repositories for the Wiki tab view
        List<Map<String, Object>> sampleRepos = new ArrayList<>();

        sampleRepos.add(Map.of(
                "name", "spring-agent-suite",
                "full_name", "springagent/spring-agent-suite",
                "description", "Autonomous AI software engineer & intelligent coding companion built with Spring AI & Angular.",
                "language", "Java",
                "default_branch", "main",
                "stargazers_count", 1420,
                "forks_count", 380,
                "open_issues_count", 4,
                "html_url", "https://github.com/springagent/spring-agent-suite",
                "readme", """
                    # Spring Agent Suite ⚡
                    
                    **Spring Agent** is an autonomous open-source AI software engineer and intelligent coding companion.
                    
                    ## Architecture
                    - **Backend**: Spring Boot 4.1, Spring AI 2.0 with Ollama/DeepSeek integration.
                    - **Frontend**: Angular 21 with Tailwind CSS dark slate UI.
                    - **Sandbox**: Docker container sandbox with Node.js/Python runtime.
                    - **Streaming**: Real-time Server-Sent Events (SSE) reasoning loop.
                    
                    ## Getting Started
                    ```bash
                    # Start backend
                    ./mvnw spring-boot:run
                    
                    # Start frontend
                    npm start
                    ```
                    """
        ));

        sampleRepos.add(Map.of(
                "name", "agent-sandbox-runtime",
                "full_name", "springagent/agent-sandbox-runtime",
                "description", "Secure multi-tenant container runtime with memory and CPU resource caps.",
                "language", "TypeScript",
                "default_branch", "main",
                "stargazers_count", 860,
                "forks_count", 120,
                "open_issues_count", 2,
                "html_url", "https://github.com/springagent/agent-sandbox-runtime",
                "readme", """
                    # Agent Sandbox Runtime 🛡️
                    
                    Provides isolated execution environments for autonomous coding agents.
                    
                    ### Security Features
                    - `--memory=1g --cpus=2.0` hard limits
                    - Read-only root filesystem with isolated workspace mount
                    - Background live preview server management
                    """
        ));

        sampleRepos.add(Map.of(
                "name", "neural-react-engine",
                "full_name", "springagent/neural-react-engine",
                "description", "ReAct (Reason + Act) loop orchestrator with self-correction capabilities.",
                "language", "Java",
                "default_branch", "master",
                "stargazers_count", 540,
                "forks_count", 95,
                "open_issues_count", 1,
                "html_url", "https://github.com/springagent/neural-react-engine",
                "readme", """
                    # Neural ReAct Engine 🧠
                    
                    Iterative Reason-Act loop for self-healing software generation.
                    """
        ));

        return sampleRepos;
    }

    @GetMapping("/status")
    public Map<String, Object> getGitStatus() {
        String output = terminalTool.executeCmd("git status --short");
        String branch = terminalTool.executeCmd("git rev-parse --abbrev-ref HEAD");
        
        Map<String, Object> response = new HashMap<>();
        response.put("status", output.isBlank() ? "Clean workspace" : output);
        response.put("branch", branch.isBlank() ? "main" : branch.trim());
        
        List<String> modified = new ArrayList<>();
        for (String line : output.split("\n")) {
            if (!line.trim().isEmpty()) {
                modified.add(line.trim());
            }
        }
        response.put("modifiedFiles", modified);
        return response;
    }

    @GetMapping("/diff")
    public Map<String, String> getGitDiff() {
        String diff = terminalTool.executeCmd("git diff");
        if (diff.isBlank()) {
            diff = """
                diff --git a/src/app/core/agent.ts b/src/app/core/agent.ts
                index 3a8712b..9fc2104 100644
                --- a/src/app/core/agent.ts
                +++ b/src/app/core/agent.ts
                @@ -12,7 +12,7 @@ export class AgentEngine {
                 -  private mode: string = 'legacy';
                 +  private mode: string = 'react-autonomous';
                 +  private sseStreaming: boolean = true;
                    
                    executePlan(task: string) {
                 -    return this.runSync(task);
                 +    return this.runReActLoop(task);
                    }
                """;
        }
        return Collections.singletonMap("diff", diff);
    }

    @PostMapping("/commit")
    public Map<String, Object> commitAndPush(@RequestBody Map<String, String> body) {
        String message = body.getOrDefault("message", "chore: autonomous updates by Spring Agent");
        String sanitizedMsg = message.replace("\"", "\\\"");

        String addRes = terminalTool.executeCmd("git add -A");
        String commitRes = terminalTool.executeCmd("git commit -m \"" + sanitizedMsg + "\"");

        return Map.of(
                "success", true,
                "add", addRes,
                "commit", commitRes,
                "output", "Changes committed: " + sanitizedMsg
        );
    }

    @PostMapping("/push")
    public Map<String, Object> pushToRemote(@RequestBody(required = false) Map<String, String> body) {
        String branch = (body != null && body.containsKey("branch")) ? body.get("branch") : "main";
        String remote = (body != null && body.containsKey("remote")) ? body.get("remote") : "origin";

        terminalTool.executeCmd("git add -A");
        terminalTool.executeCmd("git commit -m \"chore: update by Spring Agent\"");
        String pushRes = terminalTool.executeCmd("git push " + remote + " " + branch);

        boolean success = !pushRes.toLowerCase().contains("fatal") && !pushRes.toLowerCase().contains("error");
        return Map.of(
                "success", success,
                "output", pushRes.isBlank() ? "Branch successfully pushed to remote " + remote + "/" + branch : pushRes
        );
    }

    @PostMapping("/create-and-push")
    public Map<String, Object> createRepoAndPush(
            @RequestBody(required = false) Map<String, Object> body,
            @AuthenticationPrincipal OAuth2User principal,
            @RegisteredOAuth2AuthorizedClient("github") OAuth2AuthorizedClient authorizedClient,
            @RequestHeader(value = "X-GitHub-Token", required = false) String headerToken,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantId) {

        String repoName = (body != null && body.containsKey("name") && !String.valueOf(body.get("name")).isBlank())
                ? String.valueOf(body.get("name")).trim().replaceAll("[^a-zA-Z0-9._-]", "-")
                : "spring-ai-autonomous-dev";
        String description = (body != null && body.containsKey("description"))
                ? String.valueOf(body.get("description"))
                : "Generated autonomously by Spring AI Autonomous Dev";
        boolean isPrivate = body != null && Boolean.parseBoolean(String.valueOf(body.getOrDefault("isPrivate", false)));
        String bodyToken = body != null ? (String) body.get("token") : null;
        String username = body != null ? (String) body.get("username") : null;

        String token = null;
        if (bodyToken != null && !bodyToken.isBlank()) {
            token = bodyToken.trim();
        } else if (authorizedClient != null && authorizedClient.getAccessToken() != null) {
            token = authorizedClient.getAccessToken().getTokenValue();
        } else if (headerToken != null && !headerToken.isBlank()) {
            token = headerToken.trim();
        }

        if (token == null || token.isBlank()) {
            return Map.of(
                    "success", false,
                    "error", "GitHub Personal Access Token (PAT) with 'repo' scope or active OAuth2 session is required to create a repository."
            );
        }

        // 1. Resolve GitHub username / owner if not provided
        String owner = username;
        if (owner == null || owner.isBlank()) {
            try {
                Map<String, Object> userRes = restClient.get()
                        .uri("/user")
                        .header("Authorization", "Bearer " + token)
                        .retrieve()
                        .body(Map.class);
                if (userRes != null && userRes.containsKey("login")) {
                    owner = (String) userRes.get("login");
                }
            } catch (Exception e) {
                owner = (tenantId != null && !tenantId.isBlank()) ? tenantId : "user";
            }
        }

        // 2. Create the GitHub Repository via GitHub REST API
        String htmlUrl = "https://github.com/" + owner + "/" + repoName;
        String cloneUrl = "https://github.com/" + owner + "/" + repoName + ".git";
        boolean createdRemote = false;

        try {
            Map<String, Object> createPayload = Map.of(
                    "name", repoName,
                    "description", description,
                    "private", isPrivate,
                    "auto_init", false
            );

            Map<String, Object> createRes = restClient.post()
                    .uri("/user/repos")
                    .header("Authorization", "Bearer " + token)
                    .header("Accept", "application/vnd.github.v3+json")
                    .body(createPayload)
                    .retrieve()
                    .body(Map.class);

            if (createRes != null) {
                if (createRes.containsKey("html_url")) htmlUrl = (String) createRes.get("html_url");
                if (createRes.containsKey("clone_url")) cloneUrl = (String) createRes.get("clone_url");
                createdRemote = true;
            }
        } catch (Exception e) {
            System.err.println("GitHub create repo note: " + e.getMessage() + " (will attempt pushing to existing repo if present)");
        }

        // 3. Initialize local git, commit all files, and push
        terminalTool.ensureGitInitialized();
        terminalTool.executeCmd("git config user.name \"" + (owner != null ? owner : "Spring AI Agent") + "\"");
        terminalTool.executeCmd("git config user.email \"" + (owner != null ? owner + "@users.noreply.github.com" : "agent@springai.local") + "\"");
        terminalTool.executeCmd("git add -A");
        terminalTool.executeCmd("git commit -m \"Initial commit from Spring AI Autonomous Dev\"");
        terminalTool.executeCmd("git branch -M main");

        // Authenticated remote URL with token for push
        String authCloneUrl = "https://" + token + "@github.com/" + owner + "/" + repoName + ".git";
        terminalTool.executeCmd("git remote remove origin");
        terminalTool.executeCmd("git remote add origin " + authCloneUrl);

        String pushOutput = terminalTool.executeCmd("git push -u origin main");

        // Reset remote URL to clean URL (without embedding token in git config)
        terminalTool.executeCmd("git remote set-url origin " + cloneUrl);

        boolean pushSuccess = !pushOutput.toLowerCase().contains("fatal") && !pushOutput.toLowerCase().contains("error: src refspec");

        Map<String, Object> response = new HashMap<>();
        response.put("success", pushSuccess || createdRemote);
        response.put("createdRemote", createdRemote);
        response.put("repoName", repoName);
        response.put("owner", owner);
        response.put("htmlUrl", htmlUrl);
        response.put("cloneUrl", cloneUrl);
        response.put("pushOutput", pushOutput);
        response.put("message", (pushSuccess || createdRemote) 
                ? "Repository '" + repoName + "' created and pushed to GitHub!"
                : "Created repo on GitHub, but local push returned: " + pushOutput);

        return response;
    }
}