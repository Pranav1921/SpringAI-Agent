package com.springagent.agent_backend.tools;

import com.springagent.agent_backend.config.TenantContext;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class FileSystemTool {

    @Value("${agent.workspace.path:C:/AgentWorkspace}")
    private String workspaceRootPath;

    private static volatile Path activeGlobalWorkspaceRoot = null;
    private final Map<String, Path> customTenantRoots = new ConcurrentHashMap<>();

    @PostConstruct
    public void init() {
        try {
            Path candidate = null;
            // 1. Check local workspace in current directory
            Path localW = Paths.get("workspace").toAbsolutePath().normalize();
            Path parentW = Paths.get("..", "workspace").toAbsolutePath().normalize();

            if (Files.exists(localW) && Files.isWritable(localW)) {
                candidate = localW;
            } else if (Files.exists(parentW) && Files.isWritable(parentW)) {
                candidate = parentW;
            } else if (workspaceRootPath != null && !workspaceRootPath.isBlank() && !workspaceRootPath.startsWith("C:/AgentWorkspace")) {
                Path custom = Paths.get(workspaceRootPath).toAbsolutePath().normalize();
                if (!Files.exists(custom)) Files.createDirectories(custom);
                if (Files.isWritable(custom)) candidate = custom;
            }

            if (candidate == null) {
                // Default to local "workspace" directory in project
                if (!Files.exists(localW)) {
                    Files.createDirectories(localW);
                }
                candidate = localW;
            }

            activeGlobalWorkspaceRoot = candidate;
            System.out.println("📂 [WORKSPACE ROOT] Active workspace directory: " + activeGlobalWorkspaceRoot);
        } catch (Exception e) {
            try {
                Path fallback = Paths.get(System.getProperty("user.home"), ".agent_workspace").toAbsolutePath().normalize();
                if (!Files.exists(fallback)) Files.createDirectories(fallback);
                activeGlobalWorkspaceRoot = fallback;
                System.out.println("📂 [WORKSPACE ROOT] Fallback workspace directory: " + activeGlobalWorkspaceRoot);
            } catch (Exception ignored) {}
        }
    }

    public Path getWorkspaceRoot() {
        return getWorkspaceRoot(TenantContext.getTenantId());
    }

    public Path getWorkspaceRoot(String tenantId) {
        if (activeGlobalWorkspaceRoot != null && Files.exists(activeGlobalWorkspaceRoot)) {
            return activeGlobalWorkspaceRoot;
        }

        String cleanTenant = (tenantId != null && !tenantId.isBlank()) 
                ? tenantId.toLowerCase().replaceAll("[^a-zA-Z0-9_-]", "") 
                : "pranav1921";

        if (customTenantRoots.containsKey(cleanTenant)) {
            Path customPath = customTenantRoots.get(cleanTenant);
            if (Files.exists(customPath)) {
                return customPath;
            }
        }

        Path localW = Paths.get("workspace").toAbsolutePath().normalize();
        if (Files.exists(localW)) {
            activeGlobalWorkspaceRoot = localW;
            return localW;
        }

        Path parentW = Paths.get("..", "workspace").toAbsolutePath().normalize();
        if (Files.exists(parentW)) {
            activeGlobalWorkspaceRoot = parentW;
            return parentW;
        }

        return activeGlobalWorkspaceRoot != null ? activeGlobalWorkspaceRoot : localW;
    }

    public String setCustomWorkspaceRoot(String customPathStr) {
        String tenantId = TenantContext.getTenantId();
        if (customPathStr == null || customPathStr.isBlank()) {
            activeGlobalWorkspaceRoot = Paths.get(workspaceRootPath);
            customTenantRoots.remove(tenantId);
            return "Reset to default workspace: " + activeGlobalWorkspaceRoot;
        }

        try {
            Path customPath = Paths.get(customPathStr).toAbsolutePath().normalize();
            if (!Files.exists(customPath)) {
                Files.createDirectories(customPath);
            }
            activeGlobalWorkspaceRoot = customPath;
            customTenantRoots.put(tenantId, customPath);
            return "Workspace folder changed to: " + customPath.toString();
        } catch (Exception e) {
            return "ERROR setting workspace folder: " + e.getMessage();
        }
    }

    public String getCurrentWorkspacePath() {
        return getWorkspaceRoot().toString().replace("\\", "/");
    }

    public String getDefaultWorkspacePath() {
        Path localW = Paths.get("workspace").toAbsolutePath().normalize();
        return localW.toString().replace("\\", "/");
    }

    private void seedTenantWorkspace(Path tenantRoot, String tenantId) {
        try {
            Path indexHtml = tenantRoot.resolve("index.html");
            if (!Files.exists(indexHtml)) {
                String html = """
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                      <meta charset="UTF-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                      <title>Workspace - %s</title>
                      <style>
                        body {
                          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                          background: #000000;
                          color: #ffffff;
                          display: flex;
                          flex-direction: column;
                          align-items: center;
                          justify-content: center;
                          height: 100vh;
                          margin: 0;
                        }
                        .card {
                          background: #0c0c0c;
                          border: 1px solid #262626;
                          border-radius: 12px;
                          padding: 2rem;
                          max-width: 450px;
                          text-align: center;
                          box-shadow: 0 10px 25px rgba(0,0,0,0.5);
                        }
                        h1 { color: #ffffff; font-size: 1.4rem; margin-top: 0; }
                        p { color: #888888; line-height: 1.5; font-size: 0.9rem; }
                        .badge {
                          display: inline-block;
                          background: #141414;
                          color: #ffffff;
                          border: 1px solid #333333;
                          padding: 4px 10px;
                          border-radius: 20px;
                          font-size: 0.75rem;
                          font-weight: 600;
                          margin-bottom: 1rem;
                        }
                      </style>
                    </head>
                    <body>
                      <div class="card">
                        <div class="badge">&#9679; WORKSPACE OPEN</div>
                        <h1>Workspace: %s</h1>
                        <p>All files, generated code, and live server previews run directly inside this folder.</p>
                      </div>
                    </body>
                    </html>
                    """.formatted(tenantId, tenantId);
                Files.writeString(indexHtml, html);
            }

            Path appJs = tenantRoot.resolve("app.js");
            if (!Files.exists(appJs)) {
                String js = """
                    // Workspace Server Script
                    const http = require('http');
                    const fs = require('fs');
                    const path = require('path');

                    const PORT = 3000;
                    const server = http.createServer((req, res) => {
                      const filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
                      fs.readFile(filePath, (err, data) => {
                        if (err) {
                          res.writeHead(404);
                          res.end('Not Found');
                        } else {
                          res.writeHead(200);
                          res.end(data);
                        }
                      });
                    });

                    server.listen(PORT, () => {
                      console.log(`Live Preview running on port ${PORT}`);
                    });
                    """;
                Files.writeString(appJs, js);
            }
        } catch (Exception ignored) {}
    }

    // Path Traversal Guard: Prevents directory escape attacks
    public Path resolveSafePath(String relativePath) throws IOException {
        Path root = getWorkspaceRoot();
        String sanitized = relativePath.replaceFirst("^[a-zA-Z]:[\\\\/]", "").replaceAll("^[\\\\/]+", "");
        Path target = root.resolve(sanitized).normalize();

        if (!target.startsWith(root)) {
            throw new SecurityException("Access Denied: Attempted path traversal outside workspace (" + relativePath + ")");
        }
        return target;
    }

    public String writeFile(String relativePath, String content) {
        try {
            Path safePath = resolveSafePath(relativePath);
            if (safePath.getParent() != null && !Files.exists(safePath.getParent())) {
                Files.createDirectories(safePath.getParent());
            }
            Files.writeString(safePath, content, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
            return "SUCCESS: Wrote " + content.length() + " bytes to " + relativePath;
        } catch (Exception e) {
            return "ERROR writing to " + relativePath + ": " + e.getMessage();
        }
    }

    public String readFile(String relativePath) {
        try {
            Path safePath = resolveSafePath(relativePath);
            if (!Files.exists(safePath)) {
                return "ERROR: File not found -> " + relativePath;
            }
            return Files.readString(safePath);
        } catch (Exception e) {
            return "ERROR reading " + relativePath + ": " + e.getMessage();
        }
    }

    public String applyPatch(String relativePath, String searchBlock, String replaceBlock) {
        try {
            Path safePath = resolveSafePath(relativePath);
            if (!Files.exists(safePath)) {
                return "ERROR: File not found -> " + relativePath;
            }
            String content = Files.readString(safePath);
            if (!content.contains(searchBlock)) {
                return "ERROR: Search block not found in " + relativePath;
            }
            String patched = content.replace(searchBlock, replaceBlock);
            Files.writeString(safePath, patched, StandardOpenOption.TRUNCATE_EXISTING);
            return "SUCCESS: Patch applied to " + relativePath;
        } catch (Exception e) {
            return "ERROR applying patch: " + e.getMessage();
        }
    }

    public String createDirectory(String relativePath) {
        try {
            Path safePath = resolveSafePath(relativePath);
            if (!Files.exists(safePath)) {
                Files.createDirectories(safePath);
                return "SUCCESS: Created directory " + relativePath;
            }
            return "ALREADY_EXISTS: Directory already exists at " + relativePath;
        } catch (Exception e) {
            return "ERROR creating directory " + relativePath + ": " + e.getMessage();
        }
    }

    public String deleteFile(String relativePath) {
        try {
            Path safePath = resolveSafePath(relativePath);
            if (!Files.exists(safePath)) {
                return "ERROR: Path does not exist -> " + relativePath;
            }
            if (Files.isDirectory(safePath)) {
                try (var stream = Files.walk(safePath)) {
                    stream.sorted((a, b) -> b.compareTo(a)).forEach(p -> {
                        try {
                            Files.delete(p);
                        } catch (IOException ignored) {}
                    });
                }
            } else {
                Files.delete(safePath);
            }
            return "SUCCESS: Deleted " + relativePath;
        } catch (Exception e) {
            return "ERROR deleting path: " + e.getMessage();
        }
    }

    public List<Map<String, Object>> scanWorkspace() {
        List<Map<String, Object>> files = new ArrayList<>();
        try {
            Path root = getWorkspaceRoot();
            if (!Files.exists(root)) return files;

            try (var stream = Files.walk(root)) {
                stream.forEach(p -> {
                    if (!p.equals(root) && !p.toString().contains(".git") && !p.toString().contains("node_modules")) {
                        Map<String, Object> node = new HashMap<>();
                        node.put("name", p.getFileName().toString());
                        node.put("path", root.relativize(p).toString().replace("\\", "/"));
                        node.put("isDirectory", Files.isDirectory(p));
                        try {
                            if (!Files.isDirectory(p)) {
                                node.put("size", Files.size(p));
                            }
                        } catch (IOException ignored) {}
                        files.add(node);
                    }
                });
            }
        } catch (Exception ignored) {}
        return files;
    }
}