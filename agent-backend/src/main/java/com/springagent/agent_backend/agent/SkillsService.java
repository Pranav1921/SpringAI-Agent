package com.springagent.agent_backend.agent;

import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SkillsService {

    public static class SkillItem {
        private String id;
        private String name;
        private String description;
        private String icon;
        private List<String> tags;
        private boolean enabled;
        private boolean custom;
        private String content;

        public SkillItem() {
            this.tags = new ArrayList<>();
            this.enabled = true;
            this.custom = false;
        }

        public SkillItem(String id, String name, String description, String icon, List<String> tags, boolean enabled, boolean custom, String content) {
            this.id = id;
            this.name = name;
            this.description = description;
            this.icon = icon;
            this.tags = tags != null ? tags : new ArrayList<>();
            this.enabled = enabled;
            this.custom = custom;
            this.content = content;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public String getIcon() { return icon; }
        public void setIcon(String icon) { this.icon = icon; }

        public List<String> getTags() { return tags; }
        public void setTags(List<String> tags) { this.tags = tags; }

        public boolean isEnabled() { return enabled; }
        public void setEnabled(boolean enabled) { this.enabled = enabled; }

        public boolean isCustom() { return custom; }
        public void setCustom(boolean custom) { this.custom = custom; }

        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
    }

    public static class AgentPersona {
        private String id;
        private String name;
        private String role;
        private String icon;
        private String color;
        private String description;
        private String systemPrompt;
        private double temperature;
        private boolean active;

        public AgentPersona() {
            this.temperature = 0.7;
            this.active = true;
        }

        public AgentPersona(String id, String name, String role, String icon, String color, String description, String systemPrompt, double temperature, boolean active) {
            this.id = id;
            this.name = name;
            this.role = role;
            this.icon = icon;
            this.color = color;
            this.description = description;
            this.systemPrompt = systemPrompt;
            this.temperature = temperature;
            this.active = active;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }

        public String getIcon() { return icon; }
        public void setIcon(String icon) { this.icon = icon; }

        public String getColor() { return color; }
        public void setColor(String color) { this.color = color; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public String getSystemPrompt() { return systemPrompt; }
        public void setSystemPrompt(String systemPrompt) { this.systemPrompt = systemPrompt; }

        public double getTemperature() { return temperature; }
        public void setTemperature(double temperature) { this.temperature = temperature; }

        public boolean isActive() { return active; }
        public void setActive(boolean active) { this.active = active; }
    }

    private final Map<String, SkillItem> skillsRegistry = new ConcurrentHashMap<>();
    private final Map<String, AgentPersona> personasRegistry = new ConcurrentHashMap<>();

    @PostConstruct
    public void initialize() {
        loadStarterSkills();
        loadStarterPersonas();
    }

    private void loadStarterSkills() {
        // 1. Built-in Web / Modern Frontend Skill
        skillsRegistry.put("web", new SkillItem(
            "web", "Modern Web & Tailwind", "Full-stack HTML5, modern CSS3 variables, glassmorphism, responsive DOM and reactive JS",
            "WEB", List.of("web", "html", "css", "javascript", "frontend", "ui"), true, false,
            """
            # Modern Web & CSS Guidelines
            * Use semantically rich HTML5 tags (<main>, <section>, <nav>, <header>, <article>, <footer>).
            * Utilize sleek dark-mode palettes (e.g. background #090a0f, card backgrounds #12141c, borders rgba(255,255,255,0.08)).
            * Apply subtle glassmorphic effects (backdrop-filter: blur(12px)) and smooth micro-interactions (transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1)).
            * Always encapsulate state management and event listeners cleanly in DOMContentLoaded.
            """
        ));

        // 2. Python & CLI Engineering Skill
        skillsRegistry.put("python", new SkillItem(
            "python", "Python & Automation CLI", "Idiomatic Python 3.11+, argparse CLI, type hints, dataclasses and structured logging",
            "PY", List.of("python", "cli", "script", "backend", "fastapi"), true, false,
            """
            # Python Engineering Guidelines
            * Use clean type hinting (from typing import Optional, List, Dict) and dataclasses.
            * Implement rich terminal feedback using colored ANSI or rich library patterns.
            * Include graceful Exception handling and modular argument parsing via argparse.
            """
        ));

        // 3. Three.js & 3D Graphics Skill
        skillsRegistry.put("threejs", new SkillItem(
            "threejs", "Three.js & 3D Interactive Visualizer", "Three.js WebGL rendering, orbit controls, custom geometry, shaders and particle systems",
            "3D", List.of("threejs", "3d", "webgl", "graphics", "canvas", "particles"), true, false,
            """
            # Three.js Visualizer Guidelines
            * Import Three.js via CDN (https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js) and OrbitControls.
            * Initialize Scene, PerspectiveCamera (FOV 60-75), WebGLRenderer with antialias: true and alpha: true.
            * Implement responsive window resize listeners and continuous requestAnimationFrame render loops.
            """
        ));

        // 4. Spring Boot & Enterprise Backend Skill
        skillsRegistry.put("spring-boot", new SkillItem(
            "spring-boot", "Spring Boot & REST API", "Spring Boot 3 / 4, REST controllers, Spring AI, reactive SSE streaming and security",
            "JAVA", List.of("spring", "java", "springboot", "rest", "backend"), true, false,
            """
            # Spring Boot Guidelines
            * Follow clean controller-service-repository layered architecture.
            * Use constructor-based dependency injection with immutable final fields.
            * Implement proper error boundaries and RESTful JSON status responses.
            """
        ));

        // 5. Docker & DevOps Pipeline Skill
        skillsRegistry.put("docker", new SkillItem(
            "docker", "Docker & DevOps Automation", "Multi-stage Dockerfiles, compose services, container health checks and deployment scripts",
            "OPS", List.of("docker", "devops", "container", "compose", "deploy"), true, false,
            """
            # Docker & DevOps Guidelines
            * Use multi-stage Docker builds to minimize final container image sizes.
            * Include non-root security user execution (USER appuser).
            * Define explicit EXPOSE ports and robust HEALTHCHECK directives.
            """
        ));

        // Also check if any markdown skill files exist on classpath and load them
        PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
        try {
            Resource[] resources = resolver.getResources("classpath:skills/*.md");
            for (Resource resource : resources) {
                String filename = resource.getFilename();
                if (filename != null) {
                    String skillKey = filename.replace(".md", "").toLowerCase();
                    String content = new String(resource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
                    if (!skillsRegistry.containsKey(skillKey)) {
                        skillsRegistry.put(skillKey, new SkillItem(
                            skillKey, skillKey.toUpperCase() + " Guide", "Resource-loaded domain skill",
                            "SKILL", List.of(skillKey), true, false, content
                        ));
                    }
                }
            }
        } catch (IOException ignored) {}
    }

    private void loadStarterPersonas() {
        personasRegistry.put("architect", new AgentPersona(
            "architect", "Architect Agent", "ARCHITECT", "ARCH", "purple",
            "Analyzes project requirements, creates structural blueprints, defines schemas, and determines module boundaries.",
            "You are the Lead Systems Architect. Break down user requirements into clear domain models, directory layouts, and API contracts.",
            0.4, true
        ));

        personasRegistry.put("coder", new AgentPersona(
            "coder", "Coder Agent", "CODER", "CODE", "emerald",
            "Synthesizes production-ready, clean, modular source files with modern styling and responsive logic.",
            "You are the Principal Software Engineer. Write complete, elegant, and bug-free source code with zero placeholder omissions.",
            0.7, true
        ));

        personasRegistry.put("tester", new AgentPersona(
            "tester", "QA Tester Agent", "TESTER", "QA", "amber",
            "Executes automated quality verification, syntax checks, DOM hierarchy validation, and regression suites.",
            "You are the Senior QA Engineer. Verify all generated source files against edge cases, DOM validity, and runtime integrity.",
            0.3, true
        ));

        personasRegistry.put("security_reviewer", new AgentPersona(
            "security_reviewer", "Security Reviewer", "SECURITY_REVIEWER", "SEC", "rose",
            "Audits generated code for XSS, SQL injection, hardcoded credentials, open CORS, and dependency risks.",
            "You are the Chief Application Security Officer. Perform static analysis and vulnerability audits to ensure strict security standards.",
            0.2, true
        ));

        personasRegistry.put("devops", new AgentPersona(
            "devops", "DevOps Agent", "DEVOPS", "OPS", "sky",
            "Manages version control, git commits, timestamped checkpoint snapshots, and live sandbox deployments.",
            "You are the Site Reliability & Release Engineer. Package the synthesized application for live container sandbox execution.",
            0.5, true
        ));
    }

    // --- SKILLS CRUD ---

    public List<SkillItem> getAllSkills() {
        return new ArrayList<>(skillsRegistry.values());
    }

    public Optional<SkillItem> getSkill(String id) {
        return Optional.ofNullable(skillsRegistry.get(id.toLowerCase()));
    }

    public SkillItem saveSkill(SkillItem item) {
        if (item.getId() == null || item.getId().isBlank()) {
            item.setId(item.getName().toLowerCase().replaceAll("[^a-z0-9_-]", "-"));
        }
        String id = item.getId().toLowerCase();
        item.setId(id);
        skillsRegistry.put(id, item);
        return item;
    }

    public boolean deleteSkill(String id) {
        SkillItem item = skillsRegistry.get(id.toLowerCase());
        if (item != null && item.isCustom()) {
            skillsRegistry.remove(id.toLowerCase());
            return true;
        }
        return false;
    }

    public boolean toggleSkill(String id) {
        SkillItem item = skillsRegistry.get(id.toLowerCase());
        if (item != null) {
            item.setEnabled(!item.isEnabled());
            return true;
        }
        return false;
    }

    // --- PERSONAS CRUD ---

    public List<AgentPersona> getAllPersonas() {
        return new ArrayList<>(personasRegistry.values());
    }

    public Optional<AgentPersona> getPersona(String id) {
        return Optional.ofNullable(personasRegistry.get(id.toLowerCase()));
    }

    public AgentPersona savePersona(AgentPersona persona) {
        if (persona.getId() == null || persona.getId().isBlank()) {
            persona.setId(persona.getName().toLowerCase().replaceAll("[^a-z0-9_-]", "-"));
        }
        personasRegistry.put(persona.getId().toLowerCase(), persona);
        return persona;
    }

    // --- PROMPT RESOLUTION ---

    public String resolveSkills(String prompt) {
        StringBuilder promptAugment = new StringBuilder();
        String lowerPrompt = prompt.toLowerCase();

        skillsRegistry.values().forEach(skill -> {
            if (!skill.isEnabled()) return;

            boolean matchesTag = skill.getTags().stream().anyMatch(t -> lowerPrompt.contains(t.toLowerCase()));
            boolean matchesName = lowerPrompt.contains(skill.getId().toLowerCase()) || lowerPrompt.contains(skill.getName().toLowerCase());

            if (matchesTag || matchesName) {
                promptAugment.append("\n\n[INJECTED SKILL: ").append(skill.getName().toUpperCase()).append("]\n")
                             .append(skill.getContent().trim());
            }
        });

        return promptAugment.toString();
    }
}