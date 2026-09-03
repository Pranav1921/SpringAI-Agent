import { api } from '../services/api';
import { sseService } from '../services/sse';
import { 
  ChatMessage, 
  AgentSessionItem, 
  AgentEvent, 
  FileNode, 
  UserProfile, 
  SkillItem, 
  AgentPersona, 
  CheckpointItem, 
  PlanStep,
  DecisionOption
} from '../types';

export class WorkspaceComponent {
  private container: HTMLElement;
  
  // State
  private userProfile: UserProfile = { login: 'Pranav1921', organization: 'Workspace • Pranav1921', avatar_url: 'https://avatars.githubusercontent.com/u/9919?v=4' };
  private currentTenant: string = 'pranav1921';
  private currentWorkspacePath: string = 'workspace';
  private commonFolders: Record<string, string> = {};

  private getFolderDisplayBasename(): string {
    if (!this.currentWorkspacePath) return 'workspace';
    const parts = this.currentWorkspacePath.replace(/\\/g, '/').split('/').filter(p => p.trim().length > 0);
    return parts.length > 0 ? parts[parts.length - 1] : this.currentWorkspacePath;
  }
  
  private aiMode: 'agent' | 'ask' = 'agent';
  private isExecuting: boolean = false;
  private currentStatusText: string = 'Ready for prompt';
  private taskPrompt: string = '';
  private crtEnabled: boolean = false;
  
  private agentSwarmRoles = [
    { id: 'ARCHITECT', name: 'Architect', desc: 'System Blueprint & Design' },
    { id: 'CODER', name: 'Coder', desc: 'Synthesis & Code Logic' },
    { id: 'TESTER', name: 'QA Tester', desc: 'Quality & Test Validation' },
    { id: 'SECURITY_REVIEWER', name: 'Security', desc: 'Vulnerability & Risk Audit' },
    { id: 'DEVOPS', name: 'DevOps', desc: 'Checkpoints & Deploy' }
  ];
  private activeSwarmRole: string = 'IDLE';
  private filterSwarmRole: string = 'ALL';
  
  private showSidePanel: boolean = true;
  private panelWidthPercent: number = 36;
  private isResizing: boolean = false;
  
  private activeWorkspaceTab: 'browser' | 'editor' | 'tuning' | 'checkpoints' = 'browser';
  private previewViewport: 'desktop' | 'tablet' | 'mobile' = 'desktop';
  private isAppReady: boolean = false;
  private generatedSrcDoc: string = '';
  
  private temperature: number = 0.7;
  private systemInstructionOpen: boolean = false;
  private systemInstruction: string = 'You are Spring AI Agent, an expert Autonomous Full-Stack Software Engineer. Generate complete, high-quality, production-ready source code with modern UI design and robust logic.';
  
  private messages: ChatMessage[] = [];
  private sessions: AgentSessionItem[] = [];
  private activeSession: AgentSessionItem | null = null;
  
  private fileList: FileNode[] = [];
  private selectedFile: FileNode | null = null;
  private fileContent: string = '';
  private saved: boolean = false;
  private copied: boolean = false;
  
  // Live Streaming Typewriter Engine in Main Workspace
  private isStreamingCode: boolean = false;
  private streamingFileName: string = '';
  private streamingLineNum: number = 0;
  private totalStreamingLines: number = 0;
  private displayedStreamingCode: string = '';
  private streamQueue: Array<{ fileName: string; content: string }> = [];
  private isProcessingStreamQueue: boolean = false;
  private streamingIntervalId: any = null;
  
  // Terminal
  private terminalLogs: Array<{cmd: string, out: string, time: string}> = [];
  private terminalCommand: string = '';
  private terminalRunning: boolean = false;
  private terminalHistory: string[] = [];
  private historyIndex: number = -1;
  
  // Snapshots & Skills
  private checkpoints: CheckpointItem[] = [];
  private skillsList: SkillItem[] = [];
  private personasList: AgentPersona[] = [];
  private attachedImages: string[] = [];
  private isVoiceListening: boolean = false;
  private speechRecognition: any = null;
  
  private showSkillsModal: boolean = false;
  private showUserMenu: boolean = false;
  private showFolderModal: boolean = false;
  private customFolderInput: string = '';
  private showGitHubLoginModal: boolean = false;
  private gitHubLoginError: string = '';
  private isLoggingInGitHub: boolean = false;
  private isCreatingRepo: boolean = false;
  private createRepoResult: { success: boolean; message: string; htmlUrl?: string } | null = null;
  
  // Google AI Studio Features
  private promptTitle: string = 'Chat prompt';
  private isEditingPromptTitle: boolean = false;
  private showGetCodeModal: boolean = false;
  private getCodeActiveTab: 'curl' | 'python' | 'typescript' | 'java' = 'curl';
  private studioCodeSnippets: { curl: string; python: string; typescript: string; java: string } | null = null;
  private selectedModelId: string = 'spring-ai-pro';
  
  private lastHandledContent: string = '';

  constructor(container: HTMLElement) {
    this.container = container;
    this.init();
  }

  private async init() {
    this.currentTenant = localStorage.getItem('agent_tenant') || 'pranav1921';
    this.loadSessionsFromStorage();
    
    // Initial Render
    this.render();
    
    // Background async loaders
    this.userProfile = await api.getUserProfile();
    const folder = await api.getCurrentFolder();
    this.currentWorkspacePath = folder.folderPath;
    this.fileList = await api.getFiles();
    this.skillsList = await api.getSkills();
    this.personasList = await api.getPersonas();
    this.commonFolders = await api.getCommonFolders();
    await this.loadFiles();
    this.render();
    
    // Subscribe to real-time events
    sseService.subscribe((event: AgentEvent) => this.handleAgentEvent(event));
    
    // Setup global window listeners
    window.addEventListener('mousemove', (e) => this.onMouseMove(e));
    window.addEventListener('mouseup', () => this.onMouseUp());
    
    this.render();
  }

  private progressPercent: number = 0;

  private recentHandledEvents = new Set<string>();

  private handleAgentEvent(event: AgentEvent) {
    const timestamp = event.timestamp || new Date().toLocaleTimeString();
    const eventKey = `${event.type}:${event.content || ''}`;

    if (this.recentHandledEvents.has(eventKey)) {
      return;
    }
    this.recentHandledEvents.add(eventKey);
    setTimeout(() => this.recentHandledEvents.delete(eventKey), 2000);

    if (event.type === 'PLAN_PROPOSAL') {
      const rawSteps = (event.metadata && (event.metadata as any)['steps']) || [];
      const planTitle = (event.metadata && (event.metadata as any)['planTitle']) || 'Proposed Implementation Plan';
      const taskPrompt = (event.metadata && (event.metadata as any)['taskPrompt']) || '';
      
      const mappedSteps: PlanStep[] = rawSteps.map((s: any) => ({
        id: String(s.id || Math.random()),
        file: s.file || 'workspace',
        label: s.label || 'Synthesize application module',
        status: s.status || 'pending',
        completed: s.status === 'completed'
      }));

      const existingPlan = this.messages.find(m => m.type === 'plan');
      if (existingPlan) {
        existingPlan.steps = mappedSteps;
        existingPlan.content = event.content;
      } else {
        this.messages.push({
          id: Math.random().toString(),
          sender: 'agent',
          type: 'plan',
          title: planTitle,
          planTitle: planTitle,
          taskPrompt: taskPrompt,
          content: event.content,
          steps: mappedSteps,
          timestamp
        });
      }
      this.render();
      this.scrollToBottom();
    } else if (event.type === 'DECISION' || event.type === 'QUESTION') {
      const content = event.content || 'Please select your preferred architecture option to proceed:';
      const existing = this.messages.find(m => m.type === 'decision' && m.content === content);
      if (existing) {
        return;
      }
      const rawOptions = (event.metadata && (event.metadata as any)['options']) || [
        { id: 'opt_a', label: 'Dark Cyberpunk Minimalist Theme', action: 'dark_theme' },
        { id: 'opt_b', label: 'Flipkart Classic Blue & Yellow Theme', action: 'classic_theme' },
        { id: 'opt_c', label: 'Include Mock UPI Payment QR Code', action: 'upi_payment' }
      ];
      this.messages.push({
        id: Math.random().toString(),
        sender: 'agent',
        type: 'decision',
        content: content,
        options: rawOptions,
        timestamp
      });
      this.render();
      this.scrollToBottom();
    } else if (event.type === 'SWARM_STATUS') {
      const role = (event.metadata && (event.metadata as any)['role']) || event.source;
      this.activeSwarmRole = role;
      if (event.content) this.currentStatusText = event.content;
      this.render();
    } else if (event.type === 'STEP_PROGRESS') {
      const fileName = event.metadata ? (event.metadata as any)['fileName'] : '';
      let completedCount = 0;
      let totalCount = 4;

      for (let i = this.messages.length - 1; i >= 0; i--) {
        const msg = this.messages[i];
        if (msg.type === 'plan' && msg.steps) {
          totalCount = msg.steps.length;
          const matching = msg.steps.find(s => (s.file && fileName && fileName.toLowerCase().includes(s.file.toLowerCase())) || 
                                               (s.label && s.label.toLowerCase().includes(fileName.toLowerCase())));
          if (matching) {
            matching.completed = true;
            matching.status = 'completed';
          }
          completedCount = msg.steps.filter(s => s.completed).length;
          break;
        }
      }

      this.progressPercent = Math.min(100, Math.round((completedCount / totalCount) * 100));
      this.loadFiles();
      this.render();
    } else if (event.type === 'THOUGHT') {
      const role = (event.metadata && (event.metadata as any)['role']) || 'ARCHITECT';
      this.activeSwarmRole = role;
      this.currentStatusText = event.content;
      this.messages.push({
        id: Math.random().toString(),
        sender: 'agent',
        type: 'thought',
        role: role,
        content: event.content,
        timestamp
      });
      this.render();
      this.scrollToBottom();
    } else if (event.type === 'ACTION') {
      this.currentStatusText = 'Executing ' + (event.source || 'tool');
      this.showSidePanel = true;
      const role = (event.metadata && (event.metadata as any)['role']) || 'CODER';
      this.messages.push({
        id: Math.random().toString(),
        sender: 'agent',
        type: 'action',
        role: role,
        title: event.source,
        content: event.content,
        timestamp
      });

      const actionContent = event.content.toLowerCase();
      const fileNameMeta = event.metadata ? (event.metadata as any)['fileName'] : '';
      if (fileNameMeta || actionContent.includes('writing to file:') || actionContent.includes('writefile')) {
        const targetFile = fileNameMeta || event.content.replace(/^Writing to file:\s*/i, '').trim();
        if (targetFile) {
          setTimeout(async () => {
            const res = await api.getFileContent(targetFile);
            if (res && res.content && res.content.trim().length > 0) {
              this.selectedFile = { name: targetFile, path: targetFile, isDirectory: false };
              this.fileContent = res.content;
              this.updateEditorContent();
              await this.bundleProjectToSrcDoc();
              this.updatePreviewIframe();
              // Stream code line-by-line in the main workspace
              this.enqueueWorkspaceStreaming(targetFile, res.content);
            }
          }, 30);
        }
      }
      this.loadFiles();
      this.render();
      this.scrollToBottom();
    } else if (event.type === 'TEST_REPORT') {
      const rawTests = (event.metadata && (event.metadata as any)['tests']) || [];
      const passed = (event.metadata && (event.metadata as any)['passed']) || rawTests.length;
      const total = (event.metadata && (event.metadata as any)['total']) || rawTests.length;
      this.activeSwarmRole = 'TESTER';
      this.messages.push({
        id: Math.random().toString(),
        sender: 'agent',
        type: 'test_report',
        role: 'TESTER',
        title: `QA Test Suite (${passed}/${total} Passed)`,
        content: event.content,
        testResults: rawTests,
        timestamp
      });
      this.render();
      this.scrollToBottom();
    } else if (event.type === 'SECURITY_AUDIT') {
      const audit = (event.metadata && (event.metadata as any)['audit']) || {};
      this.activeSwarmRole = 'SECURITY_REVIEWER';
      this.messages.push({
        id: Math.random().toString(),
        sender: 'agent',
        type: 'security_audit',
        role: 'SECURITY_REVIEWER',
        title: `Security Audit (Grade: ${audit.grade || 'A+'})`,
        content: event.content,
        timestamp
      });
      this.render();
      this.scrollToBottom();
    } else if (event.type === 'ANSWER') {
      this.isExecuting = false;
      this.currentStatusText = 'Ready';
      const alreadyHas = this.messages.some(m => m.type === 'answer' && m.content.trim() === event.content.trim());
      if (!alreadyHas) {
        this.messages.push({
          id: Math.random().toString(),
          sender: 'agent',
          type: 'answer',
          content: event.content,
          mode: 'ask',
          timestamp
        });
        this.render();
        this.scrollToBottom();
      }
    } else if (event.type === 'FINISH') {
      this.isExecuting = false;
      this.activeSwarmRole = 'COMPLETE';
      this.currentStatusText = 'Synthesis complete';
      this.progressPercent = 100;
      
      for (let i = this.messages.length - 1; i >= 0; i--) {
        const msg = this.messages[i];
        if (msg.type === 'plan' && msg.steps) {
          msg.steps.forEach(s => {
            s.completed = true;
            s.status = 'completed';
          });
          break;
        }
      }

      // Vanish the code stream card once finished
      if (!this.isProcessingStreamQueue && this.streamQueue.length === 0) {
        setTimeout(() => {
          this.isStreamingCode = false;
          this.displayedStreamingCode = '';
          this.streamingFileName = '';
          this.render();
          this.scrollToBottom();
        }, 1000);
      }

      this.messages.push({
        id: Math.random().toString(),
        sender: 'agent',
        type: 'system',
        content: `⚡ SYNTHESIS COMPLETE • All components compiled, verified, and deployed to your workspace.`,
        timestamp
      });

      this.loadFiles();
      if (!this.isStreamingCode) {
        setTimeout(() => this.switchToBrowser(), 500);
      }
      this.render();
      this.scrollToBottom();
    }
  }

  private async loadFiles() {
    this.fileList = await api.getFiles();
    if (!this.isStreamingCode) {
      if (!this.selectedFile && this.fileList.length > 0) {
        const defaultFile = this.fileList.find(f => f.name === 'index.html') || this.fileList[0];
        this.selectedFile = defaultFile;
        const res = await api.getFileContent(defaultFile.path);
        this.fileContent = res.content || '';
      } else if (this.selectedFile) {
        const res = await api.getFileContent(this.selectedFile.path);
        if (res && typeof res.content === 'string') {
          this.fileContent = res.content;
        }
      }
    }
    this.bundleProjectToSrcDoc();
    this.render();
  }

  private enqueueWorkspaceStreaming(fileName: string, content: string) {
    this.streamQueue.push({ fileName, content });
    this.processStreamQueue();
  }

  private processStreamQueue() {
    if (this.isProcessingStreamQueue || this.streamQueue.length === 0) return;
    this.isProcessingStreamQueue = true;
    const nextItem = this.streamQueue.shift()!;
    this.startWorkspaceCodeStreaming(nextItem.fileName, nextItem.content, () => {
      this.isProcessingStreamQueue = false;
      if (this.streamQueue.length > 0) {
        this.processStreamQueue();
      } else {
        // All queued files streamed! Vanish after a clean delay if synthesis completed
        if (!this.isExecuting) {
          setTimeout(() => {
            this.isStreamingCode = false;
            this.displayedStreamingCode = '';
            this.streamingFileName = '';
            this.progressPercent = 100;
            this.render();
            this.scrollToBottom();
          }, 1000);
        }
      }
    });
  }

