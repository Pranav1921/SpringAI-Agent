package com.springagent.agent_backend.controller;

import com.springagent.agent_backend.agent.SkillsService;
import com.springagent.agent_backend.agent.SkillsService.SkillItem;
import com.springagent.agent_backend.agent.SkillsService.AgentPersona;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class SkillsController {

    private final SkillsService skillsService;

    public SkillsController(SkillsService skillsService) {
        this.skillsService = skillsService;
    }

    @GetMapping("/skills")
    public List<SkillItem> getSkills() {
        return skillsService.getAllSkills();
    }

    @PostMapping("/skills")
    public SkillItem createOrUpdateSkill(@RequestBody SkillItem skill) {
        if (skill.getId() == null || skill.getId().isBlank() || skill.isCustom()) {
            skill.setCustom(true);
        }
        return skillsService.saveSkill(skill);
    }

    @PostMapping("/skills/{id}/toggle")
    public Map<String, Object> toggleSkill(@PathVariable String id) {
        boolean toggled = skillsService.toggleSkill(id);
        return Map.of("success", toggled, "id", id);
    }

    @DeleteMapping("/skills/{id}")
    public ResponseEntity<Map<String, Object>> deleteSkill(@PathVariable String id) {
        boolean deleted = skillsService.deleteSkill(id);
        if (deleted) {
            return ResponseEntity.ok(Map.of("success", true, "message", "Custom skill deleted"));
        } else {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Cannot delete built-in skill or skill not found"));
        }
    }

    @GetMapping("/personas")
    public List<AgentPersona> getPersonas() {
        return skillsService.getAllPersonas();
    }

    @PostMapping("/personas")
    public AgentPersona savePersona(@RequestBody AgentPersona persona) {
        return skillsService.savePersona(persona);
    }
}
