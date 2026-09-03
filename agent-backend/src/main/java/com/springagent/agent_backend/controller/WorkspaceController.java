package com.springagent.agent_backend.controller;

import com.springagent.agent_backend.config.TenantContext;
import com.springagent.agent_backend.tools.FileSystemTool;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class WorkspaceController {

    private final FileSystemTool fileSystemTool;

    public WorkspaceController(FileSystemTool fileSystemTool) {
        this.fileSystemTool = fileSystemTool;
    }

    @GetMapping({"/api/workspace/files", "/api/files"})
    public List<Map<String, Object>> getFileTree() {
        return fileSystemTool.scanWorkspace();
    }

    @GetMapping({"/api/workspace/current-folder", "/api/folder"})
    public Map<String, String> getCurrentFolder() {
        return Map.of(
                "folderPath", fileSystemTool.getCurrentWorkspacePath(),
                "tenant", TenantContext.getTenantId()
        );
    }

    @GetMapping({"/api/workspace/common-folders", "/api/folder/common"})
    public Map<String, String> getCommonFolders() {
        String home = System.getProperty("user.home").replace("\\", "/");
        return Map.of(
                "projectWorkspace", fileSystemTool.getDefaultWorkspacePath(),
                "desktop", home + "/Desktop",
                "downloads", home + "/Downloads",
                "documents", home + "/Documents",
                "userHome", home
        );
    }

    @PostMapping({"/api/workspace/set-folder", "/api/folder/set"})
    public Map<String, String> setWorkspaceFolder(@RequestBody Map<String, String> body) {
        String folderPath = body.get("folderPath");
        String result = fileSystemTool.setCustomWorkspaceRoot(folderPath);
        return Map.of(
                "status", "SUCCESS",
                "message", result,
                "currentFolder", fileSystemTool.getCurrentWorkspacePath()
        );
    }

    @PostMapping({"/api/workspace/open-in-os", "/api/folder/open-in-os"})
    public Map<String, String> openFolderInOs() {
        String path = fileSystemTool.getCurrentWorkspacePath();
        try {
            java.io.File dir = new java.io.File(path);
            if (!dir.exists()) {
                dir.mkdirs();
            }
            String os = System.getProperty("os.name").toLowerCase();
            if (os.contains("win")) {
                new ProcessBuilder("explorer.exe", dir.getAbsolutePath()).start();
            } else if (os.contains("mac")) {
                new ProcessBuilder("open", dir.getAbsolutePath()).start();
            } else {
                new ProcessBuilder("xdg-open", dir.getAbsolutePath()).start();
            }
            return Map.of("status", "SUCCESS", "message", "Opened in File Explorer: " + path);
        } catch (Exception e) {
            return Map.of("status", "ERROR", "message", e.getMessage());
        }
    }

    @GetMapping({"/api/workspace/file-content", "/api/files/content"})
    public Map<String, String> getFileContent(@RequestParam("path") String relativePath) {
        String content = fileSystemTool.readFile(relativePath);
        return Collections.singletonMap("content", content);
    }

    @PostMapping({"/api/workspace/save", "/api/files/save", "/api/workspace/new-file"})
    public Map<String, String> saveFile(@RequestBody Map<String, String> body) {
        String path = body.get("path");
        String content = body.get("content") != null ? body.get("content") : "";
        if (path == null || path.isBlank()) {
            return Map.of("error", "Path is required");
        }
        String result = fileSystemTool.writeFile(path, content);
        return Map.of("result", result, "status", "SUCCESS");
    }

    @PostMapping("/api/workspace/new-folder")
    public Map<String, String> createFolder(@RequestBody Map<String, String> body) {
        String path = body.get("path");
        if (path == null || path.isBlank()) {
            return Map.of("error", "Path is required");
        }
        String result = fileSystemTool.createDirectory(path);
        return Map.of("result", result, "status", "SUCCESS");
    }

    @PostMapping({"/api/workspace/delete", "/api/files/delete"})
    public Map<String, String> deletePath(@RequestBody Map<String, String> body) {
        String path = body.get("path");
        if (path == null || path.isBlank()) {
            return Map.of("error", "Path is required");
        }
        String result = fileSystemTool.deleteFile(path);
        return Map.of("result", result, "status", "SUCCESS");
    }
}