  private startWorkspaceCodeStreaming(fileName: string, fullCode: string, onComplete?: () => void) {
    if (this.streamingIntervalId) {
      clearInterval(this.streamingIntervalId);
      this.streamingIntervalId = null;
    }

    this.isStreamingCode = true;
    this.streamingFileName = fileName;
    this.displayedStreamingCode = '';
    const lines = fullCode.split('\n');
    this.totalStreamingLines = lines.length;
    this.streamingLineNum = 0;

    // Mark current step in plan as active
    for (let i = this.messages.length - 1; i >= 0; i--) {
      const msg = this.messages[i];
      if (msg.type === 'plan' && msg.steps) {
        const step = msg.steps.find(s => s.file === fileName || s.label.toLowerCase().includes(fileName.toLowerCase()) || (fileName.endsWith('.html') && (s.label.toLowerCase().includes('nav') || s.label.toLowerCase().includes('html') || s.label.toLowerCase().includes('bar'))) || (fileName.endsWith('.css') && (s.label.toLowerCase().includes('theme') || s.label.toLowerCase().includes('style'))) || (fileName.endsWith('.js') && (s.label.toLowerCase().includes('gallery') || s.label.toLowerCase().includes('script') || s.label.toLowerCase().includes('toggle'))));
        if (step) {
          step.status = 'in_progress';
        }
        break;
      }
    }

    this.render();
    this.scrollToBottom();

    // Stream lines at rapid, animated intervals
    const chunkSize = Math.max(2, Math.floor(lines.length / 28));
    this.streamingIntervalId = setInterval(() => {
      this.streamingLineNum = Math.min(this.totalStreamingLines, this.streamingLineNum + chunkSize);
      this.displayedStreamingCode = lines.slice(0, this.streamingLineNum).join('\n');

      const codeEl = document.getElementById('streamCodeElement');
      const badgeEl = document.getElementById('streamLineCountBadge');
      const scrollBox = document.getElementById('streamCodeScrollBox');

      if (codeEl) codeEl.textContent = this.displayedStreamingCode;
      if (badgeEl) badgeEl.textContent = `Line ${this.streamingLineNum} of ${this.totalStreamingLines}`;
      if (scrollBox) scrollBox.scrollTop = scrollBox.scrollHeight;

      if (this.streamingLineNum >= this.totalStreamingLines) {
        clearInterval(this.streamingIntervalId);
        this.streamingIntervalId = null;

        // Mark corresponding step in plan as done
        for (let i = this.messages.length - 1; i >= 0; i--) {
          const msg = this.messages[i];
          if (msg.type === 'plan' && msg.steps) {
            const step = msg.steps.find(s => s.file === fileName || s.label.toLowerCase().includes(fileName.toLowerCase()) || (fileName.endsWith('.html') && (s.label.toLowerCase().includes('nav') || s.label.toLowerCase().includes('html') || s.label.toLowerCase().includes('bar'))) || (fileName.endsWith('.css') && (s.label.toLowerCase().includes('theme') || s.label.toLowerCase().includes('style'))) || (fileName.endsWith('.js') && (s.label.toLowerCase().includes('gallery') || s.label.toLowerCase().includes('script') || s.label.toLowerCase().includes('toggle'))));
            if (step) {
              step.completed = true;
              step.status = 'completed';
            }
            break;
          }
        }

        this.render();

        if (onComplete) onComplete();
      }
    }, 22);
  }

  private async bundleProjectToSrcDoc() {
    const htmlNode = (this.selectedFile && this.selectedFile.name.toLowerCase().endsWith('.html'))
      ? this.selectedFile
      : (this.fileList.find(f => f.name.toLowerCase() === 'index.html') || this.fileList.find(f => f.name.toLowerCase().endsWith('.html')));
    const cssNode = this.fileList.find(f => f.name.toLowerCase() === 'styles.css' || f.name.toLowerCase() === 'style.css');
    const jsNode = this.fileList.find(f => f.name.toLowerCase() === 'script.js' || f.name.toLowerCase() === 'app.js' || f.name.toLowerCase() === 'main.js');

    if (!htmlNode) {
      this.isAppReady = false;
      this.generatedSrcDoc = '';
      this.updatePreviewIframe();
      return;
    }

    try {
      const htmlRes = await api.getFileContent(htmlNode.path);
      const cssRes = cssNode ? await api.getFileContent(cssNode.path) : { content: '' };
      const jsRes = jsNode ? await api.getFileContent(jsNode.path) : { content: '' };

      let html = htmlRes.content || '';
      const css = cssRes.content || '';
      const js = jsRes.content || '';

      if (css && !html.includes(css)) {
        if (html.includes('</head>')) {
          html = html.replace('</head>', `<style>\n${css}\n</style></head>`);
        } else {
          html = `<style>\n${css}\n</style>\n` + html;
        }
      }
      if (js && !html.includes(js)) {
        if (html.includes('</body>')) {
          html = html.replace('</body>', `<script>\n${js}\n</script></body>`);
        } else {
          html = html + `\n<script>\n${js}\n</script>`;
        }
      }

      this.generatedSrcDoc = html;
      this.isAppReady = true;
      this.updatePreviewIframe();
    } catch (e) {
      console.error('Error bundling preview:', e);
    }
  }

  private switchToBrowser() {
    this.activeWorkspaceTab = 'browser';
    this.bundleProjectToSrcDoc();
    this.render();
  }

  private createPlanSteps(prompt: string): PlanStep[] {
    let cleanTitle = prompt.trim();
    if (cleanTitle.length > 35) cleanTitle = cleanTitle.substring(0, 35) + '...';

    const lower = prompt.toLowerCase();
    let topicName = cleanTitle;
    if (lower.includes("amazon")) topicName = "Amazon Storefront";
    else if (lower.includes("flipkart")) topicName = "Flipkart Storefront";
    else if (lower.includes("crypto")) topicName = "Crypto Trading Terminal";
    else if (lower.includes("kanban")) topicName = "Kanban Task Board";
    else if (lower.includes("synth")) topicName = "Audio Synth Sequencer";
    else if (lower.includes("chat")) topicName = "Real-Time Messenger";

    return [
      { id: '1', file: 'index.html', label: `Synthesize DOM Structure & Layout (${topicName})`, status: 'in_progress' },
      { id: '2', file: 'styles.css', label: `Compile Responsive UI & Theme System (${topicName})`, status: 'pending' },
      { id: '3', file: 'script.js', label: `Implement Interactive Core Logic & Engine (script.js)`, status: 'pending' },
      { id: '4', file: 'README.md', label: `Document System Architecture & Specifications (README.md)`, status: 'pending' }
    ];
  }

  public async executePlan(taskPrompt: string) {
    this.isExecuting = true;
    this.showSidePanel = true;
    this.activeWorkspaceTab = 'browser';
    this.currentStatusText = 'Autonomous Swarm synthesizing codebase...';

    // Find and update the plan steps
    for (let i = this.messages.length - 1; i >= 0; i--) {
      const msg = this.messages[i];
      if (msg.type === 'plan' && msg.steps && msg.steps.length > 0) {
        msg.steps[0].status = 'in_progress';
        break;
      }
    }

    api.runTask({
      prompt: `[EXECUTE] ${taskPrompt}`,
      mode: 'agent',
      systemInstruction: this.systemInstruction,
      temperature: this.temperature,
      model: this.selectedModelId,
      title: this.promptTitle
    });
    this.render();
    this.scrollToBottom();
  }

  public async submitTask() {
    const inputEl = document.getElementById('taskInput') as HTMLTextAreaElement;
    const prompt = (this.taskPrompt || inputEl?.value || '').trim();
    if (!prompt) return;

    const mode = this.aiMode;
    this.taskPrompt = '';
    if (inputEl) inputEl.value = '';

    this.messages.push({
      id: Math.random().toString(),
      sender: 'user',
      type: 'text',
      content: prompt,
      mode: this.aiMode,
      timestamp: new Date().toLocaleTimeString()
    });

    if (mode === 'ask') {
      this.isExecuting = true;
      this.currentStatusText = 'Thinking...';
      this.render();
      this.scrollToBottom();

      api.runTask({
        prompt,
        mode: 'ask',
        systemInstruction: this.systemInstruction,
        temperature: this.temperature,
        model: this.selectedModelId,
        title: this.promptTitle
      }).then(res => {
        if (res && res.response && res.response.trim().length > 0) {
          this.isExecuting = false;
          this.currentStatusText = 'Ready';
          const hasAnswer = this.messages.some(m => m.type === 'answer' && m.content.trim() === res.response.trim());
          if (!hasAnswer) {
            this.messages.push({
              id: Math.random().toString(),
              sender: 'agent',
              type: 'answer',
              content: res.response,
              mode: 'ask',
              timestamp: new Date().toLocaleTimeString()
            });
            this.render();
            this.scrollToBottom();
          }
        }
      }).catch(() => {
        this.isExecuting = false;
        this.currentStatusText = 'Ready';
        this.render();
      });
    } else {
      const planSteps = this.createPlanSteps(prompt);

      this.messages.push({
        id: Math.random().toString(),
        sender: 'agent',
        type: 'plan',
        title: 'Proposed Implementation Plan',
        planTitle: 'Proposed Implementation Plan',
        taskPrompt: prompt,
        mode: 'agent',
        content: `I have analyzed your request: "${prompt}". Review the checklist below and click **Start Process** to execute:`,
        steps: planSteps,
        timestamp: new Date().toLocaleTimeString()
      });

      // Auto-open side panel and trigger execution immediately
      this.showSidePanel = true;
      this.executePlan(prompt);
    }

    this.updateSessions(prompt);
    this.render();
    this.scrollToBottom();
  }

  private async stopExecution() {
    this.isExecuting = false;
    this.isStreamingCode = false;
    this.currentStatusText = 'Process stopped';
    if (this.streamingIntervalId) {
      clearInterval(this.streamingIntervalId);
      this.streamingIntervalId = null;
    }
    await api.stopTask();
    this.messages.push({
      id: Math.random().toString(),
      sender: 'system',
      type: 'text',
      mode: this.aiMode,
      content: '⏹ Execution stopped by user.',
      timestamp: new Date().toLocaleTimeString()
    });
    this.render();
    this.scrollToBottom();
  }

  private updateSessions(prompt: string) {
    if (!this.activeSession) {
      const newSession: AgentSessionItem = {
        id: Math.random().toString(),
        title: prompt.length > 28 ? prompt.substring(0, 28) + '...' : prompt,
        mode: this.aiMode,
        status: 'active',
        time: 'Just now',
        messages: this.messages
      };
      this.sessions.unshift(newSession);
      this.activeSession = newSession;
    } else {
      this.activeSession.title = prompt.length > 28 ? prompt.substring(0, 28) + '...' : prompt;
      this.activeSession.messages = this.messages;
    }
    this.saveSessionsToStorage();
  }

  private saveSessionsToStorage() {
    try {
      localStorage.setItem('agent_sessions_' + this.currentTenant, JSON.stringify(this.sessions));
    } catch {}
  }

  private loadSessionsFromStorage() {
    try {
      const raw = localStorage.getItem('agent_sessions_' + this.currentTenant);
      if (raw) {
        this.sessions = JSON.parse(raw);
        if (this.sessions.length > 0) {
          this.activeSession = this.sessions[0];
          this.messages = this.activeSession.messages || [];
        }
      }
    } catch {}
  }

  private scrollToBottom() {
    setTimeout(() => {
      const feed = document.getElementById('chatFeed');
      if (feed) feed.scrollTop = feed.scrollHeight;
    }, 50);
  }

