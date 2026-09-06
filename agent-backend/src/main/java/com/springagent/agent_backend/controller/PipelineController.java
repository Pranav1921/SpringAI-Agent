package com.springagent.agent_backend.controller;

import com.springagent.agent_backend.cicd.PipelineService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pipeline")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class PipelineController {

    private final PipelineService pipelineService;

    public PipelineController(PipelineService pipelineService) {
        this.pipelineService = pipelineService;
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamPipeline() {
        SseEmitter emitter = new SseEmitter(0L); // Infinite timeout for real-time telemetry
        pipelineService.registerEmitter(emitter);
        return emitter;
    }

    @PostMapping("/trigger")
    public Map<String, Object> triggerPipeline(@RequestBody Map<String, Object> body) {
        String repo = (String) body.getOrDefault("repo", "enterprise-service");
        String branch = (String) body.getOrDefault("branch", "main");
        String commit = (String) body.getOrDefault("commit", "commit-" + System.currentTimeMillis());
        String triggerType = (String) body.getOrDefault("triggerType", "MANUAL_UI");
        Map<String, String> env = (Map<String, String>) body.getOrDefault("env", Map.of());

        PipelineService.PipelineRun run = pipelineService.triggerPipeline(repo, branch, commit, triggerType, env);

        return Map.of(
                "status", "QUEUED",
                "message", "Pipeline execution started",
                "pipelineId", run.getId(),
                "pipeline", run
        );
    }

    @GetMapping("/history")
    public List<PipelineService.PipelineRun> getHistory() {
        return pipelineService.getAllRuns();
    }

    @GetMapping("/{id}")
    public PipelineService.PipelineRun getRun(@PathVariable String id) {
        PipelineService.PipelineRun run = pipelineService.getRun(id);
        if (run == null) {
            throw new RuntimeException("Pipeline run not found: " + id);
        }
        return run;
    }

    @PostMapping("/webhook")
    public Map<String, Object> handleWebhook(@RequestBody Map<String, Object> payload,
                                             @RequestHeader(value = "X-GitHub-Event", required = false) String eventType) {
        String event = eventType != null ? eventType : "push";
        String repo = "github-webhook-repo";
        String branch = "main";
        String commit = "head-" + System.currentTimeMillis();

        if (payload.containsKey("repository")) {
            Map<String, Object> repoMap = (Map<String, Object>) payload.get("repository");
            repo = (String) repoMap.getOrDefault("name", repo);
        }
        if (payload.containsKey("ref")) {
            String ref = (String) payload.get("ref");
            branch = ref.replace("refs/heads/", "");
        }
        if (payload.containsKey("head_commit")) {
            Map<String, Object> head = (Map<String, Object>) payload.get("head_commit");
            commit = (String) head.getOrDefault("id", commit);
        }

        PipelineService.PipelineRun run = pipelineService.triggerPipeline(repo, branch, commit, "GITHUB_WEBHOOK:" + event.toUpperCase(), Map.of());

        return Map.of(
                "status", "INGESTED",
                "event", event,
                "pipelineId", run.getId()
        );
    }
}
