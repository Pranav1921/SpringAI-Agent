package com.springagent.agent_backend.tools;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.io.File;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.util.concurrent.TimeUnit;

@Component
public class TerminalTool {

    private static final String CONTAINER_NAME = "agent-sandbox";
    private boolean dockerAvailable = false;

    @Autowired
    private FileSystemTool fileSystemTool;

    @PostConstruct
    public void initDockerSandbox() {
        try {
            Process check = new ProcessBuilder("docker", "version").start();
            boolean ok = check.waitFor(3, TimeUnit.SECONDS);
            if (ok && check.exitValue() == 0) {
                dockerAvailable = true;
                // Remove stale container
                new ProcessBuilder("docker", "rm", "-f", CONTAINER_NAME).start().waitFor(2, TimeUnit.SECONDS);

                Path workspace = fileSystemTool.getWorkspaceRoot();
                ProcessBuilder pb = new ProcessBuilder(
                        "docker", "run", "-d",
                        "--name", CONTAINER_NAME,
                        "-p", "3000:3000",
                        "-v", workspace.toString() + ":/workspace",
                        "-w", "/workspace",
                        "--memory=1g",
                        "--cpus=2.0",
                        "node:20-slim",
                        "tail", "-f", "/dev/null"
                );
                pb.start().waitFor(5, TimeUnit.SECONDS);
            }
        } catch (Exception e) {
            dockerAvailable = false;
        }
    }

    public boolean isDockerRunning() {
        if (!dockerAvailable) return false;
        try {
            Process process = new ProcessBuilder("docker", "inspect", "-f", "{{.State.Running}}", CONTAINER_NAME).start();
            process.waitFor(2, TimeUnit.SECONDS);
            String out = new String(process.getInputStream().readAllBytes(), StandardCharsets.UTF_8).trim();
            return "true".equalsIgnoreCase(out);
        } catch (Exception e) {
            return false;
        }
    }

    public void ensureGitInitialized() {
        try {
            File workspaceDir = fileSystemTool.getWorkspaceRoot().toFile();
            File gitDir = new File(workspaceDir, ".git");
            if (!gitDir.exists()) {
                executeRawHostCommand("git init");
                executeRawHostCommand("git branch -M main");
                executeRawHostCommand("git config user.name \"Spring Agent\"");
                executeRawHostCommand("git config user.email \"agent@springagent.local\"");
            }
        } catch (Exception ignored) {}
    }

    private String executeRawHostCommand(String command) {
        try {
            File workspaceDir = fileSystemTool.getWorkspaceRoot().toFile();
            boolean isWindows = System.getProperty("os.name").toLowerCase().contains("win");
            ProcessBuilder pb = isWindows
                    ? new ProcessBuilder("cmd.exe", "/c", command)
                    : new ProcessBuilder("sh", "-c", command);
            pb.directory(workspaceDir);
            pb.redirectErrorStream(true);
            Process process = pb.start();
            process.waitFor(15, TimeUnit.SECONDS);
            return new String(process.getInputStream().readAllBytes(), StandardCharsets.UTF_8).trim();
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }

    public String executeCmd(String command) {
        return executeCommand(command);
    }

    public String executeCommand(String command) {
        try {
            File workspaceDir = fileSystemTool.getWorkspaceRoot().toFile();

            // Auto-initialize Git if running a git command
            if (command.trim().startsWith("git ") || command.trim().equals("git")) {
                ensureGitInitialized();
            }

            // Check if command is preview server
            if (command.contains("http.server") || command.contains("node app.js") || command.contains("npm start")) {
                startBackgroundPreviewServer();
                return "SUCCESS: Local preview server running on port 3000.";
            }

            // Route git commands to host machine where Git CLI and SSH/OAuth credentials are configured
            if (isDockerRunning() && !command.trim().startsWith("git ") && !command.trim().equals("git")) {
                ProcessBuilder builder = new ProcessBuilder("docker", "exec", CONTAINER_NAME, "sh", "-c", command);
                builder.redirectErrorStream(true);
                Process process = builder.start();
                boolean finished = process.waitFor(30, TimeUnit.SECONDS);
                String output = new String(process.getInputStream().readAllBytes(), StandardCharsets.UTF_8).trim();

                if (!finished) {
                    process.destroyForcibly();
                    return "Error: Command timed out after 30 seconds.\n" + output;
                }
                return output.isEmpty() ? "Command executed successfully (exit code 0)." : output;
            } else {
                // Robust Host Execution (PowerShell on Windows, Bash on Unix)
                ProcessBuilder pb;
                boolean isWindows = System.getProperty("os.name").toLowerCase().contains("win");
                if (isWindows) {
                    pb = new ProcessBuilder("powershell.exe", "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", "[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; " + command);
                } else {
                    pb = new ProcessBuilder("bash", "-c", command);
                }
                pb.directory(workspaceDir);
                pb.redirectErrorStream(true);

                Process process = pb.start();
                boolean finished = process.waitFor(30, TimeUnit.SECONDS);
                String output = new String(process.getInputStream().readAllBytes(), StandardCharsets.UTF_8).trim();

                if (!finished) {
                    process.destroyForcibly();
                    return "Error: Command timed out after 30 seconds.\n" + output;
                }
                return output.isEmpty() ? "Command executed successfully (exit code 0)." : output;
            }
        } catch (Exception e) {
            return "Execution error: " + e.getMessage();
        }
    }

    public void startBackgroundPreviewServer() {
        try {
            File workspaceDir = fileSystemTool.getWorkspaceRoot().toFile();
            boolean isWindows = System.getProperty("os.name").toLowerCase().contains("win");
            if (isWindows) {
                new ProcessBuilder(
                        "powershell.exe",
                        "-Command",
                        "Start-Process node -ArgumentList 'app.js' -WorkingDirectory '" + workspaceDir.getAbsolutePath() + "' -WindowStyle Hidden"
                ).start();
            } else {
                new ProcessBuilder("sh", "-c", "node app.js &").directory(workspaceDir).start();
            }
        } catch (Exception ignored) {}
    }
}