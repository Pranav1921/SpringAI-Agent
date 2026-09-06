import { UserProfile, TaskPayload, TaskResponse, AgentEvent, FileNode, SkillItem, AgentPersona, CheckpointItem } from '../types';

export class ApiService {
  private baseUrl = '/api';

  private getHeaders(): HeadersInit {
    const tenant = localStorage.getItem('agent_tenant') || 'default';
    const token = localStorage.getItem('github_token') || '';
    const geminiKey = localStorage.getItem('gemini_api_key') || '';
    const model = localStorage.getItem('agent_model') || 'gemini-1.5-flash';
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Tenant-Id': tenant
    };
    if (token) {
      headers['X-GitHub-Token'] = token;
    }
    if (geminiKey) {
      headers['X-Gemini-Api-Key'] = geminiKey;
    }
    if (model) {
      headers['X-Model-Id'] = model;
    }
    return headers;
  }

  private async apiFetch(endpoint: string, init: RequestInit = {}): Promise<Response> {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const headers = {
      ...this.getHeaders(),
      ...(init.headers || {})
    };

    try {
      return await fetch(`${this.baseUrl}${cleanEndpoint}`, {
        ...init,
        headers
      });
    } catch (localErr) {
      console.warn(`Local proxy fetch to ${this.baseUrl}${cleanEndpoint} failed, retrying directly on http://127.0.0.1:8080/api${cleanEndpoint}...`);
      return await fetch(`http://127.0.0.1:8080/api${cleanEndpoint}`, {
        ...init,
        headers
      });
    }
  }

  async getUserProfile(): Promise<UserProfile> {
    try {
      const res = await this.apiFetch('/user');
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      return {
        login: 'Guest',
        name: 'Guest User',
        avatar_url: 'https://avatars.githubusercontent.com/u/9919?v=4',
        organization: 'Local Workspace',
        authenticated: false
      };
    }
  }

  async loginUser(username: string, token?: string): Promise<UserProfile> {
    try {
      const res = await this.apiFetch('/user/login', {
        method: 'POST',
        body: JSON.stringify({ username, token })
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
      const cleanUser = username || 'Developer';
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
      await this.apiFetch('/user/logout', { method: 'POST' });
    } catch {}
    localStorage.removeItem('agent_tenant');
    localStorage.removeItem('github_token');
  }

  async runTask(payload: TaskPayload): Promise<TaskResponse> {
    try {
      const res = await this.apiFetch('/task', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server returned ${res.status}: ${text}`);
      }
      return await res.json();
    } catch (e) {
      console.error('API runTask failed:', e);
      throw e;
    }
  }

  async getAgentHistory(): Promise<AgentEvent[]> {
    try {
      const res = await this.apiFetch('/agent/history');
      return await res.json();
    } catch {
      return [];
    }
  }

  async clearAgentMemory(): Promise<{ status: string }> {
    const res = await this.apiFetch('/agent/clear', { method: 'POST' });
    return await res.json();
  }

  async getCurrentFolder(): Promise<{ folderPath: string; tenant: string }> {
    try {
      const res = await this.apiFetch('/workspace/current-folder');
      return await res.json();
    } catch {
      return { folderPath: 'workspace', tenant: 'default' };
    }
  }

  async getCommonFolders(): Promise<Record<string, string>> {
    try {
      const res = await this.apiFetch('/workspace/common-folders');
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
    const res = await this.apiFetch('/workspace/set-folder', {
      method: 'POST',
      body: JSON.stringify({ folderPath })
    });
    return await res.json();
  }

  async openFolderInOs(): Promise<{ status: string; message: string }> {
    try {
      const res = await this.apiFetch('/workspace/open-in-os', { method: 'POST' });
      return await res.json();
    } catch (e: any) {
      return { status: 'ERROR', message: e.message || 'Failed to open in OS' };
    }
  }

  async pickFolderDialog(): Promise<{ status: string; folderPath: string; files: FileNode[] }> {
    try {
      const res = await this.apiFetch('/workspace/pick-folder-dialog', { method: 'POST' });
      return await res.json();
    } catch {
      return { status: 'ERROR', folderPath: 'workspace', files: [] };
    }
  }

  async executeTerminalCommand(command: string): Promise<{ status: string; command: string; output: string }> {
    const res = await this.apiFetch('/terminal/exec', {
      method: 'POST',
      body: JSON.stringify({ command })
    });
    return await res.json();
  }

  async getFiles(): Promise<FileNode[]> {
    try {
      const res = await this.apiFetch('/workspace/files');
      return await res.json();
    } catch {
      return [];
    }
  }

  async getFileContent(path: string): Promise<{ content: string }> {
    try {
      const res = await this.apiFetch(`/workspace/file-content?path=${encodeURIComponent(path)}`);
      return await res.json();
    } catch {
      return { content: '' };
    }
  }

  async saveFile(path: string, content: string): Promise<{ status: string }> {
    const res = await this.apiFetch('/workspace/save', {
      method: 'POST',
      body: JSON.stringify({ path, content })
    });
    return await res.json();
  }

  async deleteFile(path: string): Promise<{ status: string }> {
    const res = await this.apiFetch('/workspace/delete', {
      method: 'POST',
      body: JSON.stringify({ path })
    });
    return await res.json();
  }

  async getCheckpoints(): Promise<CheckpointItem[]> {
    try {
      const res = await this.apiFetch('/checkpoints');
      return await res.json();
    } catch {
      return [];
    }
  }

  async restoreCheckpoint(hash: string): Promise<{ status: string }> {
    const res = await this.apiFetch('/checkpoints/restore', {
      method: 'POST',
      body: JSON.stringify({ hash })
    });
    return await res.json();
  }

  async getSkills(): Promise<SkillItem[]> {
    try {
      const res = await this.apiFetch('/skills');
      return await res.json();
    } catch {
      return [];
    }
  }

  async toggleSkill(id: string): Promise<{ status: string }> {
    const res = await this.apiFetch(`/skills/${id}/toggle`, { method: 'POST' });
    return await res.json();
  }

  async clearMemory(): Promise<{ status: string }> {
    const res = await this.apiFetch('/agent/clear', { method: 'POST' });
    return await res.json();
  }

  async createRepoAndPush(payload: { name: string; description?: string; isPrivate?: boolean; token?: string; username?: string }): Promise<any> {
    try {
      const res = await this.apiFetch('/git/create-and-push', {
        method: 'POST',
        body: JSON.stringify(payload)
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
      const res = await this.apiFetch('/personas');
      return await res.json();
    } catch {
      return [];
    }
  }

  async stopTask(): Promise<{ status: string }> {
    try {
      const res = await this.apiFetch('/agent/stop', { method: 'POST' });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend stop notification failed:', e);
    }
    return { status: 'TASK_STOPPED' };
  }

  // --- Google AI Studio APIs ---

  async getStudioModels(): Promise<any[]> {
    try {
      const res = await this.apiFetch('/studio/models');
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
      const res = await this.apiFetch('/studio/get-code', {
        method: 'POST',
        body: JSON.stringify(params)
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
      const res = await this.apiFetch('/studio/prompts');
      return await res.json();
    } catch {
      return [
        { id: 'p1', title: 'Full-Stack Web Synthesizer', prompt: 'Build a modern interactive dashboard with glassmorphism cards and charts', updatedAt: 'Just now' }
      ];
    }
  }

  async getLandingInfo(): Promise<any> {
    try {
      const res = await this.apiFetch('/landing/info');
      return await res.json();
    } catch {
      return {
        title: 'Spring AI Autonomous Dev',
        version: '2.0.0',
        status: 'ONLINE'
      };
    }
  }

  async getWorkspaceInfo(): Promise<any> {
    try {
      const res = await this.apiFetch('/workspace/info');
      return await res.json();
    } catch {
      return {
        workspacePath: 'workspace',
        status: 'READY'
      };
    }
  }

  async triggerPipeline(repo?: string, branch?: string, commit?: string): Promise<any> {
    try {
      const res = await this.apiFetch('/pipeline/trigger', {
        method: 'POST',
        body: JSON.stringify({
          repo: repo || 'enterprise-app',
          branch: branch || 'main',
          commit: commit || `commit-${Date.now().toString(36)}`,
          triggerType: 'MANUAL_UI'
        })
      });
      return await res.json();
    } catch {
      return { status: 'QUEUED', message: 'Local worker triggered' };
    }
  }

  async getPipelineHistory(): Promise<any[]> {
    try {
      const res = await this.apiFetch('/pipeline/history');
      return await res.json();
    } catch {
      return [];
    }
  }

  async getPipelineDetails(id: string): Promise<any> {
    try {
      const res = await this.apiFetch(`/pipeline/${id}`);
      return await res.json();
    } catch {
      return null;
    }
  }

  async getWorkflowTemplates(): Promise<any[]> {
    try {
      const res = await this.apiFetch('/workflow/templates');
      return await res.json();
    } catch {
      return [];
    }
  }

  async executeWorkflow(templateId?: string, input?: any, definition?: any): Promise<any> {
    try {
      const body: any = {
        templateId: templateId || 'tpl-pr-governance',
        input: input || { triggerSource: 'MANUAL_CANVAS_RUN' }
      };
      if (definition) {
        body.definition = definition;
      }
      const res = await this.apiFetch('/workflow/execute', {
        method: 'POST',
        body: JSON.stringify(body)
      });
      return await res.json();
    } catch {
      return { status: 'QUEUED', id: 'wf-mock-run' };
    }
  }

  async getWorkflowHistory(): Promise<any[]> {
    try {
      const res = await this.apiFetch('/workflow/history');
      return await res.json();
    } catch {
      return [];
    }
  }

  async getWorkflowDetails(id: string): Promise<any> {
    try {
      const res = await this.apiFetch(`/workflow/${id}`);
      return await res.json();
    } catch {
      return null;
    }
  }
}

export const api = new ApiService();
