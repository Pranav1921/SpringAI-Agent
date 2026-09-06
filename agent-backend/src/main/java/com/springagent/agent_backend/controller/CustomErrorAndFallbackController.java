package com.springagent.agent_backend.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.view.RedirectView;

import java.util.Map;

@Controller
public class CustomErrorAndFallbackController implements ErrorController {

    @RequestMapping("/error")
    public Object handleError(HttpServletRequest request) {
        String uri = (String) request.getAttribute("jakarta.servlet.error.request_uri");
        if (uri == null) {
            uri = request.getRequestURI();
        }

        String accept = request.getHeader("Accept");
        if (accept != null && accept.contains("text/event-stream")) {
            return ResponseEntity.ok().build();
        }

        if ((uri != null && uri.startsWith("/api/")) || (accept != null && accept.contains("application/json"))) {
            return ResponseEntity.status(404).body(Map.of(
                "status", 404,
                "error", "Not Found",
                "message", "API endpoint not found. The Web UI is hosted at http://localhost:4200"
            ));
        }

        if (uri != null && uri.startsWith("/preview")) {
            return ResponseEntity.status(404).body("<html><body style='background:#09090b;color:#fff;font-family:sans-serif;padding:2rem;text-align:center;'><h2>Workspace Standby</h2><p>Preview loading or file not found.</p></body></html>");
        }

        // Automatically redirect all browser requests to the frontend UI
        return new RedirectView("http://localhost:4200/workspace");
    }
}
