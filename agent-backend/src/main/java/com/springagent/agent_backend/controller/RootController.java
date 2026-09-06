package com.springagent.agent_backend.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.view.RedirectView;

import java.util.Map;

@Controller
public class RootController {

    @GetMapping("/")
    public String rootStatusPage() {
        return "forward:/index.html";
    }

    @GetMapping(value = {"/api/landing/info", "/landing/info"})
    @ResponseBody
    public Map<String, Object> landingInfo() {
        return Map.of(
            "title", "Spring AI Autonomous Dev",
            "version", "2.0.0",
            "framework", "Spring AI 1.0.0-M4 & Java 17",
            "status", "ONLINE",
            "backendPort", 8080,
            "frontendPort", 4200
        );
    }

    @GetMapping(value = {"/login", "/workspace"})
    public RedirectView redirectToFrontend() {
        return new RedirectView("http://localhost:4200/workspace");
    }
}
