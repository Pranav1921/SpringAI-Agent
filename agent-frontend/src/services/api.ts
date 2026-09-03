import { UserProfile, TaskPayload, TaskResponse, AgentEvent, FileNode, SkillItem, AgentPersona, CheckpointItem } from '../types';

export class ApiService {
  private baseUrl = 'http://localhost:8080/api';

  private getHeaders(): HeadersInit {
    const tenant = localStorage.getItem('agent_tenant') || 'pranav1921';
    const token = localStorage.getItem('github_token') || '';
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Tenant-Id': tenant
    };
    if (token) {
      headers['X-GitHub-Token'] = token;
    }
    return headers;
  }

  async getUserProfile(): Promise<UserProfile> {
    try {
      const res = await fetch(`${this.baseUrl}/user`, {
        headers: this.getHeaders(),
        credentials: 'include'
      });
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      return {
        login: 'Pranav1921',
        name: 'Pranav1921',
        avatar_url: 'https://avatars.githubusercontent.com/u/9919?v=4',
        organization: 'Workspace • Pranav1921',
        authenticated: true
      };
    }
  }

  async loginUser(username: string, token?: string): Promise<UserProfile> {
    try {
      const res = await fetch(`${this.baseUrl}/user/login`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ username, token }),
        credentials: 'include'
      });
      const data = await res.json();
      if (data && data.login) {
        localStorage.setItem('agent_tenant', data.login.toLowerCase());
        if (token && token.trim()) {
          localStorage.setItem('github_token', token.trim());
        }
      }
      return data;
    } catch {
      const cleanUser = username || 'Pranav1921';
      return {
        login: cleanUser,
        name: cleanUser,
        avatar_url: `https://github.com/${cleanUser}.png`,
        organization: `Workspace • ${cleanUser}`,
        authenticated: true
      };
    }
  }

  async logoutUser(): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/user/logout`, {
        method: 'POST',
        headers: this.getHeaders(),
        credentials: 'include'
      });
    } catch {}
    localStorage.removeItem('agent_tenant');
    localStorage.removeItem('github_token');
  }

  async runTask(payload: TaskPayload): Promise<TaskResponse> {
    const res = await fetch(`${this.baseUrl}/task`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
      credentials: 'include'
    });
    return await res.json();
  }

  async getAgentHistory(): Promise<AgentEvent[]> {
    try {
      const res = await fetch(`${this.baseUrl}/agent/history`, {
        headers: this.getHeaders(),
        credentials: 'include'
      });
      return await res.json();
    } catch {
      return [];
    }
  }

  async clearAgentMemory(): Promise<{ status: string }> {
    const res = await fetch(`${this.baseUrl}/agent/clear`, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include'
    });
    return await res.json();
  }

  async getCurrentFolder(): Promise<{ folderPath: string; tenant: string }> {
    try {
      const res = await fetch(`${this.baseUrl}/workspace/current-folder`, {
        headers: this.getHeaders(),
        credentials: 'include'
      });
      return await res.json();
    } catch {
      return { folderPath: 'workspace', tenant: 'pranav1921' };
    }
  }

  async getCommonFolders(): Promise<Record<string, string>> {
    try {
      const res = await fetch(`${this.baseUrl}/workspace/common-folders`, {
        headers: this.getHeaders(),
        credentials: 'include'
      });
      return await res.json();
    } catch {
      return {
        projectWorkspace: 'workspace',
        desktop: 'C:/Users/prana/Desktop',
        downloads: 'C:/Users/prana/Downloads',
        documents: 'C:/Users/prana/Documents'
      };
    }
  }

  async setFolder(folderPath: string): Promise<{ status: string; currentFolder: string }> {
    const res = await fetch(`${this.baseUrl}/workspace/set-folder`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ folderPath }),
      credentials: 'include'
    });
    return await res.json();
  }

  async openFolderInOs(): Promise<{ status: string; message: string }> {
    try {
      const res = await fetch(`${this.baseUrl}/workspace/open-in-os`, {
        method: 'POST',
        headers: this.getHeaders(),
        credentials: 'include'
      });
      return await res.json();
    } catch (e: any) {
      return { status: 'ERROR', message: e.message || 'Failed to open in OS' };
    }
  }

  async executeTerminalCommand(command: string): Promise<{ status: string; command: string; output: string }> {
    const res = await fetch(`${this.baseUrl}/terminal/exec`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ command }),
      credentials: 'include'
    });
    return await res.json();
  }

  async getFiles(): Promise<FileNode[]> {
    try {
      const res = await fetch(`${this.baseUrl}/workspace/files`, {
        headers: this.getHeaders(),
        credentials: 'include'
      });
      return await res.json();
    } catch {
      return [];
    }
  }

  async getFileContent(path: string): Promise<{ content: string }> {
    try {
      const res = await fetch(`${this.baseUrl}/workspace/file-content?path=${encodeURIComponent(path)}`, {
        headers: this.getHeaders(),
        credentials: 'include'
      });
      return await res.json();
    } catch {
      return { content: '' };
    }
  }

  async saveFile(path: string, content: string): Promise<{ status: string }> {
    const res = await fetch(`${this.baseUrl}/workspace/save`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ path, content }),
      credentials: 'include'
    });
    return await res.json();
  }

  async deleteFile(path: string): Promise<{ status: string }> {
    const res = await fetch(`${this.baseUrl}/workspace/delete`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ path }),
      credentials: 'include'
    });
    return await res.json();
  }

  async getCheckpoints(): Promise<CheckpointItem[]> {
    try {
      const res = await fetch(`${this.baseUrl}/checkpoints`, {
        headers: this.getHeaders(),
        credentials: 'include'
      });
      return await res.json();
    } catch {
      return [];
    }
  }

  async restoreCheckpoint(hash: string): Promise<{ status: string }> {
    const res = await fetch(`${this.baseUrl}/checkpoints/restore`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ hash }),
      credentials: 'include'
    });
    return await res.json();
  }

  async getSkills(): Promise<SkillItem[]> {
    try {
      const res = await fetch(`${this.baseUrl}/skills`, {
        headers: this.getHeaders(),
        credentials: 'include'
      });
      return await res.json();
    } catch {
      return [];
    }
  }

  async toggleSkill(id: string): Promise<{ status: string }> {
    const res = await fetch(`${this.baseUrl}/skills/${id}/toggle`, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include'
    });
    return await res.json();
  }

  async clearMemory(): Promise<{ status: string }> {
    const res = await fetch(`${this.baseUrl}/agent/clear`, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include'
    });
    return await res.json();
  }

  async createRepoAndPush(payload: { name: string; description?: string; isPrivate?: boolean; token?: string; username?: string }): Promise<any> {
    try {
      const res = await fetch(`${this.baseUrl}/git/create-and-push`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
        credentials: 'include'
      });
      if (!res.ok) {
        const errText = await res.text();
        try {
          const json = JSON.parse(errText);
          return { success: false, error: json.error || json.message || `Server returned ${res.status}` };
        } catch {
          return { success: false, error: `GitHub API error (${res.status} ${res.statusText}). Please verify your Personal Access Token has 'repo' permissions.` };
        }
      }
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error communicating with Git service.' };
    }
  }

  async getPersonas(): Promise<AgentPersona[]> {
    try {
      const res = await fetch(`${this.baseUrl}/personas`, {
        headers: this.getHeaders(),
        credentials: 'include'
      });
      return await res.json();
    } catch {
      return [];
    }
  }

  async stopTask(): Promise<{ status: string }> {
    const res = await fetch(`${this.baseUrl}/agent/stop`, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include'
    });
    return await res.json();
  }

  // --- Google AI Studio APIs ---

  async getStudioModels(): Promise<any[]> {
    try {
      const res = await fetch(`${this.baseUrl}/studio/models`, {
        headers: this.getHeaders(),
        credentials: 'include'
      });
      return await res.json();
    } catch {
      return [
        { id: 'spring-ai-pro', name: 'Spring AI Pro', description: 'Autonomous coding, architecture synthesis & reasoning model', contextWindow: 128000, recommended: true },
        { id: 'deepseek-coder:6.7b', name: 'DeepSeek Coder 6.7B', description: 'Specialized low-latency code synthesis engine (Local Ollama)', contextWindow: 16384, recommended: false },
        { id: 'spring-ai-flash', name: 'Spring AI Flash', description: 'High-frequency reasoning and real-time query model', contextWindow: 32768, recommended: false }
      ];
    }
  }

  async getStudioCode(params: TaskPayload): Promise<{ curl: string; python: string; typescript: string; java: string }> {
    try {
      const res = await fetch(`${this.baseUrl}/studio/get-code`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(params),
        credentials: 'include'
      });
      return await res.json();
    } catch {
      return {
        curl: `curl -X POST http://localhost:8080/api/task -H "Content-Type: application/json" -d '{"prompt": "${params.prompt.replace(/"/g, '\\"')}", "mode": "ask"}'`,
        python: `import requests\nres = requests.post("http://localhost:8080/api/task", json={"prompt": "${params.prompt.replace(/"/g, '\\"')}", "mode": "ask"})\nprint(res.json())`,
        typescript: `const res = await fetch("http://localhost:8080/api/task", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: "${params.prompt.replace(/"/g, '\\"')}", mode: "ask" }) });\nconsole.log(await res.json());`,
        java: `// Run via Spring AI or HttpClient\nHttpClient.newHttpClient().send(HttpRequest.newBuilder().uri(URI.create("http://localhost:8080/api/task")).POST(HttpRequest.BodyPublishers.ofString("{\\"prompt\\": \\"${params.prompt.replace(/"/g, '\\"')}\\", \\"mode\\": \\"ask\\"} ")).build(), HttpResponse.BodyHandlers.ofString());`
      };
    }
  }

  async getSavedStudioPrompts(): Promise<any[]> {
    try {
      const res = await fetch(`${this.baseUrl}/studio/prompts`, {
        headers: this.getHeaders(),
        credentials: 'include'
      });
      return await res.json();
    } catch {
      return [
        { id: 'p1', title: 'Full-Stack Web Synthesizer', prompt: 'Build a modern interactive dashboard with glassmorphism cards and charts', updatedAt: 'Just now' }
      ];
    }
  }

  async saveStudioPrompt(data: any): Promise<any> {
    try {
      const res = await fetch(`${this.baseUrl}/studio/prompts`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
        credentials: 'include'
      });
      return await res.json();
    } catch {
      return data;
    }
  }
}

export const api = new ApiService();
