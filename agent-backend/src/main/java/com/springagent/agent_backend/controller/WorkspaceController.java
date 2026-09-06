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

    @PostMapping({"/api/workspace/pick-folder-dialog", "/api/folder/pick-dialog"})
    public Map<String, Object> pickFolderDialog() {
        try {
            String os = System.getProperty("os.name").toLowerCase();
            if (os.contains("win")) {
                ProcessBuilder pb = new ProcessBuilder("powershell.exe", "-STA", "-NoProfile", "-Command",
                    "Add-Type -AssemblyName System.Windows.Forms; $f = New-Object System.Windows.Forms.FolderBrowserDialog; $f.ShowNewFolderButton = $true; $f.Description = 'Select folder where AI generates and saves files'; if ($f.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) { [Console]::WriteLine($f.SelectedPath) }");
                Process p = pb.start();
                boolean completed = p.waitFor(90, java.util.concurrent.TimeUnit.SECONDS);
                if (completed) {
                    try (java.io.BufferedReader reader = new java.io.BufferedReader(new java.io.InputStreamReader(p.getInputStream()))) {
                        String line;
                        String selected = null;
                        while ((line = reader.readLine()) != null) {
                            if (!line.isBlank()) {
                                selected = line.trim();
                            }
                        }
                        if (selected != null && !selected.isBlank()) {
                            fileSystemTool.setCustomWorkspaceRoot(selected);
                            return Map.of(
                                "status", "SUCCESS",
                                "folderPath", fileSystemTool.getCurrentWorkspacePath(),
                                "files", fileSystemTool.scanWorkspace()
                            );
                        }
                    }
                } else {
                    p.destroyForcibly();
                }
            }
        } catch (Exception ignored) {}
        return Map.of(
            "status", "CANCELLED",
            "folderPath", fileSystemTool.getCurrentWorkspacePath(),
            "files", fileSystemTool.scanWorkspace()
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

    @GetMapping(value = {"/preview", "/preview/", "/preview/index.html", "/api/preview"}, produces = "text/html;charset=UTF-8")
    @ResponseBody
    public String previewIndex() {
        String html = fileSystemTool.readFile("index.html");
        String css = fileSystemTool.readFile("styles.css");
        String js = fileSystemTool.readFile("script.js");

        if (html == null || html.isBlank()) {
            return "<html><body style='background:#09090b;color:#fff;font-family:sans-serif;padding:2rem;text-align:center;'><h2>Workspace Standby</h2><p>No index.html file found in workspace yet.</p></body></html>";
        }

        if (css != null && !css.isBlank()) {
            if (html.contains("<link rel=\"stylesheet\" href=\"styles.css\">")) {
                html = html.replace("<link rel=\"stylesheet\" href=\"styles.css\">", "<style>\n" + css + "\n</style>");
            } else if (html.contains("</head>")) {
                html = html.replace("</head>", "<style>\n" + css + "\n</style></head>");
            } else {
                html = "<style>\n" + css + "\n</style>\n" + html;
            }
        }

        if (js != null && !js.isBlank()) {
            if (html.contains("<script src=\"script.js\"></script>")) {
                html = html.replace("<script src=\"script.js\"></script>", "<script>\n" + js + "\n</script>");
            } else if (html.contains("</body>")) {
                html = html.replace("</body>", "<script>\n" + js + "\n</script></body>");
            } else {
                html = html + "\n<script>\n" + js + "\n</script>";
            }
        }

        return html;
    }

    @GetMapping(value = "/preview/styles.css", produces = "text/css;charset=UTF-8")
    @ResponseBody
    public String previewCss() {
        return fileSystemTool.readFile("styles.css");
    }

    @GetMapping(value = "/preview/script.js", produces = "application/javascript;charset=UTF-8")
    @ResponseBody
    public String previewJs() {
        return fileSystemTool.readFile("script.js");
    }

    @GetMapping(value = {"/api/workspace/export-zip", "/api/export-zip"})
    public void exportZip(jakarta.servlet.http.HttpServletResponse response) {
        try {
            response.setContentType("application/zip");
            response.setHeader("Content-Disposition", "attachment; filename=\"spring-agent-workspace.zip\"");

            try (java.util.zip.ZipOutputStream zos = new java.util.zip.ZipOutputStream(response.getOutputStream())) {
                java.nio.file.Path root = fileSystemTool.getWorkspaceRoot();
                if (java.nio.file.Files.exists(root)) {
                    try (java.util.stream.Stream<java.nio.file.Path> stream = java.nio.file.Files.walk(root)) {
                        stream.filter(path -> !java.nio.file.Files.isDirectory(path) && !path.toString().contains(".git"))
                              .forEach(path -> {
                                  try {
                                      String rel = root.relativize(path).toString().replace("\\", "/");
                                      zos.putNextEntry(new java.util.zip.ZipEntry(rel));
                                      java.nio.file.Files.copy(path, zos);
                                      zos.closeEntry();
                                  } catch (Exception ignored) {}
                              });
                    }
                }
                zos.finish();
            }
        } catch (Exception e) {
            System.err.println("Failed to export ZIP: " + e.getMessage());
        }
    }
}