  // --- HTML Rendering ---
  public render() {
    this.container.innerHTML = `
      <div class="h-screen w-screen flex bg-[#0e0e0f] text-[#e3e3e3] font-sans overflow-hidden text-[13px] select-none relative ${this.crtEnabled ? 'crt-bloom' : ''}">
        ${this.crtEnabled ? '<div class="crt-overlay"></div>' : ''}

        <!-- 1. LEFT SIDEBAR (Google AI Studio Navigation Rail) -->
        <aside class="w-[240px] flex flex-col bg-[#131314] border-r border-[rgba(255,255,255,0.08)] flex-shrink-0 justify-between z-20">
          <div class="flex flex-col h-full min-h-0">
            <!-- Studio Brand & Project Header -->
            <div class="px-4 py-3.5 flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] bg-[#131314]">
              <div class="flex items-center gap-2.5">
                <svg class="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24">
                  <defs>
                    <linearGradient id="gemGradSide" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#8ab4f8"/>
                      <stop offset="50%" stop-color="#c58af9"/>
                      <stop offset="100%" stop-color="#f28b82"/>
                    </linearGradient>
                  </defs>
                  <path fill="url(#gemGradSide)" d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z"/>
                </svg>
                <div class="flex flex-col">
                  <div class="flex items-center gap-1.5">
                    <span class="font-bold text-sm text-white tracking-tight">Spring AI</span>
                    <span class="text-[9px] font-bold px-1.5 py-0.2 bg-[#282a2c] text-[#8ab4f8] rounded-full border border-[rgba(255,255,255,0.1)] font-mono">DEV</span>
                  </div>
                  <span class="text-[10px] text-[#8e918f] font-mono">Autonomous Dev</span>
                </div>
              </div>
            </div>

            <!-- Create New Prompt Button (Google AI Studio Signature Pill) -->
            <div class="p-3">
              <button id="btnNewSession" class="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 bg-[#1e1f20] hover:bg-[#282a2c] text-white border border-[rgba(255,255,255,0.12)] hover:border-[#8ab4f8]/50 rounded-full transition-all text-xs font-semibold shadow-sm active:scale-95 cursor-pointer btn-action">
                <svg class="w-4 h-4 text-[#8ab4f8]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
                <span>+ Create New Prompt</span>
              </button>
            </div>

            <!-- Navigation Links -->
            <nav class="px-2.5 space-y-1 text-xs font-medium text-[#c4c7c5]">
              <div class="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#1e1f20] text-white font-semibold border border-[rgba(255,255,255,0.08)]">
                <svg class="w-4 h-4 text-[#8ab4f8]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z"/></svg>
                <span>Autonomous Studio</span>
              </div>
              <button id="btnOpenFolder" class="w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-[#c4c7c5] hover:bg-[#1e1f20] hover:text-white transition-colors cursor-pointer text-xs btn-action">
                <div class="flex items-center gap-2.5 truncate">
                  <svg class="w-4 h-4 text-[#8e918f]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>
                  <span class="truncate">Destination Folder...</span>
                </div>
              </button>
            </nav>

            <!-- Active Directory Path Badge & Quick Select -->
            <div class="px-3 pt-2">
              <div class="p-2.5 bg-[#1e1f20] border border-[rgba(255,255,255,0.08)] rounded-xl flex flex-col gap-2 text-xs font-mono">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] text-[#8e918f] uppercase font-bold tracking-wider">Save Destination</span>
                  <button id="btnChangeFolderQuick" class="text-[10px] text-[#8ab4f8] hover:underline font-bold cursor-pointer">Change...</button>
                </div>
                <div class="p-1.5 bg-[#131314] border border-[rgba(255,255,255,0.08)] rounded-lg flex items-center gap-1.5 text-white truncate" title="${this.escapeHtml(this.currentWorkspacePath)}">
                  <span class="text-[#8ab4f8] flex-shrink-0">📁</span>
                  <span class="truncate font-semibold text-[11px]">${this.currentWorkspacePath}</span>
                </div>
                <button id="btnOpenInExplorerSidebar" class="w-full flex items-center justify-center gap-1.5 px-2 py-1 bg-[#282a2c] hover:bg-[#3f3f46] hover:text-[#8ab4f8] text-[#c4c7c5] border border-[rgba(255,255,255,0.08)] rounded-lg transition text-[10px] font-mono font-bold cursor-pointer btn-action">
                  <span>📂 Open in File Explorer</span>
                </button>
              </div>
            </div>

            <!-- Sessions History -->
            <div class="mt-3 px-2 flex-1 flex flex-col min-h-0">
              <div class="px-3 flex items-center justify-between text-[10px] font-bold text-[#8e918f] uppercase tracking-wider pb-1">
                <span>Recent Prompts</span>
                <span class="font-mono text-[#8ab4f8]">${this.sessions.length}</span>
              </div>
              <div class="mt-1 space-y-1 overflow-y-auto flex-1 custom-scrollbar pr-1">
                ${this.sessions.map(s => `
                  <div class="session-item group px-2.5 py-2 rounded-xl cursor-pointer transition-all flex items-center justify-between ${this.activeSession?.id === s.id ? 'bg-[#1e1f20] text-white font-semibold border-l-2 border-[#8ab4f8] pl-2' : 'text-[#c4c7c5] hover:bg-[#1e1f20] hover:text-white'}" data-id="${s.id}">
                    <div class="flex flex-col min-w-0 pr-1.5 flex-1">
                      <span class="text-xs truncate">${s.title}</span>
                      <span class="text-[10px] text-[#8e918f] font-mono">${s.time} • ${s.mode === 'ask' ? 'Chat' : 'Agent'}</span>
                    </div>
                    <div class="flex items-center gap-1.5 flex-shrink-0">
                      <button class="btn-delete-session opacity-0 group-hover:opacity-100 p-1 hover:bg-[#282a2c] hover:text-red-400 text-[#8e918f] rounded transition cursor-pointer text-[11px] font-bold" data-id="${s.id}" title="Delete prompt">
                        ✕
                      </button>
                      <span class="w-1.5 h-1.5 rounded-full ${s.status === 'active' ? 'bg-[#8ab4f8] animate-pulse' : 'bg-[#3f3f46]'}"></span>
                    </div>
                  </div>
                `).join('')}
                ${this.sessions.length === 0 ? '<div class="p-4 text-center text-[#8e918f] text-xs font-mono">No past prompts.</div>' : ''}
              </div>
            </div>
          </div>

          <!-- Bottom User & Engine Status (Google AI Studio Bottom Rail) -->
          <div class="p-3 border-t border-[rgba(255,255,255,0.08)] flex items-center justify-between text-xs text-[#c4c7c5] bg-[#131314] hover:bg-[#1e1f20] transition cursor-pointer group" id="btnOpenUserAccountModal" title="Click to manage GitHub Account & Login">
            <div class="flex items-center gap-2 truncate">
              <div class="w-6 h-6 rounded-full overflow-hidden border border-[rgba(255,255,255,0.15)] flex-shrink-0 group-hover:border-[#8ab4f8] transition">
                <img src="${this.userProfile.avatar_url || 'https://avatars.githubusercontent.com/u/9919?v=4'}" alt="Avatar" class="w-full h-full object-cover">
              </div>
              <span class="text-[11px] font-medium text-white truncate group-hover:text-[#8ab4f8] transition">${this.userProfile.login}</span>
            </div>
            <span class="text-[10px] font-mono text-[#81c995] bg-[#81c995]/10 px-1.5 py-0.5 rounded border border-[#81c995]/30 flex items-center gap-1">
              <svg class="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              <span>GitHub</span>
            </span>
          </div>
        </aside>

        <!-- GitHub Login & Account Manager Modal -->
        ${this.showGitHubLoginModal ? `
          <div class="modal-overlay active" style="z-index: 9999; display: flex;">
            <div class="p-6 bg-[#131314] border border-[rgba(255,255,255,0.15)] rounded-2xl max-w-lg w-full shadow-2xl space-y-5 animate-fadeIn">
              
              <!-- Modal Header -->
              <div class="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] pb-3.5">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-xl bg-[#24292f] border border-[rgba(255,255,255,0.15)] flex items-center justify-center text-white shadow-md">
                    <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                  </div>
                  <div>
                    <h3 class="font-bold text-white text-base">GitHub Authentication</h3>
                    <p class="text-[11px] text-[#8e918f]">Connect repositories, Git sync, and user profile</p>
                  </div>
                </div>
                <button id="btnCloseGitHubModal" class="p-1 rounded-lg hover:bg-[#1e1f20] text-[#8e918f] hover:text-white cursor-pointer font-bold">✕</button>
              </div>

              <!-- Current Active User Card -->
              <div class="p-4 bg-[#1e1f20] border border-[rgba(255,255,255,0.08)] rounded-xl flex items-center justify-between gap-3">
                <div class="flex items-center gap-3 min-w-0">
                  <div class="w-12 h-12 rounded-full overflow-hidden border-2 border-[#8ab4f8] shadow-md flex-shrink-0">
                    <img src="${this.userProfile.avatar_url || 'https://avatars.githubusercontent.com/u/9919?v=4'}" alt="Avatar" class="w-full h-full object-cover">
                  </div>
                  <div class="min-w-0">
                    <div class="flex items-center gap-2">
                      <span class="font-bold text-white text-sm truncate">${this.userProfile.name || this.userProfile.login}</span>
                      <span class="text-[10px] bg-[#81c995]/15 text-[#81c995] border border-[#81c995]/30 px-2 py-0.5 rounded-full font-mono font-semibold">Active</span>
                    </div>
                    <span class="text-xs text-[#8ab4f8] font-mono">@${this.userProfile.login}</span>
                    <div class="text-[11px] text-[#8e918f] mt-0.5 truncate">${this.userProfile.organization || 'GitHub Workspace'}</div>
                  </div>
                </div>
                <a href="${this.userProfile.html_url || 'https://github.com/' + this.userProfile.login}" target="_blank" class="px-3 py-1.5 bg-[#131314] hover:bg-[#282a2c] text-[#c4c7c5] hover:text-white border border-[rgba(255,255,255,0.1)] rounded-lg text-xs font-mono transition flex items-center gap-1.5 flex-shrink-0">
                  <span>Profile</span>
                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                </a>
              </div>

              <!-- Error Banner if any -->
              ${this.gitHubLoginError ? `
                <div class="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-center gap-2">
                  <svg class="w-4 h-4 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                  <span>${this.escapeHtml(this.gitHubLoginError)}</span>
                </div>
              ` : ''}

              <!-- Section 1: Sign in with GitHub Username / PAT -->
              <div class="space-y-3 pt-1">
                <div class="flex items-center justify-between">
                  <label class="text-xs font-semibold text-white uppercase tracking-wider font-mono">1. Instant Sign In via Username or Token</label>
                  <span class="text-[10px] text-[#8e918f]">Live GitHub API</span>
                </div>

                <div class="space-y-2">
                  <div>
                    <input type="text" id="inputGitHubUsername" placeholder="GitHub Username (e.g. Pranav1921 or your username)" value="${this.escapeHtml(this.userProfile.login)}" class="w-full bg-[#1e1f20] border border-[rgba(255,255,255,0.1)] focus:border-[#8ab4f8] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-mono" />
                  </div>
                  <div>
                    <input type="password" id="inputGitHubToken" placeholder="GitHub Personal Access Token (PAT) (Optional for private repos)" class="w-full bg-[#1e1f20] border border-[rgba(255,255,255,0.1)] focus:border-[#8ab4f8] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-mono" />
                  </div>
                </div>

                <button id="btnSubmitGitHubLogin" class="w-full py-2.5 bg-[#24292f] hover:bg-[#32383f] text-white border border-[rgba(255,255,255,0.2)] rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50" ${this.isLoggingInGitHub ? 'disabled' : ''}>
                  ${this.isLoggingInGitHub ? `
                    <span class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Connecting to GitHub...</span>
                  ` : `
                    <svg class="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                    <span>Sign In / Switch GitHub Account</span>
                  `}
                </button>
              </div>

              <!-- Section 2: Create Remote Repository & Push -->
              <div class="p-4 bg-[#18191a] border border-[#8ab4f8]/30 rounded-xl space-y-3">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-[#8ab4f8] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
                    <span class="text-xs font-bold text-white uppercase tracking-wider font-mono">Create GitHub Repo & Push</span>
                  </div>
                  <span class="text-[10px] text-[#8ab4f8] bg-[#8ab4f8]/10 px-2 py-0.5 rounded border border-[#8ab4f8]/30 font-mono">Git Push</span>
                </div>

                <p class="text-[11px] text-[#8e918f]">Create a brand new repository on your GitHub account and push all generated project files (<code>index.html</code>, <code>styles.css</code>, <code>script.js</code>):</p>

                <div class="space-y-2">
                  <div class="flex items-center gap-2">
                    <div class="flex-1">
                      <label class="text-[10px] text-[#8e918f] font-mono block mb-1">Repository Name</label>
                      <input type="text" id="inputNewRepoName" placeholder="e.g. spring-ai-autonomous-dev" value="${this.escapeHtml(this.promptTitle.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'spring-ai-autonomous-dev')}" class="w-full bg-[#131314] border border-[rgba(255,255,255,0.12)] focus:border-[#8ab4f8] rounded-xl px-3 py-2 text-xs text-white outline-none font-mono" />
                    </div>
                    <div class="w-28">
                      <label class="text-[10px] text-[#8e918f] font-mono block mb-1">Visibility</label>
                      <select id="selectRepoVisibility" class="w-full bg-[#131314] border border-[rgba(255,255,255,0.12)] rounded-xl px-2.5 py-2 text-xs text-white outline-none font-mono cursor-pointer">
                        <option value="public" selected>Public</option>
                        <option value="private">Private</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label class="text-[10px] text-[#8e918f] font-mono block mb-1">Description (Optional)</label>
                    <input type="text" id="inputNewRepoDesc" placeholder="Full stack web app created autonomously with Spring AI Autonomous Dev" class="w-full bg-[#131314] border border-[rgba(255,255,255,0.12)] focus:border-[#8ab4f8] rounded-xl px-3 py-2 text-xs text-white outline-none font-mono" />
                  </div>
                </div>

                <button id="btnCreateAndPushRepo" class="w-full py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50" ${this.isCreatingRepo ? 'disabled' : ''}>
                  ${this.isCreatingRepo ? `
                    <span class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Creating & Pushing to GitHub...</span>
                  ` : `
                    <svg class="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                    <span>Create Repository & Push Code</span>
                  `}
                </button>

                <!-- Create Repo Result Banner -->
                ${this.createRepoResult ? `
                  <div class="p-3 ${this.createRepoResult.success ? 'bg-[#81c995]/10 border border-[#81c995]/30 text-[#81c995]' : 'bg-red-500/10 border border-red-500/30 text-red-300'} rounded-xl text-xs space-y-1.5 animate-fadeIn">
                    <div class="flex items-center gap-2 font-bold">
                      ${this.createRepoResult.success 
                        ? '<svg class="w-4 h-4 text-[#81c995] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>' 
                        : '<svg class="w-4 h-4 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>'}
                      <span>${this.escapeHtml(this.createRepoResult.message)}</span>
                    </div>
                    ${this.createRepoResult.htmlUrl ? `
                      <div class="pt-1">
                        <a href="${this.createRepoResult.htmlUrl}" target="_blank" class="inline-flex items-center gap-1.5 text-white underline hover:text-[#8ab4f8] font-mono font-semibold">
                          <span>Open ${this.createRepoResult.htmlUrl} ↗</span>
                        </a>
                      </div>
                    ` : ''}
                  </div>
                ` : ''}
              </div>

              <!-- Section 3: OAuth2 Login Flow -->
              <div class="pt-3 border-t border-[rgba(255,255,255,0.08)] space-y-2">
                <div class="flex items-center justify-between">
                  <label class="text-xs font-semibold text-[#8e918f] uppercase tracking-wider font-mono">2. Spring Security OAuth2 SSO</label>
                  <span class="text-[10px] text-[#8ab4f8] font-mono">OAuth2 Redirect</span>
                </div>
                <a href="http://localhost:8080/oauth2/authorization/github" class="w-full py-2 bg-[#1e1f20] hover:bg-[#282a2c] text-[#c4c7c5] hover:text-white border border-[rgba(255,255,255,0.1)] rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2 cursor-pointer">
                  <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                  <span>Authorize with GitHub OAuth2</span>
                </a>
              </div>

              <!-- Sign Out / Reset Button -->
              <div class="pt-2 flex items-center justify-between border-t border-[rgba(255,255,255,0.08)]">
                <button id="btnSignOutGitHub" class="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-xs font-semibold transition cursor-pointer">
                  Sign Out
                </button>
                <button id="btnCloseGitHubModalFooter" class="px-4 py-1.5 bg-[#1e1f20] hover:bg-[#282a2c] text-white rounded-lg text-xs font-semibold transition cursor-pointer">
                  Done
                </button>
              </div>

            </div>
          </div>
        ` : ''}

        <!-- Folder Selection Modal (Interactive Directory Selector) -->
        ${this.showFolderModal ? `
          <div class="modal-overlay active" style="z-index: 9999; display: flex;">
            <div class="p-6 bg-[#111113] border border-[#27272a] rounded-2xl max-w-lg w-full shadow-2xl space-y-4">
              <div class="flex items-center justify-between border-b border-[#27272a] pb-3">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-xl bg-[#18181b] border border-[#00ff88]/40 flex items-center justify-center text-[#00ff88] shadow-md">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>
                  </div>
                  <div>
                    <h3 class="font-bold text-white text-sm">Select Code Destination Folder</h3>
                    <p class="text-[11px] text-[#a1a1aa]">Choose where generated files will be written</p>
                  </div>
                </div>
                <button id="btnCloseFolderModal" class="p-1 rounded-lg hover:bg-[#18181b] text-[#a1a1aa] hover:text-white cursor-pointer font-bold">✕</button>
              </div>

              <!-- 1. Native Windows Folder Picker -->
              <div>
                <input type="file" id="inputNativeDirPicker" webkitdirectory directory class="hidden" />
                <button id="btnBrowseNativeDir" class="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#18181b] hover:bg-[#27272a] text-[#00ff88] border border-[#00ff88]/50 hover:border-[#00ff88] rounded-xl text-xs font-bold transition shadow-lg cursor-pointer">
                  <svg class="w-4 h-4 text-[#00ff88]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"/></svg>
                  <span>Browse Folder on This PC...</span>
                </button>
              </div>

              <!-- 2. Common Preset Folders -->
              <div class="space-y-1.5">
                <label class="text-[10px] text-[#71717a] font-mono uppercase font-bold">Quick Presets</label>
                <div class="grid grid-cols-2 gap-2">
                  <button class="btn-preset-folder p-2 bg-black hover:bg-[#18181b] border border-[#27272a] hover:border-[#00ff88] rounded-xl flex items-center gap-2 text-left text-xs text-white transition cursor-pointer" data-path="${this.commonFolders['projectWorkspace'] || 'workspace'}">
                    <svg class="w-4 h-4 text-[#00ff88] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>
                    <div class="min-w-0 flex-1 truncate">
                      <div class="font-bold truncate text-[11px]">Project Workspace</div>
                      <div class="text-[10px] text-[#71717a] truncate">./workspace</div>
                    </div>
                  </button>
                  <button class="btn-preset-folder p-2 bg-black hover:bg-[#18181b] border border-[#27272a] hover:border-[#00ff88] rounded-xl flex items-center gap-2 text-left text-xs text-white transition cursor-pointer" data-path="${this.commonFolders['desktop'] || 'C:/Users/prana/Desktop'}">
                    <svg class="w-4 h-4 text-cyan-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                    <div class="min-w-0 flex-1 truncate">
                      <div class="font-bold truncate text-[11px]">Desktop</div>
                      <div class="text-[10px] text-[#71717a] truncate">Desktop folder</div>
                    </div>
                  </button>
                  <button class="btn-preset-folder p-2 bg-black hover:bg-[#18181b] border border-[#27272a] hover:border-[#00ff88] rounded-xl flex items-center gap-2 text-left text-xs text-white transition cursor-pointer" data-path="${this.commonFolders['downloads'] || 'C:/Users/prana/Downloads'}">
                    <svg class="w-4 h-4 text-yellow-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                    <div class="min-w-0 flex-1 truncate">
                      <div class="font-bold truncate text-[11px]">Downloads</div>
                      <div class="text-[10px] text-[#71717a] truncate">Downloads folder</div>
                    </div>
                  </button>
                  <button class="btn-preset-folder p-2 bg-black hover:bg-[#18181b] border border-[#27272a] hover:border-[#00ff88] rounded-xl flex items-center gap-2 text-left text-xs text-white transition cursor-pointer" data-path="${this.commonFolders['documents'] || 'C:/Users/prana/Documents'}">
                    <svg class="w-4 h-4 text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                    <div class="min-w-0 flex-1 truncate">
                      <div class="font-bold truncate text-[11px]">Documents</div>
                      <div class="text-[10px] text-[#71717a] truncate">Documents folder</div>
                    </div>
                  </button>
                </div>
              </div>

              <!-- 3. Manual Path Input -->
              <div class="space-y-1.5 font-mono">
                <label class="text-[10px] text-[#71717a] uppercase font-bold">Or Enter Custom Folder Path:</label>
                <input type="text" id="inputFolderModal" value="${this.escapeHtml(this.currentWorkspacePath)}" placeholder="e.g. C:/Projects/my-app" class="w-full bg-black border border-[#27272a] focus:border-[#00ff88] text-white px-3.5 py-2.5 rounded-xl text-xs outline-none shadow-inner" />
              </div>

              <!-- Modal Footer -->
              <div class="flex items-center justify-between gap-2 pt-2 border-t border-[#27272a]">
                <button id="btnOpenInExplorerModal" class="px-3 py-1.5 bg-[#18181b] hover:bg-[#27272a] text-[#00ff88] text-xs font-bold rounded-xl border border-[#27272a] transition cursor-pointer flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"/></svg>
                  <span>Reveal in OS</span>
                </button>
                <div class="flex gap-2">
                  <button id="btnCancelFolderModal" class="px-3.5 py-1.5 bg-[#18181b] hover:bg-[#27272a] text-white text-xs font-bold rounded-xl transition cursor-pointer">Cancel</button>
                  <button id="btnConfirmFolderModal" class="px-4 py-1.5 bg-white hover:bg-[#00ff88] text-black text-xs font-extrabold rounded-xl transition cursor-pointer shadow-lg">Save &amp; Apply Folder</button>
                </div>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- 2. CENTER CHAT & WORKSPACE PANE (Google AI Studio Canvas) -->
        <section class="flex-1 min-w-0 flex flex-col bg-[#0e0e0f] overflow-hidden relative">
          <!-- Top Header (Google AI Studio Style - Adaptive Symbol/Text Mode) -->
          <div class="h-14 px-2.5 sm:px-4 border-b border-[rgba(255,255,255,0.08)] bg-[#131314] flex items-center justify-between flex-shrink-0 z-10 gap-2 overflow-x-hidden">
            <div class="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-shrink">
              <div class="flex items-center gap-1.5 flex-shrink-0">
                <svg class="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                  <defs>
                    <linearGradient id="gemGradCenter" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#8ab4f8"/>
                      <stop offset="50%" stop-color="#c58af9"/>
                      <stop offset="100%" stop-color="#f28b82"/>
                    </linearGradient>
                  </defs>
                  <path fill="url(#gemGradCenter)" d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z"/>
                </svg>
                <div class="flex items-center gap-1 cursor-pointer hover:bg-[#1e1f20] px-1.5 py-1 rounded-lg transition min-w-0" id="btnEditPromptTitle" title="Rename prompt">
                  <span class="font-bold text-white text-xs sm:text-sm tracking-tight font-sans truncate ${this.showSidePanel ? 'max-w-[80px] sm:max-w-[110px]' : 'max-w-[120px] sm:max-w-[180px]'}" id="promptTitleText">
                    ${this.promptTitle}
                  </span>
                  <svg class="w-3 h-3 text-[#8e918f] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                </div>
              </div>

              <!-- Clickable Header Folder Chip (Adaptive: Icon Only when preview opens) -->
              <button id="btnHeaderChangeFolder" class="flex items-center gap-1 px-2 py-1 bg-[#1e1f20] hover:bg-[#282a2c] border border-[rgba(255,255,255,0.1)] hover:border-[#8ab4f8] rounded-full text-xs font-mono text-[#c4c7c5] transition cursor-pointer flex-shrink-0" title="Target Directory: ${this.escapeHtml(this.currentWorkspacePath)} (Click to change)">
                <svg class="w-3.5 h-3.5 text-[#8ab4f8] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>
                ${this.showSidePanel ? '' : `
                  <span class="text-white font-semibold max-w-[85px] truncate">${this.getFolderDisplayBasename()}</span>
                  <svg class="w-2.5 h-2.5 text-[#8e918f] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                `}
              </button>

              <!-- Compact Model Chip with SVG Symbol (Hidden when preview is open) -->
              ${!this.showSidePanel ? `
                <div class="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1e1f20] border border-[rgba(255,255,255,0.08)] text-[11px] text-[#8e918f] font-mono flex-shrink-0" title="Model: deepseek-coder:6.7b">
                  <svg class="w-3.5 h-3.5 text-[#8ab4f8] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="4" y="4" width="16" height="16" rx="2" stroke-width="2"></rect><rect x="9" y="9" width="6" height="6" stroke-width="2"></rect><path stroke-linecap="round" stroke-width="2" d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 15h3M1 9h3M1 15h3"></path></svg>
                  <span class="w-1.5 h-1.5 rounded-full ${this.isExecuting ? 'bg-[#8ab4f8] animate-ping' : 'bg-[#81c995]'}"></span>
                  <span class="text-white font-medium max-w-[85px] truncate">${this.isExecuting ? this.currentStatusText : 'deepseek'}</span>
                </div>
              ` : ''}
            </div>

            <!-- Right Header Actions (Symbol-Only when Preview is Open) -->
            <div class="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
              <!-- Get Code Button -->
              <button id="btnOpenGetCodeModal" class="flex items-center justify-center ${this.showSidePanel ? 'w-8 h-8 p-0' : 'gap-1.5 px-2.5 sm:px-3 py-1.5'} bg-[#1e1f20] hover:bg-[#282a2c] text-[#c4c7c5] hover:text-white border border-[rgba(255,255,255,0.1)] rounded-full text-xs font-medium transition cursor-pointer flex-shrink-0" title="Get API Code in Python, cURL, JS, Java">
                <svg class="w-3.5 h-3.5 text-[#8ab4f8] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
                ${this.showSidePanel ? '' : '<span class="hidden md:inline">Get code</span>'}
              </button>

              <!-- Share Button -->
              <button id="btnSharePrompt" class="flex items-center justify-center ${this.showSidePanel ? 'w-8 h-8 p-0' : 'hidden xl:flex gap-1.5 px-2.5 sm:px-3 py-1.5'} bg-[#1e1f20] hover:bg-[#282a2c] text-[#c4c7c5] hover:text-white border border-[rgba(255,255,255,0.1)] rounded-full text-xs font-medium transition cursor-pointer flex-shrink-0" title="Share prompt snapshot">
                <svg class="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                ${this.showSidePanel ? '' : '<span>Share</span>'}
              </button>

              <!-- System Instructions Toggle -->
              <button id="btnToggleSystemInstruction" class="flex items-center justify-center ${this.showSidePanel ? 'w-8 h-8 p-0' : 'hidden lg:flex gap-1.5 px-2.5 sm:px-3 py-1.5'} bg-[#1e1f20] hover:bg-[#282a2c] text-[#c4c7c5] hover:text-white border border-[rgba(255,255,255,0.1)] rounded-full text-xs font-medium transition cursor-pointer flex-shrink-0" title="System Instructions">
                <svg class="w-3.5 h-3.5 text-[#8ab4f8] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                ${this.showSidePanel ? '' : `
                  <span class="hidden 2xl:inline">System Prompt</span>
                  <svg class="w-3 h-3 transition-transform ${this.systemInstructionOpen ? 'rotate-180' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                `}
              </button>

              <!-- Toggle Side Panel (Preview / Settings) -->
              <button id="btnToggleSidePanel" class="flex items-center justify-center ${this.showSidePanel ? 'w-8 h-8 p-0 bg-[#1e1f20] text-[#8ab4f8] border border-[#8ab4f8]/40' : 'px-2.5 sm:px-3 py-1.5 bg-[#1e1f20] text-[#c4c7c5] border border-[rgba(255,255,255,0.1)] hover:text-white'} rounded-full text-xs font-bold transition cursor-pointer flex-shrink-0" title="Toggle Preview & Run Settings">
                <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                ${this.showSidePanel ? '' : '<span class="hidden md:inline">Settings</span>'}
              </button>

              <!-- Mode Switcher (Google AI Studio Pills - Compact in preview mode) -->
              <div class="bg-[#1e1f20] border border-[rgba(255,255,255,0.1)] rounded-full p-0.5 flex items-center flex-shrink-0">
                <button id="btnModeAgent" class="${this.showSidePanel ? 'w-7 h-7 flex items-center justify-center' : 'px-2.5 sm:px-3 py-1 flex items-center gap-1.5'} rounded-full transition-all text-xs cursor-pointer ${this.aiMode === 'agent' ? 'gemini-gradient-bg text-white font-bold shadow-md' : 'text-[#c4c7c5] hover:text-white'}" title="Autonomous Agent Mode">
                  <svg class="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                  ${this.showSidePanel ? '' : '<span>Agent</span>'}
                </button>
                <button id="btnModeAsk" class="${this.showSidePanel ? 'w-7 h-7 flex items-center justify-center' : 'px-2.5 sm:px-3 py-1 flex items-center gap-1.5'} rounded-full transition-all text-xs cursor-pointer ${this.aiMode === 'ask' ? 'bg-[#282a2c] text-white font-bold shadow-md' : 'text-[#c4c7c5] hover:text-white'}" title="Direct Ask Mode">
                  <svg class="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                  ${this.showSidePanel ? '' : '<span>Ask</span>'}
                </button>
              </div>

              <!-- GitHub Profile / Login Button in Top Header -->
              <button id="btnHeaderGitHubLogin" class="flex items-center justify-center ${this.showSidePanel ? 'w-8 h-8 p-0' : 'gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5'} bg-[#1e1f20] hover:bg-[#282a2c] text-[#e3e3e3] hover:text-white border border-[rgba(255,255,255,0.1)] rounded-full text-xs font-medium transition cursor-pointer shadow-sm group flex-shrink-0" title="GitHub Account: ${this.escapeHtml(this.userProfile.login)}">
                <div class="w-4 h-4 rounded-full overflow-hidden flex-shrink-0 border border-[rgba(255,255,255,0.2)]">
                  <img src="${this.userProfile.avatar_url || 'https://avatars.githubusercontent.com/u/9919?v=4'}" class="w-full h-full object-cover">
                </div>
                ${this.showSidePanel ? '' : `
                  <span class="max-w-[75px] sm:max-w-[100px] truncate font-mono text-[11px]">${this.userProfile.login}</span>
                  <span class="w-1.5 h-1.5 rounded-full bg-[#81c995] flex-shrink-0"></span>
                `}
              </button>

              <!-- Blue Top Run Button -->
              <button id="btnHeaderRun" class="flex items-center justify-center ${this.showSidePanel ? 'w-8 h-8 p-0' : 'gap-1.5 px-3.5 sm:px-4 py-1.5'} bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-full text-xs font-bold transition cursor-pointer btn-action shadow-md flex-shrink-0" title="Run (Ctrl+Enter)">
                <svg class="w-3 h-3 fill-white flex-shrink-0" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                ${this.showSidePanel ? '' : '<span>Run</span>'}
              </button>
            </div>
          </div>

          <!-- Chat Feed & Workspace Content -->
          <div id="chatFeed" class="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar flex flex-col items-center">
            <div class="max-w-4xl xl:max-w-5xl 2xl:max-w-6xl w-full space-y-4">
              
              <!-- System Instructions Accordion Drawer (Google AI Studio Signature Feature) -->
              ${this.systemInstructionOpen ? `
                <div class="w-full p-4 bg-[#1e1f20] border border-[rgba(255,255,255,0.12)] rounded-2xl shadow-xl space-y-2 animate-fadeIn">
                  <div class="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] pb-2">
                    <div class="flex items-center gap-2">
                      <span class="text-xs font-bold text-white uppercase tracking-wider font-mono">System Instructions</span>
                      <span class="text-[10px] text-[#8ab4f8] bg-[#8ab4f8]/10 px-2 py-0.5 rounded-full border border-[#8ab4f8]/30">Model Persona</span>
                    </div>
                    <button id="btnCloseSystemInstruction" class="text-xs text-[#8e918f] hover:text-white cursor-pointer font-mono">Close ✕</button>
                  </div>
                  <p class="text-[11px] text-[#8e918f]">Configure behavior and role guidelines given to the autonomous engineer model:</p>
                  <textarea id="systemInstructionText" rows="2" class="w-full bg-[#131314] border border-[rgba(255,255,255,0.1)] focus:border-[#8ab4f8] rounded-xl p-2.5 text-xs text-[#e3e3e3] font-mono outline-none resize-none">${this.escapeHtml(this.systemInstruction)}</textarea>
                </div>
              ` : ''}

              <!-- Multi-Agent Swarm Status Strip -->
              <div class="w-full bg-[#131314] border border-[rgba(255,255,255,0.08)] rounded-2xl px-4 py-2.5 flex items-center justify-between gap-2 shadow-md">
                <div class="flex items-center gap-2 flex-shrink-0">
                  <span class="w-2.5 h-2.5 rounded-full ${this.isExecuting ? 'bg-[#81c995] animate-ping' : 'bg-[#81c995]'}"></span>
                  <span class="font-mono text-xs font-bold text-white uppercase hidden sm:inline">Swarm</span>
                </div>

                <div class="flex items-center gap-2 flex-1 justify-center overflow-x-auto custom-scrollbar px-1 min-w-0">
                  <button class="btn-filter-role px-3 py-1 rounded-full text-xs font-mono transition cursor-pointer flex-shrink-0 btn-action ${this.filterSwarmRole === 'ALL' ? 'bg-[#282a2c] text-white font-bold border border-[rgba(255,255,255,0.2)]' : 'bg-[#1e1f20] text-[#8e918f] hover:text-white border border-[rgba(255,255,255,0.08)]'}" data-role="ALL">
                    All
                  </button>
                  ${this.agentSwarmRoles.map(r => `
                    <button class="btn-filter-role px-3 py-1 rounded-full border text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer flex-shrink-0 btn-action ${this.activeSwarmRole === r.id ? 'bg-[#1e1f20] border-[#8ab4f8] text-[#8ab4f8] font-bold shadow-[0_0_8px_rgba(138,180,248,0.25)]' : (this.filterSwarmRole === r.id ? 'bg-white text-black border-white font-bold' : 'bg-[#1e1f20] border-[rgba(255,255,255,0.08)] text-[#8e918f] hover:text-white')}" data-role="${r.id}">
                      <span class="w-1.5 h-1.5 rounded-full ${this.activeSwarmRole === r.id ? 'bg-[#8ab4f8] animate-pulse' : 'bg-[#52525b]'}"></span>
                      <span>${r.name}</span>
                    </button>
                  `).join('')}
                </div>

                <div class="flex items-center gap-1.5 flex-shrink-0">
                  <span class="text-xs font-mono text-[#8e918f] truncate max-w-[140px]">
                    ${this.isExecuting ? (this.activeSwarmRole !== 'IDLE' ? this.activeSwarmRole : 'Active') : '5 Agents Ready'}
                  </span>
                </div>
              </div>

              <!-- Messages Feed -->
              <div id="messagesList" class="space-y-3.5">
                ${this.renderMessages()}
              </div>
            </div>
          </div>

          <!-- 3. PROMPT TYPING DOCK (Google AI Studio Signature Input) -->
          <div class="p-3 sm:p-5 border-t border-[rgba(255,255,255,0.08)] bg-[#131314] flex justify-center flex-shrink-0 z-20">
            <div class="max-w-4xl xl:max-w-5xl 2xl:max-w-6xl w-full">
              <div class="w-full bg-[#1e1f20] border border-[rgba(255,255,255,0.12)] hover:border-[rgba(255,255,255,0.25)] focus-within:border-[#8ab4f8] focus-within:shadow-[0_0_20px_rgba(138,180,248,0.2)] rounded-3xl p-3.5 sm:p-4 flex flex-col gap-2.5 transition-all shadow-2xl">
                
                <textarea id="taskInput" rows="3" ${this.isExecuting ? 'disabled' : ''} placeholder="${this.isExecuting ? 'Agent is synthesizing code... Click Stop to cancel.' : (this.aiMode === 'ask' ? 'Ask any architectural, coding, algorithmic, or system design question...' : 'Describe what you want Spring AI Agent to build in your workspace (e.g. full-stack web app, interactive dashboard, tools)...')}" class="w-full bg-transparent text-sm text-[#e3e3e3] placeholder-[#8e918f] outline-none resize-none custom-scrollbar font-sans min-h-[85px] max-h-[220px] leading-relaxed p-1 ${this.isExecuting ? 'opacity-50 cursor-not-allowed' : ''}">${this.taskPrompt}</textarea>
                
                <!-- Target Folder Chip above buttons -->
                <div class="flex items-center justify-between text-[11px] font-mono text-[#8e918f] px-1">
                  <div class="flex items-center gap-1.5 truncate">
                    <span>Target Folder:</span>
                    <button id="btnDockFolderBadge" class="text-[#8ab4f8] hover:underline font-bold flex items-center gap-1 cursor-pointer truncate" title="Click to change target folder">
                      <svg class="w-3.5 h-3.5 text-[#8ab4f8] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>
                      <span class="truncate">${this.currentWorkspacePath}</span>
                      <span class="text-[9px] px-1.5 py-0.2 bg-[#282a2c] border border-[rgba(255,255,255,0.1)] rounded text-[#c4c7c5] hover:text-white ml-1">Change</span>
                    </button>
                  </div>
                  <span class="hidden sm:inline text-[10px] text-[#8e918f]">Ctrl + ↵ to Run</span>
                </div>

                <div class="flex items-center justify-between gap-2 pt-2 border-t border-[rgba(255,255,255,0.06)] min-w-0">
                  <div class="flex items-center gap-2 text-xs font-mono text-[#8e918f] min-w-0 truncate">
                    ${this.isExecuting ? `
                      <span class="w-2 h-2 rounded-full bg-[#8ab4f8] animate-ping flex-shrink-0"></span>
                      <span class="text-xs text-[#8ab4f8] font-mono truncate font-semibold">Generating code...</span>
                    ` : `
                      <kbd class="px-2 py-0.5 rounded bg-[#282a2c] text-[#8ab4f8] border border-[rgba(255,255,255,0.1)] font-mono text-xs font-bold flex-shrink-0">↵ Enter</kbd>
                      <span class="text-xs text-[#c4c7c5] truncate">${this.aiMode === 'ask' ? 'Send Question' : 'Synthesize Code & Run'}</span>
                    `}
                  </div>

                  <div class="flex items-center gap-2 flex-shrink-0">
                    ${this.isExecuting ? `
                      <button id="btnStopExecution" class="bg-[#ef4444] hover:bg-[#dc2626] text-white px-5 py-2 rounded-full font-extrabold flex items-center gap-1.5 text-xs transition shadow-lg active:scale-95 cursor-pointer btn-action flex-shrink-0">
                        <svg class="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
                        <span>Stop</span>
                      </button>
                    ` : `
                      <button id="btnClearChat" class="px-3 py-1.5 text-xs font-mono text-[#8e918f] hover:text-white transition cursor-pointer btn-action flex-shrink-0">
                        Clear
                      </button>
                      <!-- Google AI Studio Blue Pill Run Button -->
                      <button id="btnSubmitTask" class="bg-[#1a73e8] hover:bg-[#1557b0] text-white px-6 py-2.5 rounded-full font-bold flex items-center gap-2 text-xs transition-all shadow-lg hover:shadow-[0_0_16px_rgba(26,115,232,0.4)] active:scale-95 cursor-pointer btn-action flex-shrink-0">
                        <span>${this.aiMode === 'ask' ? 'Send' : 'Run'}</span>
                        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z"/></svg>
                      </button>
                    `}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 4. DRAGGABLE SPLITTER RESIZE HANDLE -->
        ${this.showSidePanel ? '<div id="resizerHandle" class="resizer-handle"></div>' : ''}

        <!-- 5. RIGHT WORKSPACE PANEL (Browser, Editor, Tuning) -->
        ${this.showSidePanel ? `
          <aside class="flex flex-col bg-[#131314] border-l border-[rgba(255,255,255,0.08)] overflow-hidden z-20" style="width: ${this.panelWidthPercent}%">
            <!-- Right Panel Header Tabs (Google AI Studio Style) -->
            <div class="h-14 px-3 border-b border-[rgba(255,255,255,0.08)] bg-[#131314] flex items-center justify-between flex-shrink-0 text-xs">
              <div class="flex items-center gap-1.5">
                <button class="btn-ws-tab flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all cursor-pointer btn-action ${this.activeWorkspaceTab === 'browser' ? 'bg-[#282a2c] text-white font-semibold border border-[rgba(255,255,255,0.12)]' : 'text-[#8e918f] hover:text-white'}" data-tab="browser">
                  <svg class="w-3.5 h-3.5 text-[#81c995]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>
                  <span>Browser</span>
                  ${this.isAppReady ? '<span class="w-1.5 h-1.5 rounded-full bg-[#81c995] shadow-[0_0_6px_#81c995]"></span>' : ''}
                </button>
                <button class="btn-ws-tab flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all cursor-pointer btn-action ${this.activeWorkspaceTab === 'editor' ? 'bg-[#282a2c] text-white font-semibold border border-[rgba(255,255,255,0.12)]' : 'text-[#8e918f] hover:text-white'}" data-tab="editor">
                  <svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
                  <span>Editor</span>
                </button>
                <button class="btn-ws-tab flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all cursor-pointer btn-action ${this.activeWorkspaceTab === 'tuning' ? 'bg-[#282a2c] text-white font-semibold border border-[rgba(255,255,255,0.12)]' : 'text-[#8e918f] hover:text-white'}" data-tab="tuning">
                  <svg class="w-3.5 h-3.5 text-[#8ab4f8]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
                  <span>Parameters</span>
                </button>
              </div>

              <div class="flex items-center gap-2">
                <button id="btnCloseSidePanel" class="p-1.5 hover:bg-[#1e1f20] rounded-full text-[#8e918f] hover:text-white transition cursor-pointer btn-action">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
            </div>

            <!-- Tab 1: Live Browser Preview -->
            ${this.activeWorkspaceTab === 'browser' ? `
              <div class="flex-1 flex flex-col bg-black overflow-hidden">
                <div class="h-9 px-3 border-b border-[rgba(255,255,255,0.08)] bg-[#131314] flex items-center justify-between gap-2 flex-shrink-0">
                  <div class="flex items-center gap-1.5">
                    <span class="w-2.5 h-2.5 rounded-full bg-[#ef4444]"></span>
                    <span class="w-2.5 h-2.5 rounded-full bg-[#eab308]"></span>
                    <span class="w-2.5 h-2.5 rounded-full bg-[#22c55e]"></span>
                  </div>
                  <div class="flex-1 flex items-center bg-[#0e0e0f] border border-[rgba(255,255,255,0.1)] rounded-md px-2.5 py-0.5 text-xs font-mono text-[#ededed]">
                    <span class="text-[#8e918f] mr-1">http://</span>
                    <span class="text-white font-semibold">localhost:3000/</span>
                    <span class="ml-2 px-1.5 py-0.2 text-[9px] bg-[#81c995]/20 text-[#81c995] rounded font-bold">LIVE BROWSER</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <button id="btnReloadPreview" class="p-1 hover:bg-[#1e1f20] rounded text-[#8e918f] hover:text-white transition cursor-pointer" title="Reload Website">
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                    </button>
                    <button id="btnOpenExternalBrowser" class="p-1 hover:bg-[#1e1f20] rounded text-[#8e918f] hover:text-white transition cursor-pointer" title="Open in New Window">
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                    </button>
                  </div>
                </div>
                <div class="flex-1 relative bg-white flex items-center justify-center overflow-hidden">
                  <iframe id="previewIframe" class="w-full h-full border-none bg-white" sandbox="allow-scripts allow-modals allow-same-origin allow-forms allow-popups"></iframe>
                  <div id="previewEmptyState" class="absolute inset-0 p-6 text-center space-y-3 bg-[#0e0e0f] flex flex-col items-center justify-center ${this.generatedSrcDoc ? 'hidden' : ''}">
                    <div class="w-12 h-12 rounded-2xl bg-[#1e1f20] border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-[#8ab4f8] shadow-lg">
                      <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>
                    </div>
                    <h3 class="text-sm font-bold text-white">Browser Ready</h3>
                    <p class="text-xs text-[#8e918f] max-w-xs font-mono">Ask Spring AI Agent to build any app to interactively preview the live website here.</p>
                  </div>
                </div>
              </div>
            ` : ''}

            <!-- Tab 2: Code Editor -->
            ${this.activeWorkspaceTab === 'editor' ? `
              <div class="flex-1 flex overflow-hidden">
                <div class="w-48 border-r border-[rgba(255,255,255,0.08)] bg-[#131314] flex flex-col font-mono flex-shrink-0">
                  <div class="h-9 px-2.5 border-b border-[rgba(255,255,255,0.08)] flex items-center justify-between text-[10px] text-[#ededed] bg-[#0e0e0f]">
                    <span class="truncate font-semibold text-white">Files (${this.fileList.length})</span>
                    <button id="btnRefreshFiles" class="hover:text-white p-0.5 text-xs cursor-pointer" title="Refresh files">
                      <svg class="w-3.5 h-3.5 text-[#8e918f]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                    </button>
                  </div>
                  <div id="fileListContainer" class="flex-1 overflow-y-auto p-2 space-y-0.5 custom-scrollbar text-xs">
                    ${this.fileList.map(f => `
                      <div class="file-item px-2 py-1.5 rounded-lg cursor-pointer flex items-center justify-between transition ${this.selectedFile?.path === f.path ? 'bg-[#1e1f20] text-white font-semibold border-l-2 border-[#8ab4f8] pl-1.5' : 'text-[#8e918f] hover:text-white hover:bg-[#1e1f20]'}" data-path="${f.path}">
                        <div class="flex items-center gap-2 truncate">
                          <svg class="w-3.5 h-3.5 ${f.name.endsWith('.html') ? 'text-orange-400' : f.name.endsWith('.css') ? 'text-blue-400' : f.name.endsWith('.js') ? 'text-yellow-400' : 'text-[#71717a]'}" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                          <span class="truncate text-[11px]">${f.name}</span>
                        </div>
                      </div>
                    `).join('')}
                    ${this.fileList.length === 0 ? '<div class="p-3 text-[#8e918f] text-[10px] font-mono">No files created yet.</div>' : ''}
                  </div>
                </div>

                <div class="flex-1 flex flex-col bg-[#0e0e0f] overflow-hidden font-mono min-w-0">
                  ${this.isStreamingCode ? `
                    <div class="px-3 py-1.5 bg-[#8ab4f8]/10 border-b border-[#8ab4f8]/30 flex items-center justify-between text-[11px] font-mono animate-fadeIn flex-shrink-0">
                      <div class="flex items-center gap-2 text-[#8ab4f8] truncate">
                        <span class="w-2 h-2 rounded-full bg-[#8ab4f8] animate-ping flex-shrink-0"></span>
                        <span class="font-bold">LIVE SYNTHESIS:</span>
                        <span class="text-white truncate">${this.streamingFileName}</span>
                        <span class="text-[#8e918f]">(Line ${this.streamingLineNum}/${this.totalStreamingLines})</span>
                      </div>
                      <span class="text-[#8ab4f8] font-bold text-[10px] flex-shrink-0">⚡ STREAMING</span>
                    </div>
                  ` : ''}

                  <div class="h-8 px-3 border-b border-[rgba(255,255,255,0.08)] bg-[#131314] flex items-center justify-between text-xs flex-shrink-0">
                    <span class="text-white font-medium text-[11px] truncate">${this.selectedFile?.path || (this.fileList.length > 0 ? this.fileList[0].path : 'index.html')}</span>
                    <div class="flex items-center gap-2">
                      <button id="btnSaveFile" class="px-3 py-0.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white font-bold rounded-full text-[10px] transition cursor-pointer flex items-center gap-1 btn-action">
                        <span>Save</span>
                      </button>
                    </div>
                  </div>

                  <div class="flex-1 overflow-y-auto p-3 text-xs select-text custom-scrollbar flex bg-[#0e0e0f] relative">
                    <textarea id="editorTextarea" spellcheck="false" class="w-full h-full bg-transparent text-[#ededed] font-mono text-[11px] leading-relaxed outline-none resize-none border-none p-0 custom-scrollbar">${this.escapeHtml(this.fileContent)}</textarea>
                  </div>
                </div>
              </div>
            ` : ''}

            <!-- Tab 3: Model Tuning & Parameters (Google AI Studio Panel) -->
            ${this.activeWorkspaceTab === 'tuning' ? `
              <div class="flex-1 flex flex-col bg-[#131314] overflow-y-auto p-4 space-y-4 custom-scrollbar text-xs">
                <div class="space-y-1">
                  <span class="text-[11px] font-bold text-white uppercase tracking-wider">Model Tuning &amp; Run Settings</span>
                  <p class="text-[11px] text-[#8e918f]">Configure runtime generation parameters and autonomous quality gates.</p>
                </div>

                <!-- Model Selector -->
                <div class="space-y-1.5 bg-[#1e1f20] border border-[rgba(255,255,255,0.08)] rounded-2xl p-3.5">
                  <label class="text-[10px] font-mono text-[#8e918f] uppercase font-bold">Selected Model</label>
                  <div class="flex items-center justify-between p-2 bg-[#131314] border border-[rgba(255,255,255,0.1)] rounded-xl">
                    <div class="flex items-center gap-2">
                      <div class="w-2 h-2 rounded-full bg-[#81c995]"></div>
                      <span class="font-bold text-white text-xs">deepseek-coder:6.7b</span>
                    </div>
                    <span class="text-[10px] text-[#8ab4f8] font-mono font-semibold">Ollama Local</span>
                  </div>
                </div>

                <!-- Temperature Slider -->
                <div class="space-y-2 bg-[#1e1f20] border border-[rgba(255,255,255,0.08)] rounded-2xl p-3.5">
                  <div class="flex items-center justify-between">
                    <label class="text-[10px] font-mono text-[#8e918f] uppercase font-bold">Temperature</label>
                    <span id="tempValueBadge" class="text-xs font-mono font-bold text-[#8ab4f8] bg-[#131314] px-2 py-0.5 rounded border border-[rgba(255,255,255,0.08)]">${this.temperature.toFixed(2)}</span>
                  </div>
                  <input type="range" id="inputTemperature" min="0.0" max="2.0" step="0.05" value="${this.temperature}" class="google-range-slider cursor-pointer" />
                  <div class="flex justify-between text-[10px] text-[#8e918f] font-mono">
                    <span>0.0 (Precise)</span>
                    <span>1.0 (Balanced)</span>
                    <span>2.0 (Creative)</span>
                  </div>
                </div>

                <!-- Max Output Tokens -->
                <div class="space-y-1.5 bg-[#1e1f20] border border-[rgba(255,255,255,0.08)] rounded-2xl p-3.5">
                  <div class="flex items-center justify-between">
                    <label class="text-[10px] font-mono text-[#8e918f] uppercase font-bold">Max Output Tokens</label>
                    <span class="text-xs font-mono font-bold text-white">8,192</span>
                  </div>
                  <div class="w-full bg-[#131314] rounded-full h-1.5 overflow-hidden">
                    <div class="bg-[#8ab4f8] h-full w-[85%]"></div>
                  </div>
                </div>

                <!-- Autonomous Quality Gates -->
                <div class="space-y-2 bg-[#1e1f20] border border-[rgba(255,255,255,0.08)] rounded-2xl p-3.5">
                  <label class="text-[10px] font-mono text-[#8e918f] uppercase font-bold">Autonomous Quality Gates</label>
                  <div class="space-y-2 pt-1 text-xs">
                    <label class="flex items-center gap-2 cursor-pointer text-[#c4c7c5] hover:text-white">
                      <input type="checkbox" checked class="accent-[#8ab4f8] rounded" />
                      <span>QA Tester Agent (Automated verification)</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer text-[#c4c7c5] hover:text-white">
                      <input type="checkbox" checked class="accent-[#8ab4f8] rounded" />
                      <span>Security Auditor (Vulnerability scanning)</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer text-[#c4c7c5] hover:text-white">
                      <input type="checkbox" checked class="accent-[#8ab4f8] rounded" />
                      <span>Live Preview Server (Port 3000)</span>
                    </label>
                  </div>
                </div>

                <!-- Active Runtime Telemetry -->
                <div class="space-y-1.5 bg-[#1e1f20] border border-[rgba(255,255,255,0.08)] rounded-2xl p-3.5 font-mono text-[11px]">
                  <span class="text-[10px] text-[#8e918f] uppercase font-bold">System Runtime</span>
                  <div class="flex items-center justify-between pt-1">
                    <span class="text-[#8e918f]">Web Server:</span>
                    <span class="text-[#81c995] font-bold">http://localhost:3000</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-[#8e918f]">Backend API:</span>
                    <span class="text-[#8ab4f8] font-bold">http://localhost:8080</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-[#8e918f]">Active Tenant:</span>
                    <span class="text-white">${this.currentTenant}</span>
                  </div>
                </div>
              </div>
            ` : ''}
          </aside>
        ` : ''}
      </div>

      <!-- Google AI Studio "Get Code" Modal -->
      ${this.showGetCodeModal ? `
        <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div class="bg-[#1e1f20] border border-[rgba(255,255,255,0.12)] rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <!-- Header -->
            <div class="h-14 px-6 border-b border-[rgba(255,255,255,0.08)] flex items-center justify-between bg-[#131314]">
              <div class="flex items-center gap-2.5">
                <svg class="w-5 h-5 text-[#8ab4f8]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
                <span class="font-bold text-white text-base">Get code</span>
                <span class="text-[11px] bg-[#282a2c] text-[#8ab4f8] px-2.5 py-0.5 rounded-full border border-[rgba(255,255,255,0.08)] font-mono">Spring AI Autonomous Dev</span>
              </div>
              <button id="btnCloseGetCodeModal" class="text-[#8e918f] hover:text-white text-lg font-mono cursor-pointer transition">✕</button>
            </div>

            <!-- Language Tabs -->
            <div class="px-6 pt-2 flex items-center gap-2 border-b border-[rgba(255,255,255,0.06)] bg-[#131314]">
              <button class="btn-getcode-tab px-4 py-2.5 text-xs font-mono font-bold transition border-b-2 cursor-pointer ${this.getCodeActiveTab === 'curl' ? 'border-[#8ab4f8] text-[#8ab4f8]' : 'border-transparent text-[#8e918f] hover:text-white'}" data-tab="curl">cURL</button>
              <button class="btn-getcode-tab px-4 py-2.5 text-xs font-mono font-bold transition border-b-2 cursor-pointer ${this.getCodeActiveTab === 'python' ? 'border-[#8ab4f8] text-[#8ab4f8]' : 'border-transparent text-[#8e918f] hover:text-white'}" data-tab="python">Python</button>
              <button class="btn-getcode-tab px-4 py-2.5 text-xs font-mono font-bold transition border-b-2 cursor-pointer ${this.getCodeActiveTab === 'typescript' ? 'border-[#8ab4f8] text-[#8ab4f8]' : 'border-transparent text-[#8e918f] hover:text-white'}" data-tab="typescript">JavaScript / TS</button>
              <button class="btn-getcode-tab px-4 py-2.5 text-xs font-mono font-bold transition border-b-2 cursor-pointer ${this.getCodeActiveTab === 'java' ? 'border-[#8ab4f8] text-[#8ab4f8]' : 'border-transparent text-[#8e918f] hover:text-white'}" data-tab="java">Java (Spring AI)</button>
            </div>

            <!-- Code Body -->
            <div class="p-6 flex-1 overflow-y-auto custom-scrollbar bg-[#0e0e0f]">
              <pre class="font-mono text-xs text-[#e3e3e3] p-4 bg-[#131314] rounded-2xl border border-[rgba(255,255,255,0.08)] whitespace-pre-wrap overflow-x-auto leading-relaxed"><code>${this.escapeHtml(this.getActiveCodeSnippet())}</code></pre>
            </div>

            <!-- Footer -->
            <div class="h-14 px-6 border-t border-[rgba(255,255,255,0.08)] bg-[#131314] flex items-center justify-between">
              <span class="text-xs text-[#8e918f]">Ready to run against http://localhost:8080</span>
              <button id="btnCopyGetCode" class="bg-[#1a73e8] hover:bg-[#1557b0] text-white px-5 py-2 rounded-full font-bold text-xs flex items-center gap-2 transition cursor-pointer btn-action shadow-lg">
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                <span id="labelCopyGetCode">Copy code</span>
              </button>
            </div>
          </div>
        </div>
      ` : ''}
    `;

    this.attachEventListeners();
  }

  private renderMessages(): string {
    const currentList = this.messages.filter(msg => {
      if (this.aiMode === 'ask') {
        return msg.mode === 'ask';
      } else {
        return msg.mode === 'agent' || !msg.mode;
      }
    });

    return currentList.map(msg => {
      if (msg.sender === 'user') {
        return `
          <div class="p-4 sm:p-5 bg-[#1e1f20] border border-[rgba(255,255,255,0.08)] rounded-2xl flex items-start gap-3.5 animate-fadeIn shadow-sm">
            <div class="w-8 h-8 rounded-full bg-[#3c4043] flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-inner">
              U
            </div>
            <div class="flex-1 min-w-0 space-y-1">
              <div class="flex items-center justify-between text-xs text-[#8e918f]">
                <span class="font-semibold text-white">User</span>
                <span class="text-[11px] font-mono">${msg.timestamp}</span>
              </div>
              <div class="text-sm text-[#e3e3e3] whitespace-pre-wrap leading-relaxed">${msg.content}</div>
            </div>
          </div>
        `;
      }

      if (msg.type === 'plan') {
        const totalSteps = (msg.steps && msg.steps.length > 0) ? msg.steps.length : 1;
        const completedSteps = msg.steps ? msg.steps.filter(s => s.completed).length : 0;
        const isAllDone = (msg.steps && msg.steps.length > 0) ? msg.steps.every(s => s.completed) : false;
        const computedPercent = isAllDone ? 100 : Math.min(100, Math.max(this.progressPercent, Math.round((completedSteps / totalSteps) * 100)));
        const isDone = computedPercent === 100 || isAllDone;
        const displayPercent = isDone ? 100 : computedPercent;

        return `
          <div class="p-5 bg-[#1e1f20] border border-[rgba(255,255,255,0.08)] rounded-2xl shadow-xl space-y-3.5 animate-fadeIn">
            <div class="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] pb-2.5">
              <div class="flex items-center gap-2.5">
                <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24"><defs><linearGradient id="gemPlan" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#8ab4f8"/><stop offset="100%" stop-color="#c58af9"/></linearGradient></defs><path fill="url(#gemPlan)" d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z"/></svg>
                <span class="font-bold text-white text-xs uppercase font-mono">${msg.planTitle || 'Proposed Implementation Plan'}</span>
              </div>
              <span class="text-[11px] font-mono text-[#8e918f]">${msg.timestamp}</span>
            </div>
            <p class="text-xs text-[#c4c7c5] leading-relaxed">${msg.content}</p>

            <!-- Real-time Progress Bar & Percentage -->
            <div class="space-y-1.5 bg-[#131314] border border-[rgba(255,255,255,0.08)] rounded-xl p-3">
              <div class="flex items-center justify-between text-[10px] font-mono pb-1">
                <span class="text-[#8e918f]">Synthesis Progress</span>
                <span class="${isDone ? 'text-[#81c995]' : 'text-[#8ab4f8]'} font-bold">${displayPercent}% Completed</span>
              </div>
              <div class="w-full bg-[#1e1f20] rounded-full h-2 overflow-hidden border border-[rgba(255,255,255,0.08)]">
                <div class="${isDone ? 'bg-[#81c995] shadow-[0_0_8px_#81c995]' : 'bg-[#8ab4f8] shadow-[0_0_8px_#8ab4f8]'} h-full transition-all duration-300" style="width: ${displayPercent}%"></div>
              </div>
            </div>

            <!-- Steps List -->
            <div class="space-y-2 bg-[#131314] border border-[rgba(255,255,255,0.08)] rounded-xl p-3">
              ${(msg.steps || []).map((st, idx) => `
                <div class="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg ${st.completed ? 'text-[#81c995]' : 'text-[#e3e3e3]'}">
                  <div class="flex items-center gap-2 truncate">
                    <span class="w-4 h-4 rounded-full border ${st.completed ? 'bg-[#81c995] text-black border-[#81c995]' : (st.status === 'in_progress' ? 'border-[#8ab4f8] text-[#8ab4f8]' : 'border-[rgba(255,255,255,0.15)]')} flex items-center justify-center text-[10px] font-bold">${st.completed ? '✓' : idx + 1}</span>
                    <span class="truncate font-mono">${st.label}</span>
                  </div>
                  <span class="text-[10px] font-mono ${st.completed ? 'text-[#81c995]' : (st.status === 'in_progress' ? 'text-[#8ab4f8] animate-pulse font-bold' : 'text-[#8e918f]')}">${st.completed ? 'DONE' : (st.status === 'in_progress' ? 'ACTIVE' : 'QUEUED')}</span>
                </div>
              `).join('')}
            </div>

            <div class="pt-1 flex justify-end">
              ${isDone ? `
                <div class="flex items-center gap-3">
                  <div class="flex items-center gap-2 text-xs font-mono text-[#81c995] font-bold">
                    <span class="w-2 h-2 rounded-full bg-[#81c995]"></span>
                    <span>100% Complete • Codebase Ready</span>
                  </div>
                  <button class="btn-push-plan-github px-3.5 py-1.5 bg-[#24292f] hover:bg-[#32383f] text-white rounded-full text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer border border-[rgba(255,255,255,0.2)] shadow-md" title="Create GitHub Repo & Push Codebase">
                    <svg class="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                    <span>Push to GitHub</span>
                  </button>
                </div>
              ` : (this.isExecuting ? `
                <div class="flex items-center gap-2 text-xs font-mono text-[#8ab4f8] font-bold">
                  <span class="w-2 h-2 rounded-full bg-[#8ab4f8] animate-ping"></span>
                  <span>Synthesizing codebase line by line...</span>
                </div>
              ` : `
                <button class="btn-execute-plan bg-[#1a73e8] hover:bg-[#1557b0] text-white px-5 py-2 rounded-full font-bold text-xs flex items-center gap-2 transition cursor-pointer btn-action shadow-lg" data-prompt="${this.escapeHtml(msg.taskPrompt || '')}">
                  <svg class="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  <span>Run Blueprint</span>
                </button>
              `)}
            </div>
          </div>
        `;
      }

      if (msg.type === 'decision') {
        return `
          <div class="p-5 bg-[#1e1f20] border border-[#8ab4f8]/40 rounded-2xl shadow-xl space-y-3.5 animate-fadeIn">
            <div class="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] pb-2">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-[#8ab4f8] animate-ping"></span>
                <span class="font-bold text-white text-xs font-mono">ARCHITECTURE DECISION</span>
              </div>
              <span class="text-[10px] font-mono text-[#8e918f]">${msg.timestamp}</span>
            </div>
            <p class="text-xs text-[#e3e3e3] leading-relaxed">${msg.content}</p>
            <div class="flex flex-wrap gap-2 pt-1">
              ${(msg.options || []).map(opt => `
                <button class="btn-decision-choice px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer btn-action ${msg.selectedOptionId === opt.id ? 'bg-[#8ab4f8] text-black font-extrabold shadow-[0_0_12px_rgba(138,180,248,0.4)]' : 'bg-[#282a2c] hover:bg-[#3f3f46] text-white border border-[rgba(255,255,255,0.1)]'}" data-msg-id="${msg.id}" data-opt-id="${opt.id}" data-action="${this.escapeHtml(opt.action || opt.label)}">
                  <span>${opt.label}</span>
                </button>
              `).join('')}
            </div>
          </div>
        `;
      }

      if (msg.type === 'thought') {
        return `
          <div class="p-3 bg-[#1e1f20]/60 border border-[rgba(255,255,255,0.06)] rounded-xl text-xs text-[#c4c7c5] flex items-start gap-2.5 shadow-sm animate-fadeIn">
            <span class="w-2 h-2 rounded-full bg-[#8ab4f8] animate-pulse mt-1 flex-shrink-0"></span>
            <div class="flex flex-col gap-0.5 min-w-0">
              <span class="text-[10px] font-mono font-bold text-[#8ab4f8]">${msg.role || 'THOUGHT'} AGENT</span>
              <span class="leading-relaxed font-mono text-[#8e918f]">${msg.content}</span>
            </div>
          </div>
        `;
      }

      if (msg.type === 'action') {
        return `
          <div class="p-3 bg-[#1e1f20] border border-[rgba(255,255,255,0.08)] rounded-xl text-xs text-white flex items-center justify-between gap-2 animate-fadeIn">
            <div class="flex items-center gap-2 truncate">
              <span class="text-[#8ab4f8] font-bold font-mono">TOOL:</span>
              <span class="font-mono text-[#c4c7c5] truncate">${msg.content}</span>
            </div>
            <span class="text-[10px] font-mono text-[#8e918f]">${msg.timestamp}</span>
          </div>
        `;
      }

      if (msg.type === 'answer') {
        return `
          <div class="p-5 sm:p-6 bg-[#131314] border border-[rgba(255,255,255,0.08)] rounded-2xl flex items-start gap-3.5 animate-fadeIn shadow-md">
            <div class="w-8 h-8 rounded-full bg-[#1e1f20] border border-[rgba(255,255,255,0.12)] flex items-center justify-center flex-shrink-0 shadow-sm">
              <svg class="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <defs>
                  <linearGradient id="geminiTurnGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#8ab4f8"/>
                    <stop offset="50%" stop-color="#c58af9"/>
                    <stop offset="100%" stop-color="#f28b82"/>
                  </linearGradient>
                </defs>
                <path fill="url(#geminiTurnGrad)" d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z"/>
              </svg>
            </div>
            <div class="flex-1 min-w-0 space-y-2.5">
              <div class="flex items-center justify-between text-xs text-[#8e918f]">
                <div class="flex items-center gap-2">
                  <span class="font-semibold text-white">Model</span>
                  <span class="text-[10px] bg-[#1e1f20] text-[#8ab4f8] px-2 py-0.5 rounded-full border border-[rgba(255,255,255,0.08)]">Spring AI Pro</span>
                </div>
                <span class="text-[11px] font-mono">${msg.timestamp}</span>
              </div>
              <div class="text-sm text-[#e3e3e3] leading-relaxed">
                ${this.renderRichMarkdown(msg.content)}
              </div>
              <div class="flex items-center gap-2 pt-2 text-xs text-[#8e918f] border-t border-[rgba(255,255,255,0.06)]">
                <button class="btn-copy-turn hover:text-white px-2.5 py-1 rounded-full bg-[#1e1f20] hover:bg-[#282a2c] transition flex items-center gap-1.5 cursor-pointer text-[11px]" data-text="${this.escapeHtml(msg.content)}">
                  <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                  <span>Copy</span>
                </button>
                <div class="flex-1"></div>
                <span class="text-[11px] text-[#5f6368] font-mono">deepseek-coder:6.7b</span>
              </div>
            </div>
          </div>
        `;
      }

      return `
        <div class="p-3.5 bg-[#1e1f20] border border-[rgba(255,255,255,0.08)] rounded-xl text-xs text-white leading-relaxed animate-fadeIn">
          ${msg.content}
        </div>
      `;
    }).join('') + (this.isStreamingCode ? `
      <div id="activeCodeStreamCard" class="w-full p-4 sm:p-5 bg-[#131314] border border-[#8ab4f8]/40 rounded-2xl shadow-2xl space-y-3 animate-fadeIn font-mono my-3">
        <div class="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] pb-2.5">
          <div class="flex items-center gap-2.5">
            <span class="w-2.5 h-2.5 rounded-full bg-[#8ab4f8] animate-ping"></span>
            <span class="text-xs font-bold text-white uppercase">Writing: ${this.streamingFileName}</span>
            <span class="text-[10px] bg-[#1e1f20] text-[#8ab4f8] px-2.5 py-0.5 rounded-full border border-[rgba(255,255,255,0.08)] font-mono" id="streamLineCountBadge">
              Line ${this.streamingLineNum} of ${this.totalStreamingLines}
            </span>
          </div>
          <span class="text-[10px] text-[#81c995] font-bold tracking-wider animate-pulse font-mono">LIVE GENERATING LINE-BY-LINE...</span>
        </div>
        <div class="max-h-72 overflow-y-auto custom-scrollbar p-3.5 bg-[#0e0e0f] rounded-xl border border-[rgba(255,255,255,0.06)] text-xs text-[#81c995] leading-relaxed select-text" id="streamCodeScrollBox">
          <pre class="font-mono text-xs text-[#e3e3e3] whitespace-pre-wrap"><code id="streamCodeElement">${this.escapeHtml(this.displayedStreamingCode)}</code></pre>
        </div>
      </div>
    ` : '') + (this.isExecuting && this.aiMode === 'ask' ? `
      <div class="thinking-card p-5 bg-[#131314] border border-[rgba(255,255,255,0.08)] rounded-2xl shadow-xl space-y-3 animate-fadeIn flex items-start gap-3.5">
        <div class="w-8 h-8 rounded-full bg-[#1e1f20] border border-[#8ab4f8]/30 flex items-center justify-center flex-shrink-0">
          <span class="w-2.5 h-2.5 rounded-full bg-[#8ab4f8] animate-ping"></span>
        </div>
        <div class="flex-1 space-y-2">
          <div class="flex items-center gap-2">
            <span class="font-semibold text-white text-xs">Model is thinking...</span>
            <span class="inline-flex items-center gap-1 ml-1">
              <span class="thinking-dot thinking-dot-1"></span>
              <span class="thinking-dot thinking-dot-2"></span>
              <span class="thinking-dot thinking-dot-3"></span>
            </span>
          </div>
          <div class="space-y-2 pt-1">
            <div class="shimmer-line h-3 w-full rounded-md"></div>
            <div class="shimmer-line h-3 w-4/5 rounded-md"></div>
          </div>
        </div>
      </div>
    ` : (this.isExecuting && this.aiMode === 'agent' && !this.isStreamingCode ? `
      <div class="p-4 bg-[#131314] border border-[#8ab4f8]/30 rounded-xl flex items-center justify-between text-xs font-mono text-[#ededed] shadow-lg animate-fadeIn">
        <div class="flex items-center gap-2.5">
          <span class="w-2.5 h-2.5 rounded-full bg-[#8ab4f8] animate-ping"></span>
          <span class="text-[#8ab4f8] font-bold">AUTONOMOUS SYNTHESIS:</span>
          <span class="text-white">${this.currentStatusText}</span>
        </div>
        <span class="inline-flex items-center gap-1">
          <span class="thinking-dot thinking-dot-1"></span>
          <span class="thinking-dot thinking-dot-2"></span>
          <span class="thinking-dot thinking-dot-3"></span>
        </span>
      </div>
    ` : ''));
  }

  private renderRichMarkdown(md: string): string {
    if (!md) return '';
    let html = this.escapeHtml(md);

    // Code blocks with syntax badge & copy button
    html = html.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (_match, lang, code) => {
      const language = lang.trim() || 'code';
      const cleanCode = code.trim();
      return `
        <div class="my-3 rounded-xl border border-[#27272a] bg-[#000000] overflow-hidden shadow-lg">
          <div class="h-7 px-3 bg-[#111113] border-b border-[#27272a] flex items-center justify-between text-[10px] font-mono text-[#a1a1aa]">
            <span class="text-[#00ff88] uppercase font-bold">${language}</span>
            <button class="btn-copy-code hover:text-white transition cursor-pointer" data-code="${this.escapeHtml(cleanCode)}">Copy</button>
          </div>
          <pre class="p-3 text-xs text-[#ededed] font-mono overflow-x-auto custom-scrollbar leading-relaxed"><code>${cleanCode}</code></pre>
        </div>
      `;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-[#18181b] text-[#00ff88] font-mono text-[11px] border border-[#27272a]">$1</code>');

    // Headings
    html = html.replace(/^#### (.*$)/gim, '<h4 class="text-xs font-bold text-white mt-3 mb-1.5 flex items-center gap-1.5 font-mono"><span class="w-1.5 h-1.5 rounded-full bg-[#00ff88]"></span>$1</h4>');
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-sm font-extrabold text-white mt-4 mb-2 border-b border-[#27272a] pb-1 font-mono text-[#00ff88]">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-base font-extrabold text-white mt-4 mb-2 font-mono">$1</h2>');

    // Tables
    const tableRegex = /((?:\|[^\n]+\|\r?\n)+)/g;
    html = html.replace(tableRegex, (match) => {
      const rows = match.trim().split(/\r?\n/).map(r => r.trim()).filter(r => r.length > 0);
      if (rows.length < 2) return match;
      
      let tableHtml = '<div class="overflow-x-auto my-3 rounded-xl border border-[#27272a] shadow-md"><table class="w-full text-xs text-left font-mono border-collapse bg-[#09090b]">';
      
      // Header row
      const headers = rows[0].split('|').map(c => c.trim()).filter((_c, i, a) => i > 0 && i < a.length - 1);
      tableHtml += '<thead><tr class="bg-[#111113] border-b border-[#27272a] text-[#00ff88] font-bold text-[11px]">';
      headers.forEach(h => {
        tableHtml += `<th class="p-2.5 border-r border-[#27272a] last:border-r-0">${h}</th>`;
      });
      tableHtml += '</tr></thead><tbody>';

      // Body rows (skip separator row at index 1 if it has dashes)
      const startIndex = rows[1] && rows[1].includes('---') ? 2 : 1;
      for (let i = startIndex; i < rows.length; i++) {
        const cols = rows[i].split('|').map(c => c.trim()).filter((_c, idx, a) => idx > 0 && idx < a.length - 1);
        tableHtml += '<tr class="border-b border-[#27272a]/50 hover:bg-[#18181b]/50 transition">';
        cols.forEach(c => {
          tableHtml += `<td class="p-2.5 border-r border-[#27272a]/50 last:border-r-0 text-[#ededed]">${c}</td>`;
        });
        tableHtml += '</tr>';
      }

      tableHtml += '</tbody></table></div>';
      return tableHtml;
    });

    // Bold / Italic
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-white">$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em class="text-[#a1a1aa] italic">$1</em>');

    // Bullet lists
    html = html.replace(/^[•*-] (.*$)/gim, '<div class="flex items-start gap-2 my-1 text-xs text-[#ededed]"><span class="text-[#00ff88] mt-0.5">•</span><span class="flex-1">$1</span></div>');

    // Horizontal Rule
    html = html.replace(/^---$/gim, '<hr class="my-3 border-[#27272a]"/>');

    return html;
  }

  private escapeHtml(str: string): string {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  private getActiveCodeSnippet(): string {
    if (!this.studioCodeSnippets) {
      const p = (this.taskPrompt || 'Write a modern full stack web application with clean design').replace(/"/g, '\\"');
      const s = (this.systemInstruction || 'You are Spring AI Agent.').replace(/"/g, '\\"');
      return `curl -X POST http://localhost:8080/api/task \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "prompt": "${p}",\n    "systemInstruction": "${s}",\n    "model": "${this.selectedModelId}",\n    "temperature": ${this.temperature.toFixed(2)},\n    "mode": "${this.aiMode}"\n  }'`;
    }
    return this.studioCodeSnippets[this.getCodeActiveTab] || '';
  }

  private attachEventListeners() {
    // Top Bar Mode Switcher
    document.getElementById('btnModeAgent')?.addEventListener('click', () => {
      this.aiMode = 'agent';
      this.render();
    });
    document.getElementById('btnModeAsk')?.addEventListener('click', () => {
      this.aiMode = 'ask';
      this.render();
    });
    document.getElementById('btnToggleCrt')?.addEventListener('click', () => {
      this.crtEnabled = !this.crtEnabled;
      this.render();
    });
    document.getElementById('btnLayoutWide')?.addEventListener('click', () => {
      this.showSidePanel = true;
      this.panelWidthPercent = 32;
      this.render();
    });
    document.getElementById('btnLayoutSplit')?.addEventListener('click', () => {
      this.showSidePanel = true;
      this.panelWidthPercent = 50;
      this.render();
    });
    document.getElementById('btnToggleSidePanel')?.addEventListener('click', () => {
      this.showSidePanel = !this.showSidePanel;
      this.render();
    });
    document.getElementById('btnOpenSidePanel')?.addEventListener('click', () => {
      this.showSidePanel = true;
      this.render();
    });
    document.getElementById('btnCloseSidePanel')?.addEventListener('click', () => {
      this.showSidePanel = false;
      this.render();
    });
    document.getElementById('btnNewSession')?.addEventListener('click', () => {
      this.activeSession = null;
      this.messages = [];
      this.render();
    });

    // GitHub Login Modal Triggers
    const openGitHubModal = () => {
      this.showGitHubLoginModal = true;
      this.gitHubLoginError = '';
      this.render();
    };
    document.getElementById('btnOpenUserAccountModal')?.addEventListener('click', openGitHubModal);
    document.getElementById('btnHeaderGitHubLogin')?.addEventListener('click', openGitHubModal);
    document.getElementById('btnCloseGitHubModal')?.addEventListener('click', () => {
      this.showGitHubLoginModal = false;
      this.render();
    });
    document.getElementById('btnCloseGitHubModalFooter')?.addEventListener('click', () => {
      this.showGitHubLoginModal = false;
      this.render();
    });

    // GitHub Login Submit Handler
    document.getElementById('btnSubmitGitHubLogin')?.addEventListener('click', async () => {
      const usernameInput = document.getElementById('inputGitHubUsername') as HTMLInputElement;
      const tokenInput = document.getElementById('inputGitHubToken') as HTMLInputElement;
      const username = usernameInput ? usernameInput.value.trim() : '';
      const token = tokenInput ? tokenInput.value.trim() : '';

      if (!username && !token) {
        this.gitHubLoginError = 'Please provide a GitHub username or Personal Access Token.';
        this.render();
        return;
      }

      this.isLoggingInGitHub = true;
      this.gitHubLoginError = '';
      this.render();

      try {
        const profile = await api.loginUser(username, token);
        this.userProfile = profile;
        this.currentTenant = profile.login.toLowerCase();
        this.isLoggingInGitHub = false;
        this.showGitHubLoginModal = false;
        this.render();
      } catch (err: any) {
        this.isLoggingInGitHub = false;
        this.gitHubLoginError = err.message || 'Failed to authenticate with GitHub.';
        this.render();
      }
    });

    // Create GitHub Repo and Push Handler
    document.getElementById('btnCreateAndPushRepo')?.addEventListener('click', async () => {
      const repoNameInput = document.getElementById('inputNewRepoName') as HTMLInputElement;
      const repoDescInput = document.getElementById('inputNewRepoDesc') as HTMLInputElement;
      const selectVisibility = document.getElementById('selectRepoVisibility') as HTMLSelectElement;
      const tokenInput = document.getElementById('inputGitHubToken') as HTMLInputElement;

      const name = repoNameInput ? repoNameInput.value.trim() : '';
      const description = repoDescInput ? repoDescInput.value.trim() : '';
      const isPrivate = selectVisibility ? selectVisibility.value === 'private' : false;
      const token = tokenInput && tokenInput.value.trim() ? tokenInput.value.trim() : (localStorage.getItem('github_token') || '');

      if (!name) {
        this.createRepoResult = {
          success: false,
          message: 'Please specify a repository name.'
        };
        this.render();
        return;
      }

      if (!token) {
        this.createRepoResult = {
          success: false,
          message: 'GitHub Personal Access Token (PAT) with "repo" scope is required to create a repository. Please paste your token in the token field above.'
        };
        this.render();
        return;
      }

      this.isCreatingRepo = true;
      this.createRepoResult = null;
      this.render();

      try {
        const res = await api.createRepoAndPush({
          name,
          description,
          isPrivate,
          token,
          username: this.userProfile.login
        });

        this.isCreatingRepo = false;
        if (res.success) {
          this.createRepoResult = {
            success: true,
            message: res.message || `Successfully created and pushed to GitHub!`,
            htmlUrl: res.htmlUrl
          };
        } else {
          this.createRepoResult = {
            success: false,
            message: res.error || res.message || 'Failed to create and push repository. Provide a Personal Access Token with repo scope.'
          };
        }
        this.render();
      } catch (err: any) {
        this.isCreatingRepo = false;
        this.createRepoResult = {
          success: false,
          message: err.message || 'Network error communicating with Git service.'
        };
        this.render();
      }
    });

    // Sign Out Handler
    document.getElementById('btnSignOutGitHub')?.addEventListener('click', async () => {
      await api.logoutUser();
      this.userProfile = {
        login: 'Guest',
        name: 'Guest User',
        avatar_url: 'https://avatars.githubusercontent.com/u/9919?v=4',
        organization: 'Local Workspace',
        authenticated: false
      };
      this.currentTenant = 'guest';
      this.showGitHubLoginModal = false;
      this.render();
    });

    document.querySelectorAll('.btn-push-plan-github').forEach(btn => {
      btn.addEventListener('click', () => {
        this.showGitHubLoginModal = true;
        this.createRepoResult = null;
        this.render();
      });
    });

    // Google AI Studio Header Actions
    document.getElementById('btnEditPromptTitle')?.addEventListener('click', () => {
      const newTitle = prompt('Enter prompt title:', this.promptTitle);
      if (newTitle && newTitle.trim()) {
        this.promptTitle = newTitle.trim();
        this.render();
      }
    });

    document.getElementById('btnOpenGetCodeModal')?.addEventListener('click', async () => {
      this.studioCodeSnippets = await api.getStudioCode({
        prompt: this.taskPrompt || 'Write a modern full stack web application with clean design',
        mode: this.aiMode,
        systemInstruction: this.systemInstruction,
        temperature: this.temperature,
        model: this.selectedModelId,
        title: this.promptTitle
      });
      this.showGetCodeModal = true;
      this.render();
    });

    document.getElementById('btnCloseGetCodeModal')?.addEventListener('click', () => {
      this.showGetCodeModal = false;
      this.render();
    });

    document.querySelectorAll('.btn-getcode-tab').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.getCodeActiveTab = (e.currentTarget as HTMLElement).dataset['tab'] as any;
        this.render();
      });
    });

    document.getElementById('btnCopyGetCode')?.addEventListener('click', () => {
      const snippet = this.getActiveCodeSnippet();
      navigator.clipboard.writeText(snippet);
      const label = document.getElementById('labelCopyGetCode');
      if (label) {
        label.textContent = 'Copied!';
        setTimeout(() => { label.textContent = 'Copy code'; }, 1500);
      }
    });

    document.getElementById('btnSharePrompt')?.addEventListener('click', () => {
      navigator.clipboard.writeText(window.location.href);
      alert('Spring AI Autonomous Dev prompt link copied to clipboard!');
    });

    document.getElementById('btnHeaderRun')?.addEventListener('click', () => this.submitTask());

    // Save Folder / Workspace Root Modal Triggers
    const openFolderModal = () => {
      this.showFolderModal = true;
      this.render();
    };

    document.getElementById('btnOpenFolder')?.addEventListener('click', openFolderModal);
    document.getElementById('btnChangeFolderQuick')?.addEventListener('click', openFolderModal);
    document.getElementById('btnHeaderChangeFolder')?.addEventListener('click', openFolderModal);
    document.getElementById('btnDockFolderBadge')?.addEventListener('click', openFolderModal);

    // Preset Folder buttons
    document.querySelectorAll('.btn-preset-folder').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const path = (e.currentTarget as HTMLElement).dataset['path'];
        const input = document.getElementById('inputFolderModal') as HTMLInputElement;
        if (input && path) {
          input.value = path;
        }
      });
    });

    // Native Directory Picker
    document.getElementById('btnBrowseNativeDir')?.addEventListener('click', async () => {
      if ('showDirectoryPicker' in window) {
        try {
          const dirHandle = await (window as any).showDirectoryPicker();
          if (dirHandle && dirHandle.name) {
            const input = document.getElementById('inputFolderModal') as HTMLInputElement;
            const candidate = (this.commonFolders['userHome'] || 'C:/Users/prana') + '/' + dirHandle.name;
            if (input) input.value = candidate;
          }
        } catch (ignored) {}
      } else {
        document.getElementById('inputNativeDirPicker')?.click();
      }
    });

    document.getElementById('inputNativeDirPicker')?.addEventListener('change', (e: any) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        const relativePath = files[0].webkitRelativePath;
        const folderName = relativePath.split('/')[0];
        const input = document.getElementById('inputFolderModal') as HTMLInputElement;
        if (input && folderName) {
          input.value = (this.commonFolders['userHome'] || 'C:/Users/prana') + '/' + folderName;
        }
      }
    });

    document.getElementById('btnCloseFolderModal')?.addEventListener('click', () => {
      this.showFolderModal = false;
      this.render();
    });
    document.getElementById('btnCancelFolderModal')?.addEventListener('click', () => {
      this.showFolderModal = false;
      this.render();
    });
    document.getElementById('btnConfirmFolderModal')?.addEventListener('click', async () => {
      const input = document.getElementById('inputFolderModal') as HTMLInputElement;
      if (input && input.value.trim()) {
        const newPath = input.value.trim();
        const res = await api.setFolder(newPath);
        if (res && res.currentFolder) {
          this.currentWorkspacePath = res.currentFolder;
        } else {
          this.currentWorkspacePath = newPath;
        }
        this.showFolderModal = false;
        await this.loadFiles();
        await this.bundleProjectToSrcDoc();
        this.updatePreviewIframe();
        this.render();
      }
    });

    document.getElementById('btnOpenInExplorerSidebar')?.addEventListener('click', async () => {
      await api.openFolderInOs();
    });

    document.getElementById('btnOpenInExplorerModal')?.addEventListener('click', async () => {
      await api.openFolderInOs();
    });

    // Execute Plan Button inside Plan Card
    document.querySelectorAll('.btn-execute-plan').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const prompt = (e.currentTarget as HTMLElement).dataset['prompt'] || '';
        if (prompt) {
          this.executePlan(prompt);
        }
      });
    });

    // Decision Inquiries & User Choice Options
    document.querySelectorAll('.btn-decision-choice').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const msgId = (e.currentTarget as HTMLElement).dataset['msgId'];
        const optId = (e.currentTarget as HTMLElement).dataset['optId'];
        const action = (e.currentTarget as HTMLElement).dataset['action'] || '';
        
        const msg = this.messages.find(m => m.id === msgId);
        if (msg) {
          msg.selectedOptionId = optId;
        }
        
        this.messages.push({
          id: Math.random().toString(),
          sender: 'user',
          type: 'text',
          content: `Selected Option: ${action}`,
          timestamp: new Date().toLocaleTimeString()
        });

        this.executePlan(`[DECISION_ANSWER] ${action}`);
      });
    });

    // Swarm Filter Pills
    document.querySelectorAll('.btn-filter-role').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const role = (e.currentTarget as HTMLElement).dataset['role'] || 'ALL';
        this.filterSwarmRole = role;
        this.render();
      });
    });

    // Session Switcher & Delete
    document.querySelectorAll('.session-item').forEach(el => {
      el.addEventListener('click', (e) => {
        if ((e.target as HTMLElement).closest('.btn-delete-session')) return;
        const id = (e.currentTarget as HTMLElement).dataset['id'];
        const found = this.sessions.find(s => s.id === id);
        if (found) {
          this.activeSession = found;
          this.messages = found.messages || [];
          this.render();
        }
      });
    });

    document.querySelectorAll('.btn-delete-session').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = (e.currentTarget as HTMLElement).dataset['id'];
        if (id) {
          this.sessions = this.sessions.filter(s => s.id !== id);
          if (this.activeSession?.id === id) {
            this.activeSession = this.sessions.length > 0 ? this.sessions[0] : null;
            this.messages = this.activeSession ? (this.activeSession.messages || []) : [];
          }
          this.saveSessionsToStorage();
          this.render();
        }
      });
    });

    // Workspace Tabs
    document.querySelectorAll('.btn-ws-tab').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const tab = (e.currentTarget as HTMLElement).dataset['tab'] as any;
        this.activeWorkspaceTab = tab;
        if (tab === 'browser') {
          await this.bundleProjectToSrcDoc();
        } else if (tab === 'checkpoints') {
          this.checkpoints = await api.getCheckpoints();
        }
        this.render();
      });
    });

    // System Instructions Toggle & Text (Google AI Studio)
    document.getElementById('btnToggleSystemInstruction')?.addEventListener('click', () => {
      this.systemInstructionOpen = !this.systemInstructionOpen;
      this.render();
    });
    document.getElementById('btnCloseSystemInstruction')?.addEventListener('click', () => {
      this.systemInstructionOpen = false;
      this.render();
    });
    document.getElementById('systemInstructionText')?.addEventListener('input', (e) => {
      this.systemInstruction = (e.target as HTMLTextAreaElement).value;
    });

    // Temperature Slider (Google AI Studio Tuning)
    document.getElementById('inputTemperature')?.addEventListener('input', (e) => {
      const val = parseFloat((e.target as HTMLInputElement).value);
      this.temperature = val;
      const badge = document.getElementById('tempValueBadge');
      if (badge) badge.textContent = val.toFixed(2);
    });

    // Prompt Input with Ctrl+Enter or Enter
    const input = document.getElementById('taskInput') as HTMLTextAreaElement;
    if (input) {
      input.addEventListener('input', () => {
        this.taskPrompt = input.value;
      });
      input.addEventListener('keydown', (e) => {
        if ((e.key === 'Enter' && (e.ctrlKey || e.metaKey)) || (e.key === 'Enter' && !e.shiftKey)) {
          e.preventDefault();
          this.submitTask();
        }
      });
    }

    document.getElementById('btnSubmitTask')?.addEventListener('click', () => this.submitTask());
    document.getElementById('btnStopExecution')?.addEventListener('click', () => this.stopExecution());
    document.getElementById('btnClearChat')?.addEventListener('click', () => {
      this.messages = [];
      this.render();
    });

    // Copy turn response (Google AI Studio)
    document.querySelectorAll('.btn-copy-turn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const text = (e.currentTarget as HTMLElement).dataset['text'] || '';
        if (text) {
          navigator.clipboard.writeText(text);
          const span = (e.currentTarget as HTMLElement).querySelector('span');
          if (span) {
            span.textContent = 'Copied!';
            setTimeout(() => { span.textContent = 'Copy'; }, 1500);
          }
        }
      });
    });

    // File selection in Editor
    document.querySelectorAll('.file-item').forEach(item => {
      item.addEventListener('click', async (e) => {
        const path = (e.currentTarget as HTMLElement).dataset['path'];
        if (path) {
          const node = this.fileList.find(f => f.path === path);
          if (node) {
            this.selectedFile = node;
            const res = await api.getFileContent(path);
            this.fileContent = res.content || '';
            this.render();
          }
        }
      });
    });

    const textarea = document.getElementById('editorTextarea') as HTMLTextAreaElement;
    if (textarea) {
      textarea.addEventListener('input', () => {
        this.fileContent = textarea.value;
      });
    }

    document.getElementById('btnSaveFile')?.addEventListener('click', async () => {
      if (this.selectedFile) {
        await api.saveFile(this.selectedFile.path, this.fileContent);
        this.bundleProjectToSrcDoc();
      }
    });

    // Preview Browser Toolbar Actions
    document.getElementById('btnReloadPreview')?.addEventListener('click', async () => {
      await this.bundleProjectToSrcDoc();
      this.updatePreviewIframe();
    });

    document.getElementById('btnOpenExternalBrowser')?.addEventListener('click', () => {
      window.open('http://localhost:3000', '_blank');
    });

    // Resizer Handle
    const resizer = document.getElementById('resizerHandle');
    if (resizer) {
      resizer.addEventListener('mousedown', (e) => {
        e.preventDefault();
        this.isResizing = true;
      });
    }

    // Always update iframe srcdoc with unescaped HTML DOM
    this.updatePreviewIframe();
  }

  private onMouseMove(e: MouseEvent) {
    if (!this.isResizing) return;
    const totalWidth = window.innerWidth;
    const newPercent = ((totalWidth - e.clientX) / totalWidth) * 100;
    if (newPercent >= 25 && newPercent <= 75) {
      this.panelWidthPercent = Math.round(newPercent);
      const rightPanel = document.querySelector('aside[style*="width"]') as HTMLElement;
      if (rightPanel) rightPanel.style.width = `${this.panelWidthPercent}%`;
    }
  }

  private onMouseUp() {
    this.isResizing = false;
  }

  private updateEditorContent() {
    const textarea = document.getElementById('editorTextarea') as HTMLTextAreaElement;
    if (textarea) {
      textarea.value = this.fileContent;
      textarea.scrollTop = textarea.scrollHeight;
    }
  }

  private renderFileList() {
    const container = document.getElementById('fileListContainer');
    if (!container) return;
    container.innerHTML = this.fileList.map(f => `
      <div class="file-item px-2 py-1.5 rounded-lg cursor-pointer flex items-center justify-between transition ${this.selectedFile?.path === f.path ? 'bg-[#18181b] text-white font-semibold' : 'text-[#a1a1aa] hover:text-white hover:bg-[#111113]'}" data-path="${f.path}">
        <div class="flex items-center gap-2 truncate">
          <svg class="w-3.5 h-3.5 text-[#71717a]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          <span class="truncate text-[11px]">${f.name}</span>
        </div>
      </div>
    `).join('');
  }

  private updatePreviewIframe() {
    const iframe = document.getElementById('previewIframe') as HTMLIFrameElement;
    const emptyState = document.getElementById('previewEmptyState');
    if (iframe) {
      if (this.generatedSrcDoc && this.generatedSrcDoc.trim().length > 0) {
        iframe.srcdoc = this.generatedSrcDoc;
        if (emptyState) emptyState.classList.add('hidden');
      } else {
        iframe.srcdoc = '';
        if (emptyState) emptyState.classList.remove('hidden');
      }
    }
  }
}
