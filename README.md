# SpringAI-Agent ⚡

**SpringAI-Agent** is an autonomous full-stack AI software engineering platform and live coding companion built with Spring Boot 3, Spring AI, and a high-contrast Skeuomorphic Retro-Minimalist web console.

---

## 🚀 Key Features

- **5-Agent Autonomous Swarm**:
  - `Architect`: Formulates architectural blueprints and plan decompositions.
  - `Coder`: Synthesizes multi-file full-stack web applications in < 1 second.
  - `QA Tester`: Runs static AST validation, DOM structure checks, and self-healing lint loops.
  - `Security Reviewer`: Performs real-time SAST inspections for XSS and secret leaks.
  - `DevOps`: Manages Git checkpoints, automated GitHub REST API repository creation, and cloud deployments.
- **Live Preview Runner**: Zero-config instant hot-reloading browser preview environment.
- **Retro-Minimalist Hardware Studio**: Dieter Rams-inspired aesthetic with mechanical audio feedback and CRT phosphor monitor rendering.
- **Autonomous CI/CD & DAG Workflow Engine**: Visual node graph builder for event-driven webhook remediation and test governance pipelines.

---

## 🛠️ Architecture & Tech Stack

- **Backend**: Spring Boot 3.3.5, Spring AI, Java 17, Maven.
- **Frontend**: Vite 6, TypeScript, Tailwind CSS, Lucide Icons, Canvas 2D.
- **Deployment**: Vercel (Frontend), Render / Railway / Docker (Backend).

---

## 🏁 Quick Start

### 1. Backend Server
```bash
cd agent-backend
# On Windows
.\run.ps1
# On macOS/Linux
./mvnw spring-boot:run
```
Runs on `http://localhost:8090`.

### 2. Frontend Studio
```bash
cd agent-frontend
npm install
npm run dev
```
Runs on `http://localhost:4200`.

---

## 📦 Cloud Hosting

- **Frontend on Vercel / Render**: Connect `SpringAI-Agent` and deploy with `npm run build` (`dist/` output).
- **Backend on Render / Railway**: Deploy `agent-backend` with `./mvnw clean package -DskipTests`.
