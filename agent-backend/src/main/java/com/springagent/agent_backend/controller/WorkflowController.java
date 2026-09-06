package com.springagent.agent_backend.controller;

import com.springagent.agent_backend.workflow.WorkflowEngineService;
import com.springagent.agent_backend.workflow.WorkflowGraph.*;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/workflow")
@CrossOrigin(origins = "*")
public class WorkflowController {

    private final WorkflowEngineService workflowService;

    public WorkflowController(WorkflowEngineService workflowService) {
        this.workflowService = workflowService;
    }

    @GetMapping("/templates")
    public ResponseEntity<List<WorkflowDefinition>> getTemplates() {
        return ResponseEntity.ok(workflowService.getPrebuiltTemplates());
    }

    @PostMapping("/execute")
    public ResponseEntity<WorkflowRun> executeWorkflow(@RequestBody Map<String, Object> payload) {
        WorkflowDefinition def;
        if (payload.containsKey("definition")) {
            // custom definition
            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                def = mapper.convertValue(payload.get("definition"), WorkflowDefinition.class);
            } catch (Exception e) {
                def = workflowService.getPrebuiltTemplates().get(0);
            }
        } else {
            String templateId = (String) payload.getOrDefault("templateId", "tpl-pr-governance");
            def = workflowService.getPrebuiltTemplates().stream()
                    .filter(t -> t.getId().equalsIgnoreCase(templateId))
                    .findFirst()
                    .orElse(workflowService.getPrebuiltTemplates().get(0));
        }

        Map<String, Object> input = (Map<String, Object>) payload.getOrDefault("input", Map.of("triggerSource", "MANUAL_UI"));
        WorkflowRun run = workflowService.executeWorkflow(def, input);
        return ResponseEntity.ok(run);
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamWorkflowEvents() {
        SseEmitter emitter = new SseEmitter(1800000L); // 30 min timeout
        workflowService.registerEmitter(emitter);
        return emitter;
    }

    @GetMapping("/history")
    public ResponseEntity<List<WorkflowRun>> getHistory() {
        return ResponseEntity.ok(workflowService.getHistory());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getRunDetails(@PathVariable String id) {
        WorkflowRun run = workflowService.getRun(id);
        if (run == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(run);
    }

    @PostMapping("/webhook/{workflowId}")
    public ResponseEntity<?> handleWebhookTrigger(@PathVariable String workflowId, @RequestBody(required = false) Map<String, Object> body) {
        WorkflowDefinition def = workflowService.getPrebuiltTemplates().stream()
                .filter(t -> t.getId().equalsIgnoreCase(workflowId))
                .findFirst()
                .orElse(workflowService.getPrebuiltTemplates().get(0));

        WorkflowRun run = workflowService.executeWorkflow(def, body != null ? body : Map.of("source", "WEBHOOK"));
        return ResponseEntity.ok(Map.of("status", "QUEUED", "runId", run.getId(), "workflow", def.getName()));
    }
}
