package com.springagent.agent_backend.tools;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.concurrent.Executors;

@Service
public class WorkspacePreviewServer {

    private final FileSystemTool fileSystemTool;
    private HttpServer server;
    private int port = 3000;

    public WorkspacePreviewServer(FileSystemTool fileSystemTool) {
        this.fileSystemTool = fileSystemTool;
    }

    @PostConstruct
    public void start() {
        for (int p = 3000; p <= 3010; p++) {
            try {
                startServer(p);
                return;
            } catch (Exception e) {
                // Try next port
            }
        }
        System.out.println("[*] WorkspacePreviewServer: Local standalone preview port 3000-3010 in use; embedded srcdoc preview active.");
    }

    private void startServer(int targetPort) throws IOException {
        server = HttpServer.create(new InetSocketAddress(targetPort), 0);
        this.port = targetPort;
        server.createContext("/", new WorkspaceHttpHandler());
        server.setExecutor(Executors.newCachedThreadPool());
        server.start();
        System.out.println("🌐 [PREVIEW SERVER LIVE] Live Workspace HTTP Server running at http://localhost:" + this.port + "/");
    }

    public int getPort() {
        return port;
    }

    @PreDestroy
    public void stop() {
        if (server != null) {
            server.stop(0);
        }
    }

    private class WorkspaceHttpHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
            exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, OPTIONS, HEAD");
            exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "*");

            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                exchange.close();
                return;
            }

            String rawPath = exchange.getRequestURI().getPath();
            if (rawPath == null || rawPath.isEmpty() || "/".equals(rawPath)) {
                rawPath = "/index.html";
            }

            while (rawPath.startsWith("/")) {
                rawPath = rawPath.substring(1);
            }

            Path workspaceRoot = fileSystemTool.getWorkspaceRoot();
            Path filePath = workspaceRoot.resolve(rawPath).normalize();

            // Try resolving exact path or common aliases
            if (!Files.exists(filePath) || Files.isDirectory(filePath)) {
                String fileName = rawPath.toLowerCase();
                if (fileName.equals("style.css") || fileName.equals("styles.css")) {
                    Path alt1 = workspaceRoot.resolve("styles.css");
                    Path alt2 = workspaceRoot.resolve("style.css");
                    if (Files.exists(alt1)) filePath = alt1;
                    else if (Files.exists(alt2)) filePath = alt2;
                } else if (fileName.equals("script.js") || fileName.equals("app.js") || fileName.equals("main.js")) {
                    Path alt1 = workspaceRoot.resolve("script.js");
                    Path alt2 = workspaceRoot.resolve("app.js");
                    Path alt3 = workspaceRoot.resolve("main.js");
                    if (Files.exists(alt1)) filePath = alt1;
                    else if (Files.exists(alt2)) filePath = alt2;
                    else if (Files.exists(alt3)) filePath = alt3;
                }
            }

            if (!filePath.startsWith(workspaceRoot) || !Files.exists(filePath) || Files.isDirectory(filePath)) {
                // Only fall back to index.html for SPA page navigations, NOT for missing CSS/JS assets
                boolean isAssetRequest = rawPath.endsWith(".css") || rawPath.endsWith(".js") || rawPath.endsWith(".png") || rawPath.endsWith(".jpg") || rawPath.endsWith(".ico") || rawPath.endsWith(".svg") || rawPath.endsWith(".json");
                if (isAssetRequest) {
                    if (rawPath.endsWith(".css")) {
                        byte[] emptyCss = "/* stylesheet placeholder */\n".getBytes("UTF-8");
                        exchange.getResponseHeaders().set("Content-Type", "text/css; charset=UTF-8");
                        exchange.sendResponseHeaders(200, emptyCss.length);
                        try (OutputStream os = exchange.getResponseBody()) { os.write(emptyCss); }
                        return;
                    } else if (rawPath.endsWith(".js")) {
                        byte[] emptyJs = "// javascript placeholder\n".getBytes("UTF-8");
                        exchange.getResponseHeaders().set("Content-Type", "application/javascript; charset=UTF-8");
                        exchange.sendResponseHeaders(200, emptyJs.length);
                        try (OutputStream os = exchange.getResponseBody()) { os.write(emptyJs); }
                        return;
                    } else {
                        exchange.sendResponseHeaders(404, -1);
                        exchange.close();
                        return;
                    }
                }

                Path indexFallback = workspaceRoot.resolve("index.html");
                if (Files.exists(indexFallback)) {
                    filePath = indexFallback;
                } else {
                    String notFound = "<!DOCTYPE html><html><head><title>Workspace Ready</title><style>body{background:#09090b;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;}</style></head><body><div style='text-align:center;'><h2>Workspace Ready on http://localhost:" + port + "</h2><p style='color:#a1a1aa;'>Waiting for Agent to generate files...</p></div></body></html>";
                    byte[] bytes = notFound.getBytes("UTF-8");
                    exchange.getResponseHeaders().set("Content-Type", "text/html; charset=UTF-8");
                    exchange.sendResponseHeaders(200, bytes.length);
                    try (OutputStream os = exchange.getResponseBody()) {
                        os.write(bytes);
                    }
                    return;
                }
            }

            String contentType = determineContentType(filePath.getFileName().toString());
            exchange.getResponseHeaders().set("Content-Type", contentType);

            byte[] fileBytes = Files.readAllBytes(filePath);
            exchange.sendResponseHeaders(200, fileBytes.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(fileBytes);
            }
        }

        private String determineContentType(String fileName) {
            String lower = fileName.toLowerCase();
            if (lower.endsWith(".html")) return "text/html; charset=UTF-8";
            if (lower.endsWith(".css")) return "text/css; charset=UTF-8";
            if (lower.endsWith(".js")) return "application/javascript; charset=UTF-8";
            if (lower.endsWith(".json")) return "application/json; charset=UTF-8";
            if (lower.endsWith(".svg")) return "image/svg+xml";
            if (lower.endsWith(".png")) return "image/png";
            if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
            if (lower.endsWith(".ico")) return "image/x-icon";
            return "text/plain; charset=UTF-8";
        }
    }
}
