import { api } from '../services/api';
import { sseService } from '../services/sse';
import { soundEngine } from '../services/sound';
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

// Authentic 1984 Susan Kare Classic Macintosh Pixel Art Icons
const MAC_ICONS = {
  happyMac: `<svg class="w-4 h-4 inline-block flex-shrink-0" viewBox="0 0 16 16" fill="currentColor"><path d="M2 1h12v11H2V1zm1 1v7h10V2H3zm0 8h10v1H3v-1zM5 4h2v2H5V4zm4 0h2v2H9V4zm-4 4h6v1H5V8zm4 3h3v1H9v-1zm-6 2h10v1H3v-1zm-1 1h12v1H2v-1z" fill-rule="evenodd"/></svg>`,
  watch: `<svg class="w-4 h-4 inline-block flex-shrink-0" viewBox="0 0 16 16" fill="currentColor"><path d="M6 0h4v2H6V0zm0 14h4v2H6v-2zM3 3h10v10H3V3zm1 1v8h8V4H4zm4 1h1v3h2v1H8V5z" fill-rule="evenodd"/></svg>`,
  floppy: `<svg class="w-4 h-4 inline-block flex-shrink-0" viewBox="0 0 16 16" fill="currentColor"><path d="M1 1h11l3 3v11H1V1zm1 1v12h12V4.5L11.5 2H2zm2 0h6v4H4V2zm2 1h2v2H6V3zm-2 6h8v4H4V9z" fill-rule="evenodd"/></svg>`,
  bomb: `<svg class="w-4 h-4 inline-block flex-shrink-0" viewBox="0 0 16 16" fill="currentColor"><path d="M11 0h1v1h-1V0zm2 1h1v1h-1V1zm-3 2h2v1h-2V3zm-2 2h2v1H8V5zm-2 2h4v1h1v4h-1v1H6v-1H5V8h1V7zm-2 2h1v2H4V9zm6 0h1v2h-1V9zm-3 4h2v1H7v-1z" fill-rule="evenodd"/></svg>`,
  trash: `<svg class="w-3.5 h-3.5 inline-block flex-shrink-0" viewBox="0 0 16 16" fill="currentColor"><path d="M6 1h4v1H6V1zM2 3h12v1H2V3zm1 2h10v10H3V5zm2 2v6h1V7H5zm3 0v6h1V7H8zm3 0v6h1V7h-1z" fill-rule="evenodd"/></svg>`,
  doc: `<svg class="w-3.5 h-3.5 inline-block flex-shrink-0" viewBox="0 0 16 16" fill="currentColor"><path d="M2 1h8l4 4v10H2V1zm1 1v12h10V5.5L9.5 2H3zm2 3h3v1H5V5zm0 2h6v1H5V7zm0 2h6v1H5V9zm0 2h6v1H5v-1zm5-9v3h3L10 2z" fill-rule="evenodd"/></svg>`,
  command: `<svg class="w-3.5 h-3.5 inline-block flex-shrink-0" viewBox="0 0 16 16" fill="currentColor"><path d="M4 1a3 3 0 0 0-3 3 3 3 0 0 0 3 3h1v2H4a3 3 0 1 0 3 3v-1h2v1a3 3 0 1 0 3-3h-1V7h1a3 3 0 1 0-3-3v1H7V4a3 3 0 0 0-3-3zm0 2a1 1 0 0 1 1 1v1H4a1 1 0 0 1 0-2zm7 0a1 1 0 0 1 1 1 1 1 0 0 1-1 1h-1V4a1 1 0 0 1 1-1zM7 7h2v2H7V7zm-3 4h1v1a1 1 0 0 1-1 1 1 1 0 0 1 0-2zm8 0a1 1 0 0 1 0 2 1 1 0 0 1-1-1v-1h1z" fill-rule="evenodd"/></svg>`,
  briefcase: `<svg class="w-3.5 h-3.5 inline-block flex-shrink-0" viewBox="0 0 16 16" fill="currentColor"><path d="M5 1h6v2H5V1zm-1 2h8v1h3v11H1V4h3V3zm-2 2v9h12V5H2zm5 1h2v1H7V6zm-2 2h6v1H5V8zm1 2h4v1H6v-1z" fill-rule="evenodd"/></svg>`,
  handWrite: `<svg class="w-4 h-4 inline-block flex-shrink-0" viewBox="0 0 16 16" fill="currentColor"><path d="M12 0l4 4-8 8H4v-4l8-8zm-1 3L5 9v2h2l6-6-2-2zM0 14h16v2H0v-2z" fill-rule="evenodd"/></svg>`,
  alertBubble: `<svg class="w-3.5 h-3.5 inline-block flex-shrink-0" viewBox="0 0 16 16" fill="currentColor"><path d="M0 0h16v12H4l-4 4V0zm1 1v10.5L3.5 9H15V1H1zm6 2h2v4H7V3zm0 5h2v2H7V8z" fill-rule="evenodd"/></svg>`,
  macScreen: `<svg class="w-3.5 h-3.5 inline-block flex-shrink-0" viewBox="0 0 16 16" fill="currentColor"><path d="M2 1h12v11H2V1zm1 1v7h10V2H3zm0 8h10v1H3v-1zm4 3h2v1H7v-1zm-4 1h10v1H3v-1z" fill-rule="evenodd"/></svg>`,
  sound: `<svg class="w-3.5 h-3.5 inline-block flex-shrink-0" viewBox="0 0 16 16" fill="currentColor"><path d="M7 1L3 5H0v6h3l4 4V1zm3 3a4 4 0 010 8v-1.5a2.5 2.5 0 000-5V4zm2-2a6 6 0 010 12v-1.5a4.5 4.5 0 000-9V2z" fill-rule="evenodd"/></svg>`,
  soundMute: `<svg class="w-3.5 h-3.5 inline-block flex-shrink-0" viewBox="0 0 16 16" fill="currentColor"><path d="M7 1L3 5H0v6h3l4 4V1zm3.5 4.5l1.5-1.5 1.5 1.5 1.5-1.5 1 1-1.5 1.5 1.5 1.5-1 1-1.5-1.5-1.5 1.5-1-1 1.5-1.5-1.5-1.5 1-1z" fill-rule="evenodd"/></svg>`,
  github: `<svg class="w-4 h-4 inline-block flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>`
};

export class WorkspaceComponent {
  private container: HTMLElement;
  
  // State
  private userProfile: UserProfile = { 
    login: 'Developer', 
    name: 'Local Developer', 
    organization: 'Local Workspace', 
    avatar_url: 'https://avatars.githubusercontent.com/u/9919?v=4', 
    authenticated: true 
  };
  private currentTenant: string = 'default';
  private currentWorkspacePath: string = 'workspace';
  private commonFolders: Record<string, string> = {};
  private currentRoute: 'landing' | 'login' | 'workspace' = 'workspace';
  private isLandingPageOpen: boolean = false;

  // Live Backend Telemetry & Reasoning State (DeepSeek / Ollama style)
  private executionElapsedSeconds: number = 0;
  private executionTimerInterval: any = null;
  private backendLogs: Array<{ role: string; text: string; time: string; type: string }> = [];
  private latestSavedFile: { name: string; time: string; size?: number } | null = null;

  private getFolderDisplayBasename(): string {
    if (!this.currentWorkspacePath) return 'workspace';
    const parts = this.currentWorkspacePath.replace(/\\/g, '/').split('/').filter(p => p.trim().length > 0);
    return parts.length > 0 ? parts[parts.length - 1] : this.currentWorkspacePath;
  }

  private getUserAvatarUrl(customLogin?: string): string {
    const handle = customLogin?.trim() || this.userProfile?.login?.trim() || 'Developer';
    if (!customLogin && this.userProfile?.avatar_url && this.userProfile.avatar_url.trim().length > 0) {
      return this.userProfile.avatar_url;
    }
    return `https://github.com/${handle}.png`;
  }

  public handleRouteFromUrl(): void {
    const path = window.location.pathname.toLowerCase().trim();
    if (path === '/login' || path.startsWith('/login')) {
      this.currentRoute = 'login';
      this.isLandingPageOpen = false;
    } else if (path === '/landing' || path.startsWith('/landing')) {
      this.currentRoute = 'landing';
      this.isLandingPageOpen = true;
    } else if (path === '/workspace' || path.startsWith('/workspace')) {
      this.currentRoute = 'workspace';
      this.isLandingPageOpen = false;
    } else {
      if (localStorage.getItem('agent_logged_out') === 'true') {
        this.currentRoute = 'landing';
        this.isLandingPageOpen = true;
      } else {
        this.currentRoute = 'workspace';
        this.isLandingPageOpen = false;
      }
    }
  }

  public navigateTo(route: 'landing' | 'login' | 'workspace', pushState: boolean = true): void {
    this.currentRoute = route;
    if (route === 'landing') {
      localStorage.setItem('agent_logged_out', 'true');
      this.isLandingPageOpen = true;
    } else if (route === 'workspace') {
      localStorage.removeItem('agent_logged_out');
      this.isLandingPageOpen = false;
    }

    if (pushState) {
      const urlPath = route === 'workspace' ? '/workspace' : (route === 'login' ? '/login' : '/landing');
      if (window.location.pathname !== urlPath) {
        history.pushState(null, '', urlPath);
      }
    }
    this.render();
  }
  
  private aiMode: 'agent' | 'ask' = 'agent';
  private isExecuting: boolean = false;
  private currentStatusText: string = 'STANDBY // READY';
  private taskPrompt: string = '';
  private crtEnabled: boolean = false;
  private crtColorTheme: 'green' | 'amber' | 'cyan' | 'white' = 'cyan';

  // Enterprise Autonomous CI/CD Pipeline & Workflow Orchestrator Engine State
  public activeViewMode: 'agent' | 'ask' | 'workflow' | 'cicd' = 'agent';
  public activeWorkflow: any = {
    id: 'tpl-pr-governance',
    name: 'GitHub PR Auto-Review & Gemini SAST Audit',
    description: 'Ingests incoming GitHub PR Webhooks, runs static Shannon entropy scan, dispatches Gemini code review, and posts automated PR decisions.',
    nodes: [
      { id: 'node-1', type: 'TRIGGER_WEBHOOK', name: 'GitHub Webhook Ingest', description: 'Listens for pull_request.opened events', posX: 40, posY: 140, config: { event: 'pull_request.opened', repo: 'spring-enterprise-service' } },
      { id: 'node-2', type: 'CODE_TRANSFORM', name: 'Normalize PR Diff', description: 'Extracts changed source files & metadata', posX: 280, posY: 140, config: { filterExt: '.java,.ts,.js' } },
      { id: 'node-3', type: 'SECURITY_SAST_SCAN', name: 'SAST Secret Scanner', description: 'Detects leaked tokens & entropy anomalies', posX: 520, posY: 140, config: { failOnCritical: true } },
      { id: 'node-4', type: 'BRANCH_IF_ELSE', name: 'Security Quality Gate', description: 'Evaluates isSecure == true condition', posX: 760, posY: 140, config: { conditionField: 'isSecure', expectedValue: 'true' } },
      { id: 'node-5', type: 'AI_GEMINI_REASONER', name: 'Gemini AI PR Reviewer', description: 'Multimodal architectural evaluation', posX: 1000, posY: 80, config: { prompt: 'Perform code review on PR files and generate executive summary.' } },
      { id: 'node-6', type: 'FILE_SYSTEM_OUTPUT', name: 'Write Governance Report', description: 'Saves review report directly to workspace', posX: 1240, posY: 80, config: { fileName: 'governance-pr-audit.md' } }
    ],
    edges: [
      { id: 'e-1', source: 'node-1', target: 'node-2', sourceHandle: 'default' },
      { id: 'e-2', source: 'node-2', target: 'node-3', sourceHandle: 'default' },
      { id: 'e-3', source: 'node-3', target: 'node-4', sourceHandle: 'default' },
      { id: 'e-4', source: 'node-4', target: 'node-5', sourceHandle: 'true' },
      { id: 'e-5', source: 'node-5', target: 'node-6', sourceHandle: 'default' }
    ]
  };
  public workflowTemplatesList: any[] = [];
  public selectedWorkflowNodeId: string | null = 'node-1';
  public activeWorkflowRun: any = null;
  public isWorkflowExecuting: boolean = false;
  public workflowExecutionLogs: string[] = [];

  public activePipelineRun: any = {
    id: 'pipe-init',
    repoName: 'spring-enterprise-service',
    branch: 'main',
    commitHash: 'commit-7a9f21d',
    triggerType: 'MANUAL_UI',
    status: 'SUCCESS',
    qualityGrade: 'A+',
    governanceDecision: 'APPROVED_FOR_DEPLOYMENT',
    totalTests: 24,
    passedTests: 24,
    failedTests: 0,
    coveragePercent: 94.5,
    artifactName: 'spring-enterprise-service-1.0.0.jar',
    artifactSha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    durationMs: 3840,
    createdTimeStr: '12:45:00',
    stages: [
      { id: 'stage-1', name: 'FETCH_REPO', description: 'Ingest Repository & Checkout', status: 'SUCCESS', durationMs: 620 },
      { id: 'stage-2', name: 'LINT_AST', description: 'Static AST Analysis & Syntax Validation', status: 'SUCCESS', durationMs: 710 },
      { id: 'stage-3', name: 'TEST_SUITE', description: 'Automated Unit & Integration Test Suite', status: 'SUCCESS', durationMs: 950 },
      { id: 'stage-4', name: 'SECURITY_SAST', description: 'Security SAST & Secret Leak Audit', status: 'SUCCESS', durationMs: 580 },
      { id: 'stage-5', name: 'BUILD_ARTIFACT', description: 'Package Binary & Integrity Checksum', status: 'SUCCESS', durationMs: 680 },
      { id: 'stage-6', name: 'GOVERNANCE', description: 'Code Quality Gate & Governance Badge', status: 'SUCCESS', durationMs: 300 }
    ],
    logs: [
      '[12:45:00.120] Cloning repository: spring-enterprise-service (branch: main)',
      '[12:45:00.740] Checking out commit 7a9f21d (HEAD -> main)',
      '[12:45:01.450] Executing static AST analyzer across Java, TypeScript, and HTML files...',
      '[12:45:02.160] Lint check: 0 syntax errors, 0 unbalanced brackets, 0 undefined imports.',
      '[12:45:02.660] Running Maven / JUnit 5 & Jest test runners in sandboxed worker...',
      '[12:45:02.810]  [TEST] UserServiceTest.testAuthenticationToken() -> PASSED (14ms)',
      '[12:45:02.940]  [TEST] SecurityScannerTest.testSecretDetection() -> PASSED (28ms)',
      '[12:45:03.110]  [TEST] RestApiIntegrationTest.testEndpointResponse() -> PASSED (45ms)',
      '[12:45:03.220]  [TEST] FrontendComponentTest.testDomRender() -> PASSED (8ms)',
      '[12:45:03.610] Test Results: 24/24 Passed (0 Failed, 0 Skipped). Code Coverage: 94.5%',
      '[12:45:04.210] Starting Shannon Entropy and regex SAST scan for secret leakage & CVEs...',
      '[12:45:04.790] Security Audit: 0 High/Critical vulnerabilities found. Grade A+ (100/100).',
      '[12:45:05.470] Packaging production bundle: spring-enterprise-service-1.0.0.jar',
      '[12:45:06.150] Artifact built: target/spring-enterprise-service-1.0.0.jar (SHA-256: 9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08)',
      '[12:45:06.450] Evaluating Enterprise Quality Gate compliance rules...',
      '[12:45:06.750] Quality Gate: PASSED (Grade A+). All security, coverage, and stability metrics met.',
      '[12:45:06.850] Automated PR Status Check: SUCCESS (commit: 7a9f21d)'
    ],
    securityFindings: []
  };
  public pipelineHistoryList: any[] = [];
  public pipelineTerminalLogs: string[] = [];
  public pipelineTriggerModalOpen: boolean = false;
  public pipelineRepoInput: string = 'spring-enterprise-service';
  public pipelineBranchInput: string = 'main';
  
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
  private panelWidthPercent: number = 48;
  private isResizing: boolean = false;
  
  private activeWorkspaceTab: 'browser' | 'editor' | 'diff' | 'console' | 'tuning' | 'checkpoints' = 'browser';
  private previewViewport: 'desktop' | 'tablet' | 'mobile' = 'desktop';
  private previewZoom: number = 100;
  private isAppReady: boolean = false;
  private generatedSrcDoc: string = '';
  
  // Embedded Console Telemetry
  private consoleLogs: Array<{ level: 'log' | 'info' | 'warn' | 'error'; message: string; timestamp: string }> = [];
  private consoleFilter: 'all' | 'log' | 'warn' | 'error' = 'all';
  private consoleCommandInput: string = '';

  // Side-by-Side Diff Viewer
  private diffSelectedFile: string = 'index.html';
  private diffOriginalContent: string = '';
  private diffModifiedContent: string = '';
  
  private temperature: number = 0.3;
  private systemInstructionOpen: boolean = false;
  private systemInstruction: string = 'You are an autonomous AI software engineer adhering strictly to Brauncore and Dieter Rams Functionalism. Build clean, minimal, robust full-stack applications with high usability and monochrome aesthetics.';
  
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
  
  // Snapshots & Skills
  private checkpoints: CheckpointItem[] = [];
  private skillsList: SkillItem[] = [];
  private personasList: AgentPersona[] = [];
  
  private showSkillsModal: boolean = false;
  private showUserMenu: boolean = false;
  private showFolderModal: boolean = false;
  private customFolderInput: string = '';
  private showGitHubLoginModal: boolean = false;
  private gitHubLoginError: string = '';
  private isLoggingInGitHub: boolean = false;
  private isCreatingRepo: boolean = false;
  
  // Code Snippet Export
  private promptTitle: string = 'Workspace Prompt';
  private isEditingPromptTitle: boolean = false;
  private showGetCodeModal: boolean = false;
  private getCodeActiveTab: 'curl' | 'python' | 'typescript' | 'java' = 'curl';
  private studioCodeSnippets: { curl: string; python: string; typescript: string; java: string } | null = null;
  private selectedModelId: string = 'deepseek-coder';
  
  private progressPercent: number = 0;
  private landingCodeTab: 'ts' | 'curl' | 'py' = 'ts';

  constructor(container: HTMLElement) {
    this.container = container;
    this.init();
  }

  private formatElapsedTime(): string {
    const mins = Math.floor(this.executionElapsedSeconds / 60);
    const secs = this.executionElapsedSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  private startExecutionTimer(): void {
    this.executionElapsedSeconds = 0;
    if (this.executionTimerInterval) clearInterval(this.executionTimerInterval);
    this.executionTimerInterval = setInterval(() => {
      this.executionElapsedSeconds++;
      const timerEl = document.getElementById('liveExecutionTimerBadge');
      if (timerEl) {
        timerEl.innerHTML = `${MAC_ICONS.watch} <span>${this.formatElapsedTime()}</span>`;
      }
    }, 1000);
  }

  private stopExecutionTimer(): void {
    if (this.executionTimerInterval) {
      clearInterval(this.executionTimerInterval);
      this.executionTimerInterval = null;
    }
  }

  public handleLogoutAction(): void {
    localStorage.setItem('agent_logged_out', 'true');
    localStorage.removeItem('github_token');
    localStorage.removeItem('agent_tenant');
    localStorage.removeItem('agent_user_profile');
    this.userProfile = {
      login: 'Guest',
      name: 'Guest User',
      avatar_url: 'https://avatars.githubusercontent.com/u/9919?v=4',
      organization: 'Local Workspace',
      authenticated: false
    };
    this.currentTenant = 'guest';
    this.showGitHubLoginModal = false;
    this.navigateTo('landing');
  }

  public showToast(message: string, isError: boolean = false): void {
    const existing = document.getElementById('globalToast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'globalToast';
    toast.className = `fixed bottom-6 right-6 z-50 px-4 py-3 border shadow-2xl flex items-center gap-2.5 text-xs font-mono font-bold uppercase animate-fadeIn ${
      isError 
        ? 'bg-[#1a0505] border-red-500 text-red-300' 
        : 'bg-[#000000] border-white text-white'
    }`;
    toast.innerHTML = `
      <span class="w-2 h-2 ${isError ? 'bg-red-500' : 'bg-white'} block flex-shrink-0"></span>
      <span>${this.escapeHtml(message)}</span>
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('opacity-0', 'transition-opacity', 'duration-200');
      setTimeout(() => toast.remove(), 200);
    }, 2800);
  }

  public async handleOpenFolderInExplorer(): Promise<void> {
    try {
      const res = await api.openFolderInOs();
      this.showToast(`Opened in File Explorer: ${this.currentWorkspacePath}`);
    } catch (e: any) {
      this.showToast(`Failed to open Explorer: ${e.message}`, true);
    }
  }

  public async handleSelectFolder(newPath: string): Promise<void> {
    if (!newPath || !newPath.trim()) return;
    try {
      const cleanPath = newPath.trim();
      const res = await api.setFolder(cleanPath);
      this.currentWorkspacePath = (res && res.currentFolder) ? res.currentFolder : cleanPath;
      this.showFolderModal = false;
      await this.loadFiles();
      await this.bundleProjectToSrcDoc();
      this.updatePreviewIframe();
      this.render();
      this.showToast(`Active folder set: ${this.getFolderDisplayBasename()} (${this.fileList.length} files)`);
    } catch (e: any) {
      this.showToast(`Error changing folder: ${e.message}`, true);
    }
  }

  public async handleNativeFolderPick(): Promise<void> {
    this.showFolderModal = false;
    await this.handlePickFolderOsDialog();
  }

  public async handlePickFolderOsDialog(): Promise<void> {
    try {
      if (typeof (window as any).showDirectoryPicker === 'function') {
        try {
          const dirHandle = await (window as any).showDirectoryPicker({
            id: 'agent_folder_selector',
            mode: 'readwrite'
          });
          if (dirHandle && dirHandle.name) {
            const pathRes = await api.setFolder(dirHandle.name);
            this.currentWorkspacePath = (pathRes && pathRes.currentFolder) ? pathRes.currentFolder : dirHandle.name;
            await this.loadFiles();
            await this.bundleProjectToSrcDoc();
            this.updatePreviewIframe();
            this.render();
            this.showToast(`Active folder: ${this.getFolderDisplayBasename()} (${this.fileList.length} files)`);
            return;
          }
        } catch (err: any) {
          if (err.name === 'AbortError') return;
        }
      }

      this.showToast('Opening Windows Folder Dialog...');
      const res = await api.pickFolderDialog();
      if (res && res.status === 'SUCCESS' && res.folderPath) {
        this.currentWorkspacePath = res.folderPath;
        if (Array.isArray(res.files)) {
          this.fileList = res.files;
        } else {
          await this.loadFiles();
        }
        await this.bundleProjectToSrcDoc();
        this.updatePreviewIframe();
        this.render();
        this.showToast(`Active folder: ${this.getFolderDisplayBasename()} (${this.fileList.length} files)`);
      } else {
        this.showFolderModal = true;
        this.render();
      }
    } catch (e: any) {
      this.showFolderModal = true;
      this.render();
    }
  }

  private async init() {
    // Attach tactile Web Audio acoustic feedback for all CRT & mechanical interactions
    soundEngine.attachGlobalInteractivity();

    this.currentTenant = localStorage.getItem('agent_tenant') || 'default';
    this.handleRouteFromUrl();
    this.loadSessionsFromStorage();

    const savedProfile = localStorage.getItem('agent_user_profile');
    if (localStorage.getItem('agent_logged_out') === 'true') {
      this.userProfile = {
        login: 'Guest',
        name: 'Guest User',
        avatar_url: 'https://avatars.githubusercontent.com/u/9919?v=4',
        organization: 'Local Workspace',
        authenticated: false
      };
      this.currentTenant = 'guest';
    } else if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        if (parsed && parsed.login && parsed.login !== 'Guest') {
          this.userProfile = { ...parsed, authenticated: true };
          this.currentTenant = (parsed.login || 'default').toLowerCase();
        }
      } catch {}
    } else {
      this.userProfile = {
        login: 'Developer',
        name: 'Local Developer',
        organization: 'Local Workspace',
        avatar_url: 'https://avatars.githubusercontent.com/u/9919?v=4',
        authenticated: true
      };
      this.currentTenant = 'default';
      localStorage.setItem('agent_user_profile', JSON.stringify(this.userProfile));
    }

    // Capture console output from the sandboxed iframe runner
    window.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'PREVIEW_CONSOLE_LOG') {
        this.consoleLogs.push({
          level: event.data.level || 'log',
          message: event.data.message || '',
          timestamp: event.data.timestamp || new Date().toLocaleTimeString()
        });
        if (this.consoleLogs.length > 200) this.consoleLogs.shift();
        if (this.activeWorkspaceTab === 'console') {
          this.render();
        }
      }
    });

    this.render();
    
    // Background loaders
    try {
      const folder = await api.getCurrentFolder();
      if (folder && folder.folderPath) this.currentWorkspacePath = folder.folderPath;
      this.fileList = await api.getFiles();
      this.skillsList = await api.getSkills();
      this.personasList = await api.getPersonas();
      this.commonFolders = await api.getCommonFolders();
      this.workflowTemplatesList = await api.getWorkflowTemplates();
      if (this.workflowTemplatesList && this.workflowTemplatesList.length > 0) {
        this.activeWorkflow = this.workflowTemplatesList[0];
        if (this.activeWorkflow.nodes && this.activeWorkflow.nodes.length > 0) {
          this.selectedWorkflowNodeId = this.activeWorkflow.nodes[0].id;
        }
      }
      await this.loadFiles();
      await this.bundleProjectToSrcDoc();
      this.render();
      this.updatePreviewIframe();
    } catch {}

    // Subscribe to SSE telemetry events
    sseService.subscribe((event: AgentEvent) => this.handleAgentEvent(event));

    window.addEventListener('popstate', () => {
      this.handleRouteFromUrl();
      this.render();
      this.updatePreviewIframe();
    });
    
    this.render();
    this.updatePreviewIframe();
  }

  private recentHandledEvents = new Set<string>();

  private handleAgentEvent(event: AgentEvent) {
    const timestamp = event.timestamp || new Date().toLocaleTimeString();
    const eventKey = `${event.type}:${event.content || ''}`;

    if (this.recentHandledEvents.has(eventKey)) {
      return;
    }
    this.recentHandledEvents.add(eventKey);
    setTimeout(() => this.recentHandledEvents.delete(eventKey), 2000);

    // Record in live backend logs
    this.backendLogs.push({
      role: (event.metadata && (event.metadata as any)['role']) || event.source || 'ARCHITECT',
      text: event.content || '',
      time: timestamp,
      type: event.type
    });
    if (this.backendLogs.length > 50) this.backendLogs.shift();

    if (event.type === 'PLAN_PROPOSAL') {
      soundEngine.playCrtBeep(880, 0.1);
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
      soundEngine.playCrtBeep(750, 0.12);
      const content = event.content || 'Please select an option to proceed:';
      const existing = this.messages.find(m => m.type === 'decision' && m.content === content);
      if (existing) return;

      const rawOptions = (event.metadata && (event.metadata as any)['options']) || [
        { id: 'opt_a', label: 'Brauncore Strict Monochrome Theme', action: 'dark_theme' },
        { id: 'opt_b', label: 'Classic Grid Functionalism', action: 'classic_theme' }
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
      const fileName = (event.metadata ? (event.metadata as any)['fileName'] : '') || event.content || '';
      const metaPercent = event.metadata && typeof (event.metadata as any)['progressPercent'] === 'number' ? (event.metadata as any)['progressPercent'] : null;
      const statusMeta = event.metadata ? (event.metadata as any)['status'] : '';
      
      if (fileName) {
        this.latestSavedFile = { name: fileName, time: timestamp };
        soundEngine.playFloppySeek();
      }

      let completedCount = 0;
      let totalCount = 4;

      for (let i = this.messages.length - 1; i >= 0; i--) {
        const msg = this.messages[i];
        if (msg.type === 'plan' && msg.steps && msg.steps.length > 0) {
          totalCount = msg.steps.length;
          let matched = false;
          for (let sIdx = 0; sIdx < msg.steps.length; sIdx++) {
            const st = msg.steps[sIdx];
            const isDirectMatch = st.file && fileName && (fileName.toLowerCase().includes(st.file.toLowerCase()) || st.file.toLowerCase().includes(fileName.toLowerCase()));
            if (isDirectMatch) {
              matched = true;
              if (statusMeta === 'in_progress') {
                st.status = 'in_progress';
              } else {
                st.completed = true;
                st.status = 'completed';
                if (sIdx + 1 < msg.steps.length && msg.steps[sIdx + 1].status === 'pending') {
                  msg.steps[sIdx + 1].status = 'in_progress';
                }
              }
            }
          }
          if (!matched && statusMeta !== 'in_progress') {
            const firstIncomplete = msg.steps.find(s => !s.completed);
            if (firstIncomplete) {
              firstIncomplete.completed = true;
              firstIncomplete.status = 'completed';
              const nextIncomplete = msg.steps.find(s => !s.completed);
              if (nextIncomplete) nextIncomplete.status = 'in_progress';
            }
          }
          completedCount = msg.steps.filter(s => s.completed).length;
          break;
        }
      }

      const calculatedPercent = Math.min(100, Math.round((completedCount / totalCount) * 100));
      this.progressPercent = metaPercent !== null ? Math.max(this.progressPercent, metaPercent) : Math.max(this.progressPercent, calculatedPercent);
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
        soundEngine.playFloppySeek();
        const targetFile = fileNameMeta || event.content.replace(/^Writing to file:\s*/i, '').trim();
        if (targetFile) {
          this.latestSavedFile = { name: targetFile, time: timestamp };
          setTimeout(async () => {
            const res = await api.getFileContent(targetFile);
            if (res && res.content && res.content.trim().length > 0) {
              this.selectedFile = { name: targetFile, path: targetFile, isDirectory: false };
              this.fileContent = res.content;
              this.updateEditorContent();
              await this.bundleProjectToSrcDoc();
              this.updatePreviewIframe();
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
        title: `Security Audit (Grade ${audit.grade || 'A'} • Score ${audit.score || '98'}/100)`,
        content: event.content,
        timestamp
      });
      this.render();
      this.scrollToBottom();
    } else if (event.type === 'RESET') {
      this.messages = [];
      this.backendLogs = [];
      this.isExecuting = false;
      this.stopExecutionTimer();
      this.activeSwarmRole = 'IDLE';
      this.currentStatusText = 'STANDBY // READY';
      this.progressPercent = 0;
      this.render();
    } else if (event.type === 'ANSWER') {
      this.isExecuting = false;
      this.stopExecutionTimer();
      this.currentStatusText = 'READY';
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
    } else if (event.type === 'PIPELINE_TRIGGERED') {
      soundEngine.playLeverClack();
      this.activePipelineRun = (event.metadata && (event.metadata as any)['pipeline']) || null;
      this.pipelineTerminalLogs = [`[>] Pipeline ${this.activePipelineRun?.id} triggered for [${this.activePipelineRun?.repoName}:${this.activePipelineRun?.branch}]`];
      this.render();
    } else if (event.type === 'STAGE_START') {
      soundEngine.playMechanicalKeyboardClick();
      const stage = event.metadata ? (event.metadata as any)['stage'] : null;
      if (this.activePipelineRun && stage) {
        const found = this.activePipelineRun.stages?.find((s: any) => s.id === stage.id || s.name === stage.name);
        if (found) {
          found.status = 'RUNNING';
          found.startTime = stage.startTime;
        }
      }
      this.render();
    } else if (event.type === 'STAGE_COMPLETE') {
      soundEngine.playCrtClick();
      const stage = event.metadata ? (event.metadata as any)['stage'] : null;
      if (this.activePipelineRun && stage) {
        const found = this.activePipelineRun.stages?.find((s: any) => s.id === stage.id || s.name === stage.name);
        if (found) {
          found.status = 'SUCCESS';
          found.durationMs = stage.durationMs;
        }
      }
      this.render();
    } else if (event.type === 'PIPELINE_LOG') {
      const logLine = (event.metadata && (event.metadata as any)['log']) || event.content;
      if (logLine) {
        this.pipelineTerminalLogs.push(logLine);
        if (this.pipelineTerminalLogs.length > 300) this.pipelineTerminalLogs.shift();
        this.updatePipelineTerminal();
      }
    } else if (event.type === 'PIPELINE_COMPLETE') {
      soundEngine.playSuccessChime();
      this.activePipelineRun = (event.metadata && (event.metadata as any)['pipeline']) || this.activePipelineRun;
      if (this.activePipelineRun) this.activePipelineRun.status = 'SUCCESS';
      this.render();
    } else if (event.type === 'PIPELINE_FAILED') {
      soundEngine.playErrorBuzz();
      if (this.activePipelineRun) this.activePipelineRun.status = 'FAILED';
      this.render();
    } else if (event.type === 'WORKFLOW_STARTED') {
      soundEngine.playLeverClack();
      this.isWorkflowExecuting = true;
      this.activeWorkflowRun = (event.metadata && (event.metadata as any)['workflow']) || null;
      this.workflowExecutionLogs = [`[*] Workflow initiated: ${this.activeWorkflow?.name || 'Automation Workflow'}`];
      if (this.activeWorkflow && this.activeWorkflow.nodes) {
        this.activeWorkflow.nodes.forEach((n: any) => { n.status = 'PENDING'; n.durationMs = 0; });
      }
      this.render();
    } else if (event.type === 'NODE_STARTED') {
      soundEngine.playMechanicalKeyboardClick();
      const nodeId = (event.metadata && (event.metadata as any)['nodeId']);
      if (this.activeWorkflow && this.activeWorkflow.nodes) {
        const found = this.activeWorkflow.nodes.find((n: any) => n.id === nodeId);
        if (found) found.status = 'RUNNING';
      }
      if (event.content) this.workflowExecutionLogs.push(event.content);
      this.render();
    } else if (event.type === 'NODE_SUCCESS') {
      soundEngine.playCrtClick();
      const nodeId = (event.metadata && (event.metadata as any)['nodeId']);
      const result = (event.metadata && (event.metadata as any)['result']);
      if (this.activeWorkflow && this.activeWorkflow.nodes) {
        const found = this.activeWorkflow.nodes.find((n: any) => n.id === nodeId);
        if (found) {
          found.status = 'SUCCESS';
          found.durationMs = result?.durationMs;
          found.outputData = result?.outputData;
        }
      }
      if (this.activeWorkflowRun && this.activeWorkflowRun.nodeResults && result) {
        this.activeWorkflowRun.nodeResults[nodeId] = result;
      }
      if (event.content) this.workflowExecutionLogs.push(event.content);
      this.render();
    } else if (event.type === 'NODE_FAILED') {
      soundEngine.playErrorBuzz();
      const nodeId = (event.metadata && (event.metadata as any)['nodeId']);
      if (this.activeWorkflow && this.activeWorkflow.nodes) {
        const found = this.activeWorkflow.nodes.find((n: any) => n.id === nodeId);
        if (found) found.status = 'FAILED';
      }
      if (event.content) this.workflowExecutionLogs.push(event.content);
      this.render();
    } else if (event.type === 'WORKFLOW_COMPLETED') {
      soundEngine.playSuccessChime();
      this.isWorkflowExecuting = false;
      this.activeWorkflowRun = (event.metadata && (event.metadata as any)['workflow']) || this.activeWorkflowRun;
      if (event.content) this.workflowExecutionLogs.push(event.content);
      this.render();
    } else if (event.type === 'FINISH') {
      soundEngine.playSuccessChime();
      this.isExecuting = false;
      this.stopExecutionTimer();
      this.activeSwarmRole = 'COMPLETE';
      this.currentStatusText = 'SYNTHESIS COMPLETE';
      this.progressPercent = 100;
      this.showSidePanel = true;
      this.activeWorkspaceTab = 'browser';
      
      for (let i = this.messages.length - 1; i >= 0; i--) {
        const msg = this.messages[i];
        if (msg.type === 'plan' && msg.steps) {
          msg.steps.forEach(s => {
            s.completed = true;
            s.status = 'completed';
          });
        }
      }
      this.loadFiles().then(async () => {
        await this.bundleProjectToSrcDoc();
        this.render();
        this.updatePreviewIframe();
        this.scrollToBottom();
      });
    }
  }

  public async loadFiles() {
    try {
      this.fileList = await api.getFiles();
      if (!this.selectedFile && this.fileList.length > 0) {
        const defaultHtml = this.fileList.find(f => f.path.endsWith('index.html')) || this.fileList[0];
        this.selectedFile = defaultHtml;
        const res = await api.getFileContent(defaultHtml.path);
        this.fileContent = res.content || '';
      }
    } catch {}
  }

  public async bundleProjectToSrcDoc(): Promise<string> {
    try {
      if (!this.fileList || this.fileList.length === 0) {
        this.fileList = await api.getFiles();
      }

      // 1. Find primary HTML file
      let htmlFile = this.fileList.find(f => !f.isDirectory && f.name.toLowerCase() === 'index.html');
      if (!htmlFile) {
        htmlFile = this.fileList.find(f => !f.isDirectory && f.name.toLowerCase().endsWith('.html'));
      }

      let html = '';
      if (htmlFile) {
        const res = await api.getFileContent(htmlFile.path);
        html = res?.content || '';
      } else {
        const directIndex = await api.getFileContent('index.html');
        html = directIndex?.content || '';
      }

      if (!html || html.trim().length === 0) {
        // If no index.html exists, auto-synthesize an interactive HTML5 harness with Tailwind, Lucide, and Three.js
        html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Outfit:wght@400;600;700;900&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Outfit', sans-serif; background: #090a0f; color: #f8fafc; overflow-x: hidden; }
  </style>
</head>
<body>
  <div id="app"></div>
</body>
</html>`;
      } else if (!html.toLowerCase().includes('<body') && !html.toLowerCase().includes('<html')) {
        // Wrap raw body HTML snippet in complete document
        html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Outfit:wght@400;600;700;900&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Outfit', sans-serif; background: #090a0f; color: #f8fafc; }
  </style>
</head>
<body>
  ${html}
</body>
</html>`;
      }

      // 2. Fetch all CSS files in workspace
      const cssFiles = this.fileList.filter(f => !f.isDirectory && f.name.toLowerCase().endsWith('.css'));
      let combinedCss = '';
      for (const cf of cssFiles) {
        const res = await api.getFileContent(cf.path);
        if (res && res.content) {
          combinedCss += `\n/* ${cf.name} */\n${res.content}\n`;
        }
      }
      if (!combinedCss) {
        for (const name of ['styles.css', 'style.css', 'app.css', 'main.css']) {
          const res = await api.getFileContent(name);
          if (res && res.content) {
            combinedCss += `\n/* ${name} */\n${res.content}\n`;
            break;
          }
        }
      }

      // 3. Fetch all JS files in workspace
      const jsFiles = this.fileList.filter(f => !f.isDirectory && f.name.toLowerCase().endsWith('.js'));
      let combinedJs = '';
      for (const jf of jsFiles) {
        const res = await api.getFileContent(jf.path);
        if (res && res.content) {
          combinedJs += `\n// ${jf.name}\n${res.content}\n`;
        }
      }
      if (!combinedJs) {
        for (const name of ['script.js', 'game.js', 'app.js', 'main.js']) {
          const res = await api.getFileContent(name);
          if (res && res.content) {
            combinedJs += `\n// ${name}\n${res.content}\n`;
            break;
          }
        }
      }

      // 4. Strip relative local CSS links and JS script tags to prevent 404 network errors
      html = html.replace(/<link\s+[^>]*rel=["']stylesheet["'][^>]*href=["'](?!http|https|\/\/)[^"']+["'][^>]*>/gi, '');
      html = html.replace(/<script\s+[^>]*src=["'](?!http|https|\/\/)[^"']+["'][^>]*><\/script>/gi, '');

      // 5. Build Sandboxed Bridge Script (Console logger + global error suppressor + Mock Audio + Three.js importmap)
      const isEsModule = /^\s*import\s+|^\s*export\s+/m.test(combinedJs);
      const importMapScript = `
        <script type="importmap">
        {
          "imports": {
            "three": "https://unpkg.com/three@0.160.0/build/three.module.js",
            "three/addons/": "https://unpkg.com/three@0.160.0/examples/jsm/",
            "three/examples/jsm/": "https://unpkg.com/three@0.160.0/examples/jsm/"
          }
        }
        </script>
      `;

      const sandboxBridgeScript = `
        ${importMapScript}
        <script>
          (function() {
            // Forward console logs to host IDE
            const send = (level, args) => {
              try {
                const msg = Array.from(args).map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
                window.parent.postMessage({ type: 'PREVIEW_CONSOLE_LOG', level, message: msg, timestamp: new Date().toLocaleTimeString() }, '*');
              } catch(e) {}
            };
            const _log = console.log, _warn = console.warn, _error = console.error, _info = console.info;
            console.log = function() { _log.apply(console, arguments); send('log', arguments); };
            console.warn = function() { _warn.apply(console, arguments); send('warn', arguments); };
            console.error = function() { _error.apply(console, arguments); send('error', arguments); };
            console.info = function() { _info.apply(console, arguments); send('info', arguments); };

            // Global error catcher
            window.addEventListener('error', function(e) {
              send('error', ['[Runtime Error]', e.message, 'at', (e.filename || 'script.js') + ':' + e.lineno]);
            });
            window.addEventListener('unhandledrejection', function(e) {
              send('error', ['[Unhandled Promise Rejection]', e.reason]);
            });

            // Graceful Mock for Audio files (prevents crashes when audio files are absent)
            const NativeAudio = window.Audio;
            window.Audio = function(src) {
              try {
                const a = new NativeAudio(src);
                a.addEventListener('error', function() { /* suppress missing sound file error */ });
                return a;
              } catch(e) {
                return { play: () => Promise.resolve(), pause: () => {}, addEventListener: () => {} };
              }
            };
          })();
        </script>
      `;

      // 6. Inject CSS and Bridge into <head>
      let headInjection = sandboxBridgeScript;
      if (combinedCss.trim().length > 0) {
        headInjection += `\n<style>\n${combinedCss}\n</style>\n`;
      }

      if (html.includes('</head>')) {
        html = html.replace('</head>', `${headInjection}</head>`);
      } else if (html.includes('<head>')) {
        html = html.replace('<head>', `<head>${headInjection}`);
      } else {
        html = `${headInjection}${html}`;
      }

      // 7. Inject JS safely before </body>
      if (combinedJs.trim().length > 0) {
        const scriptInjection = isEsModule
          ? `\n<script type="module">\n${combinedJs}\n</script>\n`
          : `\n<script>\ntry {\n${combinedJs}\n} catch(err) { console.error('[Execution Error]:', err); }\n</script>\n`;

        if (html.includes('</body>')) {
          html = html.replace('</body>', `${scriptInjection}</body>`);
        } else {
          html = `${html}${scriptInjection}`;
        }
      }

      this.generatedSrcDoc = html;
      this.isAppReady = true;
      return html;
    } catch (err) {
      console.error('Failed to bundle project for live preview:', err);
      return '';
    }
  }

  public updatePreviewIframe() {
    const iframe = document.getElementById('previewIframe') as HTMLIFrameElement;
    if (iframe) {
      if (this.generatedSrcDoc && this.generatedSrcDoc.trim().length > 0) {
        iframe.srcdoc = this.generatedSrcDoc;
      } else {
        iframe.src = 'http://localhost:3001/?t=' + Date.now();
      }
      const emptyState = document.getElementById('previewEmptyState');
      if (emptyState) emptyState.classList.add('hidden');
    }
  }

  public updateEditorContent() {
    const textarea = document.getElementById('editorTextarea') as HTMLTextAreaElement;
    if (textarea) textarea.value = this.fileContent;
  }

  public async executePlan(taskPrompt: string) {
    soundEngine.playCrtDegauss();
    this.isExecuting = true;
    this.startExecutionTimer();
    this.activeWorkspaceTab = 'browser';
    this.currentStatusText = 'SWARM SYNTHESIZING CODEBASE';

    for (let i = this.messages.length - 1; i >= 0; i--) {
      const msg = this.messages[i];
      if (msg.type === 'plan' && msg.steps && msg.steps.length > 0) {
        msg.steps[0].status = 'in_progress';
        break;
      }
    }

    this.render();
    this.scrollToBottom();

    try {
      await api.runTask({
        prompt: `[EXECUTE] ${taskPrompt}`,
        mode: 'agent',
        systemInstruction: this.systemInstruction,
        temperature: this.temperature,
        model: this.selectedModelId,
        title: this.promptTitle
      });
    } catch (err: any) {
      this.isExecuting = false;
      this.stopExecutionTimer();
      this.currentStatusText = 'CONNECTION ERROR';
      this.messages.push({
        id: Math.random().toString(),
        sender: 'system',
        type: 'text',
        mode: this.aiMode,
        content: `[!] Failed to reach backend: ${err?.message || 'Connection refused'}. Ensure backend is running on port 8080.`,
        timestamp: new Date().toLocaleTimeString()
      });
      this.render();
      this.scrollToBottom();
    }
  }

  public async submitTask() {
    const inputEl = document.getElementById('taskInput') as HTMLTextAreaElement;
    const prompt = (this.taskPrompt || inputEl?.value || '').trim();
    if (!prompt) return;

    this.taskPrompt = '';
    if (inputEl) inputEl.value = '';

    this.messages.push({
      id: Math.random().toString(),
      sender: 'user',
      type: 'text',
      content: prompt,
      mode: 'agent',
      timestamp: new Date().toLocaleTimeString()
    });

    const planSteps: PlanStep[] = [
      { id: '1', file: 'index.html', label: 'DOM Hierarchy & Functional Layout (index.html)', status: 'in_progress', completed: false },
      { id: '2', file: 'styles.css', label: 'Responsive Modern Stylesheet (styles.css)', status: 'pending', completed: false },
      { id: '3', file: 'script.js', label: 'Interactive State Machine & Logic (script.js)', status: 'pending', completed: false },
      { id: '4', file: 'README.md', label: 'Technical Specifications & Architecture (README.md)', status: 'pending', completed: false }
    ];

    this.messages.push({
      id: Math.random().toString(),
      sender: 'agent',
      type: 'plan',
      title: 'Proposed Implementation Plan',
      planTitle: 'Proposed Implementation Plan',
      taskPrompt: prompt,
      mode: 'agent',
      content: `Decomposed architecture for prompt: "${prompt}". Autonomous multi-agent pipeline synthesizing codebase:`,
      steps: planSteps,
      timestamp: new Date().toLocaleTimeString()
    });

    this.executePlan(prompt);
    this.updateSessions(prompt);
    this.render();
    this.scrollToBottom();
  }

  private async stopExecution() {
    soundEngine.playErrorBuzz();
    this.isExecuting = false;
    this.stopExecutionTimer();
    this.currentStatusText = 'HALTED BY USER';
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
    try {
      await api.stopTask();
    } catch {}
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
          if (!this.isExecuting) {
            this.messages.forEach(m => {
              if (m.type === 'plan' && m.steps) {
                m.steps.forEach(s => {
                  s.completed = true;
                  s.status = 'completed';
                });
              }
            });
          }
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

  // --- HTML Template Getters (Skeuomorphic Retro-Minimalism: Black, White & Signal Orange) ---

  public getWorkspaceHtml(): string {
    return `
      <div class="h-screen w-screen flex flex-row flex-nowrap bg-[#000000] text-[#ffffff] font-sans overflow-hidden text-[13px] select-none relative">

        <!-- 1. LEFT SIDEBAR (Studio Deck Navigation Column) -->
        <aside class="w-[225px] flex flex-col bg-[#0a0a0a] border-r border-[#242424] flex-shrink-0 justify-between z-20 h-full shadow-2xl relative">
          <div class="flex flex-col h-full min-h-0">
            <!-- Studio Brand & Hardware Badge -->
            <div class="px-3.5 py-3 flex items-center justify-between border-b border-[#242424] bg-[#000000]">
              <div class="flex items-center gap-2">
                <span class="text-[#38bdf8] flex-shrink-0">${MAC_ICONS.happyMac}</span>
                <div class="flex items-center gap-1.5">
                  <span class="font-extrabold text-xs text-white uppercase tracking-wider font-mono">SPRINGAI</span>
                  <span class="text-[9px] font-mono font-bold px-1.5 py-0.2 bg-[#38bdf8] text-black rounded-sm">AGENT</span>
                </div>
              </div>
              <span class="led-indicator ${this.isExecuting ? 'led-accent led-pulsing' : 'led-white'}"></span>
            </div>

            <!-- Workspace Directory Selector Badge -->
            <div class="px-2.5 py-2 border-b border-[#242424] bg-[#050505] space-y-1">
              <div class="flex items-center justify-between text-[9px] font-mono text-[#737373] uppercase font-bold">
                <span>📁 WORKSPACE DIR</span>
                <button id="btnOpenExplorerDirect" class="text-[#38bdf8] hover:underline cursor-pointer" title="Open in File Explorer">↗ EXPLORER</button>
              </div>
              <button id="btnOpenFolderModal" class="w-full p-1.5 bg-[#121212] hover:bg-[#181818] border border-[#242424] hover:border-[#38bdf8] rounded text-left flex items-center justify-between gap-1.5 transition group cursor-pointer" title="Change Workspace Folder (${this.currentWorkspacePath})">
                <div class="flex items-center gap-1.5 min-w-0 flex-1">
                  <span class="text-[#38bdf8] text-xs flex-shrink-0">📁</span>
                  <span class="text-[11px] font-mono text-white group-hover:text-[#38bdf8] truncate font-bold">${this.getFolderDisplayBasename()}</span>
                </div>
                <span class="text-[9px] px-1.5 py-0.5 bg-[#202020] rounded text-[#38bdf8] font-mono font-bold flex-shrink-0 group-hover:bg-[#38bdf8] group-hover:text-black transition">CHANGE</span>
              </button>
            </div>

            <!-- Create New Prompt Button (Tactile Hardware Push) -->
            <div class="p-2.5 bg-[#080808] border-b border-[#1c1c1c]">
              <button id="btnNewSession" class="w-full retro-btn retro-btn-accent py-2 text-xs font-mono font-bold flex items-center justify-center gap-2" title="Create New Studio Prompt">
                ${MAC_ICONS.handWrite}
                <span>+ NEW PROMPT</span>
              </button>
            </div>

            <!-- Sessions History -->
            <div class="mt-2 px-2 flex-1 flex flex-col min-h-0">
              <div class="px-2 flex items-center justify-between text-[10px] font-bold text-[#737373] uppercase tracking-wider pb-1 font-mono">
                <span class="flex items-center gap-1.5">${MAC_ICONS.doc} TAPES / HISTORY</span>
                <span class="px-1.5 py-0.2 bg-[#141414] border border-[#242424] rounded text-white">${this.sessions.length}</span>
              </div>
              <div class="mt-1 space-y-1 overflow-y-auto flex-1 custom-scrollbar pr-1">
                ${this.sessions.map(s => `
                  <div class="session-item group px-2.5 py-2 rounded cursor-pointer transition-all flex items-center justify-between border ${this.activeSession?.id === s.id ? 'bg-[#181818] text-white font-bold border-white shadow-md' : 'text-[#a3a3a3] border-transparent hover:bg-[#121212] hover:text-white'}" data-id="${s.id}">
                    <div class="flex items-center gap-2 min-w-0 pr-1 flex-1">
                      <span class="text-[#737373] group-hover:text-white flex-shrink-0">${MAC_ICONS.doc}</span>
                      <div class="flex flex-col min-w-0 flex-1">
                        <span class="text-xs truncate font-mono">${s.title}</span>
                        <span class="text-[9px] text-[#737373] font-mono">${s.time}</span>
                      </div>
                    </div>
                    <button class="btn-delete-session opacity-0 group-hover:opacity-100 p-1 hover:text-[#38bdf8] text-[#737373] transition cursor-pointer" data-id="${s.id}" title="Delete session">
                      ${MAC_ICONS.trash}
                    </button>
                  </div>
                `).join('')}
                ${this.sessions.length === 0 ? '<div class="p-3 text-center text-[#737373] text-[10px] font-mono">NO RECORDED SESSIONS</div>' : ''}
              </div>
            </div>
          </div>

          <!-- Bottom User Account & Logout -->
          <div class="p-2.5 border-t border-[#242424] flex items-center justify-between text-xs text-[#a3a3a3] bg-[#000000]">
            <div class="flex items-center gap-2 truncate cursor-pointer flex-1 mr-1 text-white hover:text-[#38bdf8] transition" id="btnOpenUserAccountModal" title="Manage GitHub Account">
              <img src="${this.getUserAvatarUrl()}" alt="${this.escapeHtml(this.userProfile.login)}" class="w-5 h-5 rounded-full border border-[#38bdf8] object-cover flex-shrink-0 shadow-sm" onerror="this.onerror=null; this.src='https://avatars.githubusercontent.com/u/9919?v=4';" />
              <span class="text-[11px] font-mono text-white truncate font-bold">${this.userProfile.login}</span>
            </div>
            <button id="btnDirectLogoutSidebar" class="retro-btn retro-btn-danger px-2 py-1 text-[10px] font-mono flex items-center gap-1" title="Logout">
              ${MAC_ICONS.bomb}
              <span>OUT</span>
            </button>
          </div>
        </aside>

        <!-- 2. CENTER CHAT & WORKSPACE PANE WITH CRT SCREEN CONTAINER -->
        <section class="flex-1 min-w-0 h-full flex flex-col bg-[#000000] overflow-hidden relative crt-screen-container ${this.crtEnabled ? 'crt-active crt-theme-' + this.crtColorTheme : ''}">
          ${this.crtEnabled ? '<div class="crt-scanline-beam"></div>' : ''}
          
          <!-- TOP HEADER: Fixed Vintage Studio Console Bar with CRT Controls -->
          <header class="h-12 px-3 border-b border-[#242424] bg-[#0a0a0a] flex items-center justify-between flex-shrink-0 z-20 gap-2 overflow-hidden shadow-md">
            
            <!-- Left Group: Title & Folder Selector -->
            <div class="flex items-center gap-2 flex-shrink-0 min-w-0 max-w-[200px] sm:max-w-[240px]">
              <span class="screw-head hidden sm:inline-block flex-shrink-0"></span>
              <div class="flex items-center gap-1.5 flex-shrink-0 min-w-0">
                <span class="font-bold text-white text-xs font-mono uppercase tracking-wider truncate max-w-[80px]" id="promptTitleText">
                  ${this.promptTitle}
                </span>
              </div>

              <!-- Top Bar Directory Pill Button -->
              <button id="btnHeaderSelectFolder" class="px-2 py-0.5 bg-[#141414] hover:bg-[#1c1c1c] border border-[#2e2e2e] hover:border-[#38bdf8] rounded text-[10px] font-mono flex items-center gap-1 text-[#a3a3a3] hover:text-white cursor-pointer transition truncate max-w-[110px] shadow-sm flex-shrink-0" title="Workspace: ${this.currentWorkspacePath} (Click to change)">
                <span class="text-[#38bdf8] flex-shrink-0">📁</span>
                <span class="truncate font-bold text-white text-[10px]">${this.getFolderDisplayBasename()}</span>
                <span class="text-[#737373] text-[9px] flex-shrink-0">▾</span>
              </button>
            </div>

            <!-- Center Group: Live Telemetry Indicator & Timer with Cassette Reels -->
            <div class="hidden xl:flex items-center gap-2 px-2.5 py-0.5 bg-[#121212] border border-[#242424] rounded text-xs font-mono min-w-0 flex-shrink max-w-[320px] justify-center mx-1 shadow-inner overflow-hidden">
              <span class="led-indicator ${this.isExecuting ? 'led-accent led-pulsing' : 'led-white'} flex-shrink-0"></span>
              
              <!-- Cassette Tape Reel Mini-Animation -->
              <div class="flex items-center gap-1 px-1 py-0.5 bg-[#000000] border border-[#242424] rounded flex-shrink-0">
                <svg class="w-3 h-3 text-[#38bdf8] ${this.isExecuting ? 'tape-spool-active' : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2v7M12 15v7M2 12h7M15 12h7" />
                </svg>
                <svg class="w-3 h-3 text-[#38bdf8] ${this.isExecuting ? 'tape-spool-active' : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2v7M12 15v7M2 12h7M15 12h7" />
                </svg>
              </div>

              <span class="text-white font-bold text-[10px] uppercase truncate flex-1 min-w-0">
                ${this.isExecuting ? `[${this.activeSwarmRole}] ${this.currentStatusText}` : (this.activeViewMode === 'cicd' ? '[AUTONOMOUS CI/CD PIPELINE]' : (this.activeViewMode === 'workflow' ? '[DAG WORKFLOW ORCHESTRATOR]' : '[STANDBY // SWARM READY]'))}
              </span>
              <span id="liveExecutionTimerBadge" class="text-[#38bdf8] font-mono text-[10px] px-1.5 py-0.5 rounded border border-[#0369a1] bg-[#082038] font-bold flex items-center gap-1 flex-shrink-0">
                ${MAC_ICONS.watch}
                <span>${this.formatElapsedTime()}</span>
              </span>
            </div>

            <!-- Right Group: Actions Toolbar with CRT Controls -->
            <div class="flex items-center gap-1 flex-shrink-0 ml-auto">
              <!-- CRT Power Toggle Button -->
              <button id="btnToggleCrtScreen" class="retro-btn ${this.crtEnabled ? 'retro-btn-accent font-bold' : ''} flex-shrink-0 px-2 py-1 text-[10px] flex items-center gap-1" title="Toggle Vintage CRT Monitor Effect (Scanlines & Phosphor Bloom)">
                <span class="w-2 h-2 rounded-full ${this.crtEnabled ? 'bg-black shadow-[0_0_8px_#38bdf8]' : 'bg-[#404040]'} inline-block"></span>
                <span>${this.crtEnabled ? 'CRT: ON' : 'CRT: OFF'}</span>
              </button>

              <!-- CRT Phosphor Theme Switcher Dropdown / Pills -->
              ${this.crtEnabled ? `
                <div class="hidden sm:flex items-center bg-[#141414] border border-[#383838] rounded p-0.5 text-[9px] font-mono gap-0.5">
                  <button class="btn-crt-theme px-1.5 py-0.5 rounded ${this.crtColorTheme === 'green' ? 'bg-[#15803d] text-white font-bold' : 'text-[#737373] hover:text-white'}" data-theme="green" title="P1 Green Phosphor">P1</button>
                  <button class="btn-crt-theme px-1.5 py-0.5 rounded ${this.crtColorTheme === 'amber' ? 'bg-[#b45309] text-white font-bold' : 'text-[#737373] hover:text-white'}" data-theme="amber" title="P3 Amber Phosphor">P3</button>
                  <button class="btn-crt-theme px-1.5 py-0.5 rounded ${this.crtColorTheme === 'cyan' ? 'bg-[#0369a1] text-white font-bold' : 'text-[#737373] hover:text-white'}" data-theme="cyan" title="Cyan Phosphor">CYAN</button>
                  <button class="btn-crt-theme px-1.5 py-0.5 rounded ${this.crtColorTheme === 'white' ? 'bg-white text-black font-bold' : 'text-[#737373] hover:text-white'}" data-theme="white" title="White Monochrome">MONO</button>
                </div>
              ` : ''}

              <!-- Audio Mute / Unmute Toggle (Symbol Only) -->
              <button id="btnToggleSound" class="retro-btn ${!soundEngine.getMuted() ? 'retro-btn-accent' : ''} flex-shrink-0 px-2 py-1 text-[10px] flex items-center justify-center font-bold" title="${!soundEngine.getMuted() ? 'Audio Sound Effects Active (Click to Mute)' : 'Audio Sound Effects Muted (Click to Enable)'}">
                ${!soundEngine.getMuted() ? MAC_ICONS.sound : MAC_ICONS.soundMute}
              </button>

              <!-- Export ZIP (Symbol Only) -->
              <button id="btnExportProjectZip" class="retro-btn flex-shrink-0 px-2 py-1 text-[10px] flex items-center justify-center" title="Export Project as .ZIP Archive">
                ${MAC_ICONS.floppy}
              </button>

              <!-- Toggle Side Panel (Keeps PREVIEW Label) -->
              <button id="btnToggleSidePanel" class="retro-btn ${this.showSidePanel ? 'retro-btn-white' : ''} flex-shrink-0 px-2.5 py-1 text-[9px] flex items-center gap-1" title="Toggle Code Preview & Editor">
                ${MAC_ICONS.macScreen}
                <span>PREVIEW</span>
                ${this.isAppReady ? '<span class="w-1.5 h-1.5 bg-[#38bdf8] rounded-full inline-block shadow-[0_0_6px_#38bdf8]"></span>' : ''}
              </button>

              <!-- Settings Toggle (Symbol Only) -->
              <button id="btnToggleSystemInstruction" class="retro-btn flex-shrink-0 px-2 py-1 text-[10px] flex items-center justify-center" title="System Instructions & Persona Settings">
                ${MAC_ICONS.briefcase}
              </button>

              <!-- Header Logout Button (Symbol Only) -->
              <button id="btnHeaderLogout" class="retro-btn retro-btn-danger flex-shrink-0 px-2 py-1 text-[10px] flex items-center justify-center" title="Sign Out / Logout">
                ${MAC_ICONS.bomb}
              </button>

              <!-- Run Button (Compact Symbol with Return Arrow) -->
              <button id="btnHeaderRun" class="retro-btn retro-btn-accent flex-shrink-0 px-2.5 py-1 text-[10px] flex items-center gap-1 font-bold" title="Run Task (Enter)">
                ${MAC_ICONS.command}
                <span>↵</span>
              </button>
            </div>
          </header>

          <!-- TOP NAVIGATION TAB STRIP: Clean Studio Navigation -->
          <div class="h-10 px-3 border-b border-[#242424] bg-[#050505] flex items-center justify-between flex-shrink-0 z-10 select-none">
            <div class="flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
              <button id="btnNavViewAgent" class="px-3.5 py-1.5 text-[11px] font-mono font-bold uppercase transition rounded cursor-pointer flex items-center gap-1.5 ${this.activeViewMode === 'agent' ? 'bg-[#38bdf8] text-black shadow-[0_0_12px_rgba(56,189,248,0.5)]' : 'text-[#737373] hover:text-white hover:bg-[#141414]'}">
                <span>[//] AGENT STUDIO</span>
              </button>
              <button id="btnNavViewCicd" class="px-2.5 py-1 text-[10px] font-mono font-bold uppercase transition rounded cursor-pointer flex items-center gap-1.5 ${this.activeViewMode === 'cicd' ? 'bg-[#38bdf8] text-black shadow-[0_0_12px_rgba(56,189,248,0.5)]' : 'text-[#737373] hover:text-white hover:bg-[#141414]'}">
                <span>[>] CI/CD PIPELINE</span>
              </button>
              <button id="btnNavViewWorkflow" class="px-2.5 py-1 text-[10px] font-mono font-bold uppercase transition rounded cursor-pointer flex items-center gap-1.5 ${this.activeViewMode === 'workflow' ? 'bg-[#38bdf8] text-black shadow-[0_0_12px_rgba(56,189,248,0.5)]' : 'text-[#737373] hover:text-white hover:bg-[#141414]'}">
                <span>[#] WORKFLOW ENGINE</span>
              </button>
            </div>

            ${this.activeViewMode === 'agent' ? `
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-mono text-[#737373] hidden sm:inline">SWARM AUTONOMY: 5-AGENT</span>
              </div>
            ` : (this.activeViewMode === 'cicd' ? `
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-mono text-[#737373] hidden sm:inline">LIVE TELEMETRY: SSE</span>
                <button id="btnQuickTriggerPipelineTop" class="retro-btn retro-btn-accent px-3 py-1 text-[10px] font-mono font-bold flex items-center gap-1">
                  <span>[>] TRIGGER PIPELINE</span>
                </button>
              </div>
            ` : (this.activeViewMode === 'workflow' ? `
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-mono text-[#737373] hidden sm:inline">DAG ENGINE: ACTIVE</span>
                <button id="btnQuickRunWorkflowTop" class="retro-btn retro-btn-accent px-3 py-1 text-[10px] font-mono font-bold flex items-center gap-1">
                  <span>${this.isWorkflowExecuting ? '[~] RUNNING...' : '[>] RUN WORKFLOW'}</span>
                </button>
              </div>
            ` : ''))}
          </div>

          <!-- DYNAMIC VIEW CONTENT: Workflow Studio OR CI/CD Pipeline Dashboard OR Agent Chat / Ask Mode -->
          ${this.activeViewMode === 'workflow' ? this.renderWorkflowStudio() : (this.activeViewMode === 'cicd' ? this.renderPipelineDashboard() : `
            <!-- Chat Feed & Workspace Content -->
            <div id="chatFeed" class="flex-1 overflow-y-auto p-3 sm:p-5 custom-scrollbar flex flex-col items-center">
              <div class="max-w-4xl xl:max-w-5xl w-full space-y-3.5">
                
                <!-- System Instructions Drawer -->
                ${this.systemInstructionOpen ? `
                  <div class="w-full p-4 retro-panel space-y-2.5 animate-fadeIn font-mono">
                    <div class="flex items-center justify-between border-b border-[#242424] pb-2">
                      <span class="text-xs font-bold text-white uppercase flex items-center gap-2">
                        <span class="screw-head"></span>
                        [SYSTEM INSTRUCTIONS // MODEL PERSONA]
                      </span>
                      <button id="btnCloseSystemInstruction" class="text-xs text-[#737373] hover:text-white cursor-pointer font-mono">✕ CLOSE</button>
                    </div>
                    <textarea id="systemInstructionText" rows="2" class="w-full bg-[#000000] border border-[#383838] focus:border-white rounded p-2.5 text-xs text-white font-mono outline-none resize-none shadow-inner">${this.escapeHtml(this.systemInstruction)}</textarea>
                  </div>
                ` : ''}

                <!-- Swarm Sub-Agents Status Strip -->
                <div class="w-full retro-panel px-3.5 py-2 flex items-center justify-between gap-3 shadow-md">
                  <div class="flex items-center gap-2 flex-shrink-0">
                    <span class="led-indicator ${this.isExecuting ? 'led-accent led-pulsing' : 'led-white'}"></span>
                    <span class="font-mono text-[10px] font-bold text-white uppercase tracking-wider">PIPELINE</span>
                  </div>

                  <div class="flex items-center gap-1.5 flex-1 justify-center overflow-x-auto custom-scrollbar px-1 min-w-0">
                    <button class="btn-filter-role px-2.5 py-1 text-[10px] font-mono transition rounded cursor-pointer flex-shrink-0 border ${this.filterSwarmRole === 'ALL' ? 'bg-white text-black font-bold border-white' : 'bg-[#141414] text-[#737373] hover:text-white border-[#242424]'}" data-role="ALL">
                      ALL
                    </button>
                    ${this.agentSwarmRoles.map(r => `
                      <button class="btn-filter-role px-2.5 py-1 rounded border text-[10px] font-mono flex items-center gap-1.5 transition-all cursor-pointer flex-shrink-0 ${this.activeSwarmRole === r.id ? 'bg-[#38bdf8] text-black font-bold border-[#38bdf8] shadow-[0_0_8px_rgba(56,189,248,0.5)]' : (this.filterSwarmRole === r.id ? 'bg-white text-black border-white font-bold' : 'bg-[#141414] border-[#242424] text-[#737373] hover:text-white')}" data-role="${r.id}">
                        <span class="w-1.5 h-1.5 rounded-full ${this.activeSwarmRole === r.id ? 'bg-black' : 'bg-[#404040]'} block"></span>
                        <span>${r.name.toUpperCase()}</span>
                      </button>
                    `).join('')}
                  </div>

                  <div class="flex items-center gap-1.5 flex-shrink-0">
                    <span class="text-[10px] font-mono text-[#38bdf8] truncate max-w-[140px] font-bold">
                      ${this.isExecuting ? (this.activeSwarmRole !== 'IDLE' ? this.activeSwarmRole : 'ACTIVE') : 'READY'}
                    </span>
                  </div>
                </div>

                <!-- Streamlined Activity & File Synthesis Notification -->
                ${this.latestSavedFile ? `
                  <div class="p-2.5 bg-[#082038] border border-[#0369a1] rounded flex items-center justify-between text-xs text-white shadow-md">
                    <div class="flex items-center gap-2.5 truncate">
                      <span class="text-[#38bdf8] flex-shrink-0">${MAC_ICONS.floppy}</span>
                      <span class="font-bold text-[#38bdf8] uppercase text-[10px]">SAVED:</span>
                      <span class="font-mono text-white truncate text-[11px]">${this.currentWorkspacePath}/${this.latestSavedFile.name}</span>
                    </div>
                    <button class="btn-select-file retro-btn retro-btn-accent px-2.5 py-1 text-[9px] font-bold flex items-center gap-1" data-path="${this.latestSavedFile.name}">
                      ${MAC_ICONS.doc}
                      <span>VIEW ↗</span>
                    </button>
                  </div>
                ` : ''}

                <!-- Messages Feed -->
                <div id="messagesList" class="space-y-3.5">
                  ${this.renderMessages()}
                </div>
              </div>
            </div>

            <!-- 3. PROMPT TYPING DOCK (Hardware Input Strip) -->
            <div class="p-3.5 border-t border-[#242424] bg-[#0a0a0a] flex justify-center flex-shrink-0 z-20 shadow-2xl">
              <div class="max-w-4xl xl:max-w-5xl w-full space-y-2">
                <!-- Workspace Status Strip -->
                <div class="flex items-center justify-between text-xs font-mono text-[#737373] pb-1.5 border-b border-[#1c1c1c] gap-2 flex-wrap">
                  <div class="flex items-center gap-2 min-w-0 truncate">
                    <span class="text-[#38bdf8] font-bold">WORKSPACE:</span>
                    <span class="text-white truncate">${this.currentWorkspacePath}</span>
                  </div>
                  
                  <div class="flex items-center gap-2 text-[10px] font-mono text-[#737373]">
                    <span class="w-1.5 h-1.5 rounded-full bg-[#38bdf8] shadow-[0_0_6px_#38bdf8] inline-block"></span>
                    <span class="text-white font-bold">AUTONOMOUS AGENT ENGINE</span>
                  </div>
                </div>

                <!-- Input Textarea -->
                <textarea id="taskInput" rows="2" ${this.isExecuting ? 'disabled' : ''} placeholder="${this.isExecuting ? 'Agent is synthesizing codebase... Click Stop to halt.' : 'Describe what you want to build in your workspace (e.g., interactive tool, full-stack app, game)...'}" class="w-full bg-[#000000] border border-[#383838] focus:border-white rounded p-3 text-xs text-white font-mono outline-none resize-none custom-scrollbar min-h-[64px] max-h-[160px] leading-relaxed shadow-inner ${this.isExecuting ? 'opacity-50 cursor-not-allowed' : ''}">${this.taskPrompt}</textarea>

                <div class="flex items-center justify-between gap-2 pt-1">
                  <div class="flex items-center gap-2 text-[10px] font-mono text-[#737373]">
                    ${this.isExecuting ? `
                      <span class="led-indicator led-accent led-pulsing"></span>
                      <span class="text-[#38bdf8] font-bold uppercase flex items-center gap-1.5">
                        ${MAC_ICONS.watch}
                        <span>SYNTHESIZING CODEBASE &amp; WRITING TO DISK...</span>
                      </span>
                    ` : `
                      <span class="border border-[#383838] bg-[#141414] px-1.5 py-0.5 rounded text-white font-bold flex items-center gap-1">
                        ${MAC_ICONS.command}
                        <span>ENTER</span>
                      </span>
                      <span>BUILD &amp; RUN</span>
                    `}
                  </div>

                  <div class="flex items-center gap-2">
                    ${this.isExecuting ? `
                      <button id="btnStopExecution" class="retro-btn retro-btn-danger px-4 py-1.5 text-xs font-bold flex items-center gap-1.5">
                        ${MAC_ICONS.bomb}
                        <span>STOP EXECUTION</span>
                      </button>
                    ` : `
                      <button id="btnClearChat" class="retro-btn px-3 py-1.5 text-xs">
                        CLEAR
                      </button>
                      <button id="btnSubmitTask" class="retro-btn retro-btn-accent px-6 py-1.5 text-xs font-mono font-bold flex items-center gap-1.5">
                        ${MAC_ICONS.command}
                        <span>RUN PROMPT ↵</span>
                      </button>
                    `}
                  </div>
                </div>
              </div>
            </div>
          `)}
        </section>

        <!-- 4. RESIZER HANDLE -->
        ${this.showSidePanel ? '<div id="resizerHandle" class="resizer-handle"></div>' : ''}

        <!-- 5. RIGHT WORKSPACE PANEL (Browser Preview, Editor, Diff, Console, Settings) -->
        ${this.showSidePanel ? `
          <aside class="flex flex-col bg-[#0a0a0a] border-l border-[#242424] overflow-hidden z-20 shadow-2xl" style="width: ${this.panelWidthPercent}%">
            <!-- Right Panel Header Tabs -->
            <div class="h-12 px-3 border-b border-[#242424] bg-[#000000] flex items-center justify-between flex-shrink-0 text-xs select-none shadow-sm">
              <div class="flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
                <button class="btn-ws-tab retro-btn px-2.5 py-1 text-[10px] font-mono flex items-center gap-1.5 ${this.activeWorkspaceTab === 'browser' ? 'retro-btn-white' : ''}" data-tab="browser">
                  ${MAC_ICONS.macScreen}
                  <span>PREVIEW</span>
                  ${this.isAppReady ? '<span class="w-1.5 h-1.5 bg-[#38bdf8] rounded-full inline-block"></span>' : ''}
                </button>
                <button class="btn-ws-tab retro-btn px-2.5 py-1 text-[10px] font-mono flex items-center gap-1.5 ${this.activeWorkspaceTab === 'editor' ? 'retro-btn-white' : ''}" data-tab="editor">
                  ${MAC_ICONS.handWrite}
                  <span>EDITOR</span>
                </button>
                <button class="btn-ws-tab retro-btn px-2.5 py-1 text-[10px] font-mono flex items-center gap-1.5 ${this.activeWorkspaceTab === 'diff' ? 'retro-btn-white' : ''}" data-tab="diff">
                  ${MAC_ICONS.command}
                  <span>DIFF</span>
                </button>
                <button class="btn-ws-tab retro-btn px-2.5 py-1 text-[10px] font-mono flex items-center gap-1.5 ${this.activeWorkspaceTab === 'console' ? 'retro-btn-white' : ''}" data-tab="console">
                  ${MAC_ICONS.alertBubble}
                  <span>CONSOLE (${this.consoleLogs.length})</span>
                </button>
                <button class="btn-ws-tab retro-btn px-2.5 py-1 text-[10px] font-mono flex items-center gap-1.5 ${this.activeWorkspaceTab === 'tuning' ? 'retro-btn-white' : ''}" data-tab="tuning">
                  ${MAC_ICONS.briefcase}
                  <span>SETTINGS</span>
                </button>
              </div>

              <button id="btnCloseSidePanel" class="retro-btn px-2 py-1 text-xs font-mono" title="Close Panel">
                ✕
              </button>
            </div>

            <!-- Tab 1: Live Browser Preview -->
            ${this.activeWorkspaceTab === 'browser' ? `
              <div class="flex-1 flex flex-col bg-[#000000] overflow-hidden">
                <!-- Preview Toolbar: DESKTOP ONLY -->
                <div class="h-9 px-3 border-b border-[#242424] bg-[#0a0a0a] flex items-center justify-between gap-2 flex-shrink-0">
                  <div class="flex items-center gap-2 text-[9px] font-mono text-[#737373]">
                    <span class="text-[#38bdf8] font-bold">${MAC_ICONS.macScreen}</span>
                    <span class="text-white font-bold uppercase tracking-wide">LIVE PREVIEW</span>
                    ${this.isAppReady ? '<span class="w-1.5 h-1.5 rounded-full bg-[#38bdf8] shadow-[0_0_6px_#38bdf8] inline-block"></span>' : '<span class="w-1.5 h-1.5 rounded-full bg-[#404040] inline-block"></span>'}
                  </div>
                  <div class="flex items-center gap-1.5">
                    <button id="btnReloadPreview" class="retro-btn px-2.5 py-0.5 text-[9px] font-mono" title="Reload Preview">
                      [>] RELOAD
                    </button>
                    <button id="btnOpenExternalBrowser" class="retro-btn retro-btn-accent px-3 py-0.5 text-[9px] font-mono font-bold" title="Open in new window">
                      OPEN ↗
                    </button>
                  </div>
                </div>

                <!-- Preview Iframe: Full-Width Desktop Only -->
                <div class="flex-1 relative bg-[#080808] overflow-hidden">
                  <iframe id="previewIframe" class="absolute inset-0 w-full h-full border-none bg-white" sandbox="allow-scripts allow-modals allow-same-origin allow-forms allow-popups"></iframe>

                  <div id="previewEmptyState" class="absolute inset-0 p-6 text-center space-y-4 bg-[#000000] flex flex-col items-center justify-center ${this.generatedSrcDoc ? 'hidden' : ''}">
                    <div class="w-14 h-14 border-2 border-[#383838] flex items-center justify-center text-[#38bdf8] shadow-lg" style="clip-path: polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,0 100%)">
                      ${MAC_ICONS.macScreen}
                    </div>
                    <div class="space-y-1">
                      <h3 class="text-xs font-bold text-white uppercase font-mono tracking-widest">[//] LIVE PREVIEW</h3>
                      <p class="text-[10px] text-[#737373] font-mono">Submit a prompt in Agent Mode to synthesize and render your application here.</p>
                    </div>
                    <div class="flex items-center gap-2 text-[9px] font-mono text-[#404040]">
                      <span class="w-1 h-1 bg-[#404040] rounded-full"></span>
                      <span>DESKTOP PREVIEW // FULL RESOLUTION</span>
                      <span class="w-1 h-1 bg-[#404040] rounded-full"></span>
                    </div>
                  </div>
                </div>
              </div>
            ` : ''}

            <!-- Tab 2: Code Editor -->
            ${this.activeWorkspaceTab === 'editor' ? `
              <div class="flex-1 flex overflow-hidden font-mono">
                <!-- File Tree Rail -->
                <div class="w-48 border-r border-[#242424] bg-[#050505] flex flex-col flex-shrink-0">
                  <div class="h-9 px-3 border-b border-[#242424] flex items-center justify-between text-[10px] text-white font-bold bg-[#0a0a0a]">
                    <span>WORKSPACE FILES (${this.fileList.length})</span>
                    <button id="btnRefreshFiles" class="hover:text-white p-1 text-[11px] text-[#737373]" title="Refresh">↻</button>
                  </div>
                  <div id="fileListContainer" class="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar text-xs">
                    ${this.fileList.map(f => `
                      <div class="file-item group px-2.5 py-1.5 rounded cursor-pointer flex items-center justify-between border ${this.selectedFile?.path === f.path ? 'bg-white text-black font-bold border-white shadow' : 'text-[#a3a3a3] border-transparent hover:bg-[#141414] hover:text-white'}" data-path="${f.path}">
                        <div class="flex items-center gap-1.5 truncate">
                          <span class="text-[#737373] group-hover:text-white">${MAC_ICONS.doc}</span>
                          <span class="truncate text-[11px]">${f.name}</span>
                        </div>
                        <button class="btn-delete-file opacity-0 group-hover:opacity-100 p-0.5 text-[#737373] hover:text-[#38bdf8]" data-path="${f.path}" title="Delete file">
                          ${MAC_ICONS.trash}
                        </button>
                      </div>
                    `).join('')}
                    ${this.fileList.length === 0 ? '<div class="p-3 text-[#737373] text-[10px]">NO FILES FOUND</div>' : ''}
                  </div>
                </div>

                <!-- Editor Textarea Area -->
                <div class="flex-1 flex flex-col bg-[#000000] overflow-hidden min-w-0">
                  <div class="h-9 px-3 border-b border-[#242424] bg-[#0a0a0a] flex items-center justify-between text-xs flex-shrink-0">
                    <div class="flex items-center gap-2 truncate">
                      <span class="text-[#38bdf8]">${MAC_ICONS.doc}</span>
                      <span class="text-white font-bold text-[11px] truncate font-mono">${this.selectedFile?.path || 'index.html'}</span>
                    </div>
                    <button id="btnSaveFile" class="retro-btn retro-btn-white px-3 py-1 text-[9px] font-mono font-bold flex items-center gap-1.5">
                      ${MAC_ICONS.floppy}
                      <span>SAVE (⌘+S)</span>
                    </button>
                  </div>
                  <div class="flex-1 flex overflow-hidden">
                    <div id="editorLineGutter" class="w-10 bg-[#080808] border-r border-[#1c1c1c] text-[#404040] text-[11px] font-mono text-right pr-2 pt-2.5 select-none overflow-hidden">
                      ${Array.from({ length: Math.max(1, (this.fileContent || '').split('\n').length) }, (_, i) => `<div>${i + 1}</div>`).join('')}
                    </div>
                    <textarea id="editorTextarea" class="flex-1 bg-[#000000] text-white font-mono text-xs p-2.5 outline-none resize-none custom-scrollbar leading-relaxed whitespace-pre">${this.escapeHtml(this.fileContent)}</textarea>
                  </div>
                </div>
              </div>
            ` : ''}

            <!-- Tab 3: Diff Viewer -->
            ${this.activeWorkspaceTab === 'diff' ? `
              <div class="flex-1 flex flex-col bg-[#000000] overflow-hidden font-mono text-xs">
                <div class="h-9 px-3 border-b border-[#242424] bg-[#0a0a0a] flex items-center justify-between flex-shrink-0">
                  <div class="flex items-center gap-2">
                    <span class="text-[#38bdf8]">${MAC_ICONS.command}</span>
                    <span class="text-white font-bold text-[11px]">DIFF // CURRENT vs DISK</span>
                  </div>
                  <select id="selectDiffFile" class="bg-[#141414] border border-[#383838] rounded text-white text-[10px] px-2.5 py-1 outline-none cursor-pointer">
                    ${this.fileList.map(f => `<option value="${f.path}" ${this.diffSelectedFile === f.path ? 'selected' : ''}>${f.name}</option>`).join('')}
                  </select>
                </div>
                <div class="flex-1 overflow-auto custom-scrollbar p-3.5 text-[11.5px] space-y-1 bg-[#000000]">
                  <pre class="text-white whitespace-pre-wrap"><code>${this.escapeHtml(this.fileContent)}</code></pre>
                </div>
              </div>
            ` : ''}

            <!-- Tab 4: Console Telemetry Feed (Monochrome CRT Screen) -->
            ${this.activeWorkspaceTab === 'console' ? `
              <div class="flex-1 flex flex-col retro-screen-mono overflow-hidden font-mono text-xs shadow-2xl">
                <div class="h-9 px-3 border-b border-[#242424] bg-[#0a0a0a] flex items-center justify-between flex-shrink-0 relative z-10">
                  <div class="flex items-center gap-1.5">
                    <button class="btn-console-filter px-2.5 py-0.5 rounded text-[9px] font-bold ${this.consoleFilter === 'all' ? 'bg-white text-black' : 'text-[#737373] hover:text-white'}" data-filter="all">ALL</button>
                    <button class="btn-console-filter px-2.5 py-0.5 rounded text-[9px] font-bold ${this.consoleFilter === 'log' ? 'bg-white text-black' : 'text-[#737373] hover:text-white'}" data-filter="log">LOGS</button>
                    <button class="btn-console-filter px-2.5 py-0.5 rounded text-[9px] font-bold ${this.consoleFilter === 'error' ? 'bg-[#ff4d4d] text-white' : 'text-[#737373] hover:text-white'}" data-filter="error">ERRORS</button>
                  </div>
                  <button id="btnClearConsoleLogs" class="px-2.5 py-0.5 rounded text-[9px] text-[#737373] border border-[#242424] hover:text-white hover:border-white">CLEAR</button>
                </div>
                <div class="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1.5 text-[11.5px] select-text relative z-10">
                  ${this.consoleLogs.map(c => `
                    <div class="flex items-start gap-2 ${c.level === 'error' ? 'text-[#ff4d4d] font-bold' : (c.level === 'warn' ? 'text-[#38bdf8]' : 'text-white')}">
                      <span class="text-[#737373]">[${c.timestamp}]</span>
                      <span class="font-bold">[${c.level.toUpperCase()}]</span>
                      <span>${this.escapeHtml(c.message)}</span>
                    </div>
                  `).join('')}
                  ${this.consoleLogs.length === 0 ? '<div class="p-4 text-[#737373] text-[10px]">NO CONSOLE SIGNALS</div>' : ''}
                </div>
                <div class="p-2 border-t border-[#242424] bg-[#0a0a0a] flex items-center gap-2 relative z-10">
                  <span class="text-white text-xs font-bold pl-1">&gt;</span>
                  <input type="text" id="inputConsoleEval" placeholder="Evaluate JavaScript in preview iframe..." class="flex-1 bg-transparent text-white text-xs outline-none font-mono placeholder:text-[#404040]" />
                </div>
              </div>
            ` : ''}

            <!-- Tab 5: Settings / Tuning -->
            ${this.activeWorkspaceTab === 'tuning' ? `
              <div class="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs bg-[#050505] custom-scrollbar">
                <div class="space-y-2 p-3 retro-panel">
                  <label class="text-white font-bold uppercase">[TEMPERATURE / CREATIVITY]</label>
                  <div class="flex items-center gap-3">
                    <input type="range" id="inputTemperature" min="0" max="1" step="0.05" value="${this.temperature}" class="flex-1 accent-white" />
                    <span id="tempValueBadge" class="border border-[#383838] bg-[#141414] px-2.5 py-1 rounded text-white font-bold">${this.temperature.toFixed(2)}</span>
                  </div>
                </div>

                <div class="space-y-2 p-3 retro-panel">
                  <label class="text-white font-bold uppercase flex items-center justify-between">
                    <span>[GOOGLE GEMINI API KEY]</span>
                    <span class="text-[10px] text-[#8e8e93] font-normal">Fast, Multimodal, Real-Time</span>
                  </label>
                  <div class="relative">
                    <input type="password" id="inputGeminiApiKey" 
                      placeholder="AIzaSy..." 
                      value="${localStorage.getItem('gemini_api_key') || ''}" 
                      class="w-full bg-[#141414] border border-[#383838] rounded p-2 text-white outline-none focus:border-white text-xs font-mono pr-16" />
                    <button id="btnToggleShowGeminiKey" type="button" class="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] bg-[#242424] hover:bg-[#383838] px-1.5 py-0.5 rounded text-[#a1a1aa]">
                      SHOW
                    </button>
                  </div>
                  <div class="text-[10px] text-[#737373] flex items-center justify-between">
                    <span>Stored securely in browser session</span>
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" class="text-white hover:underline flex items-center gap-1 font-bold">Get Key ↗</a>
                  </div>
                </div>

                <div class="space-y-2 p-3 retro-panel">
                  <label class="text-white font-bold uppercase">[ACTIVE MODEL ENGINE]</label>
                  <select id="selectModelId" class="w-full bg-[#141414] border border-[#383838] rounded p-2 text-white outline-none">
                    <option value="gemini-1.5-flash" ${(localStorage.getItem('agent_model') || this.selectedModelId) === 'gemini-1.5-flash' ? 'selected' : ''}>Google Gemini 1.5 Flash (Recommended)</option>
                    <option value="gemini-2.0-flash" ${(localStorage.getItem('agent_model') || this.selectedModelId) === 'gemini-2.0-flash' ? 'selected' : ''}>Google Gemini 2.0 Flash (Fastest)</option>
                    <option value="gemini-1.5-pro" ${(localStorage.getItem('agent_model') || this.selectedModelId) === 'gemini-1.5-pro' ? 'selected' : ''}>Google Gemini 1.5 Pro (Deep Reasoning)</option>
                    <option value="deepseek-coder" ${(localStorage.getItem('agent_model') || this.selectedModelId) === 'deepseek-coder' ? 'selected' : ''}>DeepSeek Coder (Local/Cloud)</option>
                    <option value="llama3" ${(localStorage.getItem('agent_model') || this.selectedModelId) === 'llama3' ? 'selected' : ''}>Llama 3 (Ollama)</option>
                    <option value="qwen2.5-coder" ${(localStorage.getItem('agent_model') || this.selectedModelId) === 'qwen2.5-coder' ? 'selected' : ''}>Qwen 2.5 Coder (Ollama)</option>
                  </select>
                </div>

                <div class="space-y-2 p-3 retro-panel">
                  <div class="flex items-center justify-between">
                    <label class="text-white font-bold uppercase text-[11px]">[WORKSPACE ROOT DIRECTORY]</label>
                    <button id="btnSettingsOpenExplorer" class="text-[#38bdf8] hover:underline text-[10px] cursor-pointer">↗ OPEN EXPLORER</button>
                  </div>
                  <div class="p-2.5 bg-[#000000] border border-[#242424] rounded text-white text-[11px] select-text font-bold break-all">
                    ${this.escapeHtml(this.currentWorkspacePath)}
                  </div>
                  <div class="flex items-center gap-2 pt-1">
                    <button id="btnSettingsBrowseFolder" class="flex-1 retro-btn retro-btn-accent py-1.5 text-[10px] font-bold">
                      📁 CHANGE / BROWSE FOLDER
                    </button>
                  </div>
                </div>
              </div>
            ` : ''}
          </aside>
        ` : ''}
      </div>

      <!-- Modals -->
      ${this.renderFolderSelectionModal()}
      ${this.renderUserAccountModal()}
      ${this.renderPipelineTriggerModal()}
    `;
  }

  private renderMessages(): string {
    const activeMessages = this.messages.filter(msg => {
      return msg.type === 'text' || msg.type === 'plan' || msg.type === 'thought' || msg.type === 'action' || msg.type === 'test_report' || msg.type === 'decision' || msg.type === 'security_audit' || msg.type === 'answer';
    });

    if (activeMessages.length === 0) {
      return `
        <div class="p-8 text-center space-y-3 font-mono text-xs text-[#737373] animate-fadeIn border border-[#242424] rounded-lg bg-[#050505]">
          <div class="text-white text-sm font-bold uppercase flex items-center justify-center gap-2">
            <span class="text-[#38bdf8]">${MAC_ICONS.happyMac}</span>
            <span>[//] AUTONOMOUS AGENT SWARM STUDIO</span>
          </div>
          <p class="max-w-md mx-auto text-[#a3a3a3] font-sans leading-relaxed text-xs">
            Describe the application, tool, or component you want to build. The 5-stage agent swarm (Architect, Coder, QA Tester, Security, DevOps) will generate the complete codebase and write it to your folder.
          </p>
          <div class="flex items-center justify-center gap-2 pt-2 text-[10px] text-[#737373]">
            <span class="led-indicator led-white"></span>
            <span>SWARM READY // ENTER SPECIFICATION BELOW</span>
          </div>
        </div>
      `;
    }

    return activeMessages.map((msg) => {
      // 1. User Prompt Card
      if (msg.sender === 'user') {
        return `
          <div class="p-3.5 retro-panel border border-[#383838] bg-[#0f0f0f] text-xs font-mono space-y-1.5 animate-fadeIn shadow-lg">
            <div class="flex items-center justify-between text-[10px] text-[#737373] uppercase">
              <span class="text-white font-bold flex items-center gap-1.5">
                <span class="text-white flex-shrink-0">${MAC_ICONS.handWrite}</span>
                <span>[//] USER // TASK SPECIFICATION</span>
              </span>
              <span>${msg.timestamp}</span>
            </div>
            <div class="text-white font-sans text-[13.5px] leading-relaxed select-text font-medium">${this.escapeHtml(msg.content)}</div>
          </div>
        `;
      }

      // 2. Plan Proposal Checklist
      if (msg.type === 'plan') {
        const steps = msg.steps || [];
        if (!this.isExecuting) {
          steps.forEach(s => {
            s.completed = true;
            s.status = 'completed';
          });
        }
        const totalSteps = steps.length > 0 ? steps.length : 4;
        const completedCount = steps.filter(s => s.completed || s.status === 'completed').length;
        const progressPercent = !this.isExecuting ? 100 : Math.round((completedCount / totalSteps) * 100);

        return `
          <div class="p-4 retro-panel border border-[#383838] space-y-3.5 animate-fadeIn font-mono shadow-xl">
            <div class="flex items-center justify-between border-b border-[#242424] pb-2">
              <div class="flex items-center gap-2.5">
                <span class="text-[#38bdf8] flex-shrink-0">${MAC_ICONS.briefcase}</span>
                <span class="font-bold text-white text-xs uppercase tracking-wider">${msg.planTitle || 'IMPLEMENTATION PLAN'}</span>
              </div>
              <span class="text-[10px] text-[#737373] flex items-center gap-1">
                ${MAC_ICONS.watch}
                <span>${msg.timestamp}</span>
              </span>
            </div>

            <!-- 100% Progress Bar Strip -->
            <div class="space-y-1.5 p-2.5 bg-[#050505] border border-[#242424] rounded shadow-inner">
              <div class="flex items-center justify-between text-[10px] font-bold">
                <span class="text-[#38bdf8] flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full ${progressPercent === 100 ? 'bg-[#38bdf8] shadow-[0_0_8px_#38bdf8]' : 'bg-yellow-400'} inline-block"></span>
                  <span>PIPELINE PROGRESS</span>
                </span>
                <span class="text-white font-mono font-bold">${progressPercent}% COMPLETED</span>
              </div>
              <div class="w-full h-2.5 bg-[#141414] border border-[#383838] rounded-full overflow-hidden p-0.5">
                <div class="h-full bg-gradient-to-r from-[#0284c7] via-[#38bdf8] to-[#7dd3fc] rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(56,189,248,0.8)]" style="width: ${progressPercent}%"></div>
              </div>
            </div>

            <div class="space-y-2">
              ${steps.map((st, idx) => `
                <div class="flex items-center justify-between py-2 px-3 rounded border ${st.completed || st.status === 'completed' ? 'bg-[#141414] border-white text-white font-bold' : (st.status === 'in_progress' ? 'bg-[#082038] border-[#38bdf8] text-white' : 'bg-[#0a0a0a] border-[#242424] text-[#737373]')}">
                  <div class="flex items-center gap-2.5 truncate">
                    <span class="w-5 h-5 rounded border ${st.completed || st.status === 'completed' ? 'bg-white text-black border-white' : (st.status === 'in_progress' ? 'bg-[#38bdf8] text-black border-[#38bdf8]' : 'border-[#404040] text-white')} flex items-center justify-center text-[10px] font-bold flex-shrink-0 shadow">
                      ${st.completed || st.status === 'completed' ? '+' : idx + 1}
                    </span>
                    <span class="truncate text-[11.5px] font-mono">${st.label}</span>
                  </div>
                  <span class="text-[9px] px-2 py-0.5 rounded border ${st.completed || st.status === 'completed' ? 'bg-white text-black font-bold' : (st.status === 'in_progress' ? 'bg-[#38bdf8] text-black border-[#38bdf8] font-bold animate-pulse' : 'bg-[#141414] text-[#737373] border-[#242424]')}">
                    ${st.completed || st.status === 'completed' ? 'DONE' : (st.status === 'in_progress' ? 'ACTIVE' : 'QUEUED')}
                  </span>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }

      // 3. Decision Card
      if (msg.type === 'decision') {
        return `
          <div class="p-4 retro-panel border-2 border-white space-y-3 animate-fadeIn font-mono shadow-2xl">
            <div class="flex items-center justify-between border-b border-[#242424] pb-2">
              <span class="font-bold text-white text-xs uppercase flex items-center gap-2">
                <span class="text-white flex-shrink-0">${MAC_ICONS.alertBubble}</span>
                <span>[DECISION REQUIRED]</span>
              </span>
              <span class="text-[10px] text-[#737373]">${msg.timestamp}</span>
            </div>
            <p class="text-xs text-white leading-relaxed">${msg.content}</p>
            <div class="flex flex-wrap gap-2 pt-1">
              ${(msg.options || []).map(opt => `
                <button class="btn-decision-choice retro-btn retro-btn-accent px-4 py-2 text-xs font-mono font-bold flex items-center gap-1.5" data-msg-id="${msg.id}" data-opt-id="${opt.id}" data-action="${this.escapeHtml(opt.action || opt.label)}">
                  ${MAC_ICONS.command}
                  <span>${opt.label}</span>
                </button>
              `).join('')}
            </div>
          </div>
        `;
      }

      // 4. Thought Reasoning
      if (msg.type === 'thought') {
        const isCollapsed = msg.collapsed ?? false;
        return `
          <div class="retro-panel border border-[#242424] font-mono text-xs animate-fadeIn" id="thoughtContainer_${msg.id}">
            <div class="btn-thought-toggle px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-[#141414] transition rounded" data-id="${msg.id}">
              <div class="flex items-center gap-2">
                <span class="text-white flex-shrink-0">${MAC_ICONS.watch}</span>
                <span class="text-[10px] font-bold text-white uppercase">[${msg.role || 'ARCHITECT'} REASONING]</span>
              </div>
              <span class="text-[10px] text-[#737373]">${msg.timestamp} ${isCollapsed ? '▼' : '▲'}</span>
            </div>
            <div class="px-3 pb-3 text-[#a3a3a3] text-[11.5px] leading-relaxed border-t border-[#1c1c1c] pt-2 ${isCollapsed ? 'hidden' : ''}">
              ${this.escapeHtml(msg.content)}
            </div>
          </div>
        `;
      }

      // 5. Tool Action & File Write
      if (msg.type === 'action') {
        const isWrite = msg.content.toLowerCase().includes('writing to file') || msg.content.toLowerCase().includes('writefile');
        const fileNameMatch = msg.content.match(/(?:Writing to file:\s*|writeFile\s+)([a-zA-Z0-9_./-]+)/i);
        const targetFileName = fileNameMatch ? fileNameMatch[1] : '';

        return `
          <div class="p-3 retro-panel border border-[#242424] text-xs font-mono flex items-center justify-between gap-2 animate-fadeIn">
            <div class="flex items-center gap-2.5 truncate">
              <span class="text-white flex-shrink-0">${isWrite ? MAC_ICONS.floppy : MAC_ICONS.command}</span>
              <span class="px-2 py-0.5 bg-[#141414] text-white border border-[#383838] rounded text-[9px] font-bold uppercase flex-shrink-0">
                ${msg.title || 'TOOL'}
              </span>
              <span class="text-[#e5e5e5] truncate text-[11.5px]">${this.escapeHtml(msg.content)}</span>
            </div>
            ${targetFileName ? `
              <button class="btn-select-file retro-btn retro-btn-white px-2.5 py-1 text-[9px] font-mono flex-shrink-0 font-bold flex items-center gap-1" data-path="${targetFileName}">
                ${MAC_ICONS.doc}
                <span>VIEW</span>
              </button>
            ` : ''}
          </div>
        `;
      }

      // 6. Test Report & QA
      if (msg.type === 'test_report') {
        return `
          <div class="p-3.5 retro-panel border border-[#383838] space-y-2 animate-fadeIn font-mono text-xs">
            <div class="flex items-center justify-between border-b border-[#242424] pb-2">
              <span class="font-bold text-white uppercase flex items-center gap-2">
                <span class="text-white flex-shrink-0">${MAC_ICONS.macScreen}</span>
                <span>[QA TEST SUITE &amp; AST VALIDATION]</span>
              </span>
              <span class="text-[10px] text-[#737373]">${msg.timestamp}</span>
            </div>
            <div class="text-[#e5e5e5] text-[11.5px]">${this.renderRichMarkdown(msg.content)}</div>
          </div>
        `;
      }

      // 7. Security Audit
      if (msg.type === 'security_audit') {
        return `
          <div class="p-3.5 retro-panel border border-[#383838] space-y-2 animate-fadeIn font-mono text-xs">
            <div class="flex items-center justify-between border-b border-[#242424] pb-2">
              <span class="font-bold text-white uppercase flex items-center gap-2">
                <span class="text-white flex-shrink-0">${MAC_ICONS.bomb}</span>
                <span>[SECURITY &amp; SANDBOX AUDIT]</span>
              </span>
              <span class="text-[10px] text-[#737373]">${msg.timestamp}</span>
            </div>
            <div class="text-[#e5e5e5] text-[11.5px]">${this.renderRichMarkdown(msg.content)}</div>
          </div>
        `;
      }

      // 8. Ask Mode Answer Response
      if (msg.type === 'answer') {
        return `
          <div class="p-4 retro-panel border-2 border-[#38bdf8] space-y-3 animate-fadeIn shadow-2xl bg-[#030d17]">
            <div class="flex items-center justify-between text-xs font-mono border-b border-[#0369a1] pb-2">
              <div class="flex items-center gap-2">
                <span class="text-[#38bdf8] flex-shrink-0">${MAC_ICONS.doc}</span>
                <span class="font-bold text-[#38bdf8] uppercase">[?] GOOGLE GEMINI // ARCHITECTURAL RESPONSE</span>
              </div>
              <span class="text-[10px] text-[#737373] font-mono">${msg.timestamp}</span>
            </div>
            <div class="markdown-content select-text leading-relaxed text-[#f1f5f9]">
              ${this.renderRichMarkdown(msg.content)}
            </div>
            <div class="flex justify-end pt-1">
              <button class="btn-copy-turn retro-btn retro-btn-accent px-3 py-1 text-[10px] font-mono flex items-center gap-1.5 font-bold" data-text="${this.escapeHtml(msg.content)}">
                ${MAC_ICONS.doc}
                <span>COPY RESPONSE</span>
              </button>
            </div>
          </div>
        `;
      }

      // Fallback
      return `
        <div class="p-3.5 retro-panel border border-[#242424] text-xs text-white animate-fadeIn font-mono">
          ${this.renderRichMarkdown(msg.content)}
        </div>
      `;
    }).join('');
  }

  private renderRichMarkdown(md: string): string {
    if (!md) return '';
    let html = this.escapeHtml(md);

    // Code blocks with copy button
    html = html.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (_match, lang, code) => {
      const language = lang.trim() || 'code';
      const cleanCode = code.trim();
      return `
        <div class="code-block-wrapper">
          <div class="code-block-header">
            <span class="code-lang-pill">[${language}]</span>
            <button class="btn-copy-code" data-code="${this.escapeHtml(cleanCode)}">COPY</button>
          </div>
          <pre class="code-content custom-scrollbar"><code>${cleanCode}</code></pre>
        </div>
      `;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

    // Headings
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-sm font-bold text-white mt-3.5 mb-1.5 border-b border-[#242424] pb-1 font-mono uppercase">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-base font-extrabold text-white mt-4 mb-2 font-mono uppercase">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-lg font-black text-white mt-4 mb-2 font-mono uppercase">$1</h1>');

    // Bold / Italic
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-white">$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em class="text-[#a3a3a3] italic">$1</em>');

    // Lists
    html = html.replace(/^[•*-] (.*$)/gim, '<div class="flex items-start gap-2 my-1 text-xs text-white"><span class="text-[#38bdf8] font-bold flex-shrink-0">•</span><span class="flex-1">$1</span></div>');
    html = html.replace(/^(\d+)\. (.*$)/gim, '<div class="flex items-start gap-2 my-1 text-xs text-white"><span class="text-white font-mono font-bold flex-shrink-0">$1.</span><span class="flex-1">$2</span></div>');

    return html;
  }

  private escapeHtml(str: string): string {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  private attachEventListeners() {
    // CRT Screen Monitor & Phosphor Theme Controls
    document.getElementById('btnToggleCrtScreen')?.addEventListener('click', () => {
      soundEngine.playCrtClick();
      this.crtEnabled = !this.crtEnabled;
      this.render();
      this.showToast(this.crtEnabled ? '[*] CRT Monitor Phosphor Screen: ACTIVATED' : '[-] CRT Screen: DEACTIVATED');
    });

    document.querySelectorAll('.btn-crt-theme').forEach(btn => {
      btn.addEventListener('click', (e) => {
        soundEngine.playMechanicalKeyboardClick();
        const theme = (e.currentTarget as HTMLElement).dataset['theme'] as any;
        if (theme) {
          this.crtColorTheme = theme;
          this.render();
          this.showToast(`[*] CRT Phosphor: ${theme.toUpperCase()}`);
        }
      });
    });

    // Top Navigation View Mode Switcher
    document.getElementById('btnNavViewAgent')?.addEventListener('click', () => {
      soundEngine.playMechanicalKeyboardClick();
      this.activeViewMode = 'agent';
      this.render();
    });
    document.getElementById('btnNavViewCicd')?.addEventListener('click', () => {
      soundEngine.playMechanicalKeyboardClick();
      this.activeViewMode = 'cicd';
      this.render();
    });
    document.getElementById('btnNavViewWorkflow')?.addEventListener('click', () => {
      soundEngine.playMechanicalKeyboardClick();
      this.activeViewMode = 'workflow';
      this.render();
    });

    // Workflow Orchestrator Execution & Interaction
    const handleExecuteWorkflowAction = async () => {
      soundEngine.playLeverClack();
      const tplId = this.activeWorkflow?.id || 'tpl-pr-governance';
      this.isWorkflowExecuting = true;
      this.workflowExecutionLogs = [`[*] Initiating Workflow execution: ${this.activeWorkflow?.name || tplId}...`];
      if (this.activeWorkflow && this.activeWorkflow.nodes) {
        this.activeWorkflow.nodes.forEach((n: any) => {
          n.status = 'PENDING';
          n.durationMs = 0;
        });
      }
      this.render();
      try {
        await api.executeWorkflow(tplId);
        this.showToast(`[*] Workflow triggered: ${tplId}`);
      } catch (err: any) {
        this.showToast(`Workflow execution error: ${err.message}`, true);
        this.isWorkflowExecuting = false;
        this.render();
      }
    };

    document.getElementById('btnExecuteWorkflowCanvas')?.addEventListener('click', handleExecuteWorkflowAction);
    document.getElementById('btnQuickRunWorkflowTop')?.addEventListener('click', handleExecuteWorkflowAction);

    const selectWf = document.getElementById('selectWorkflowBlueprint') as HTMLSelectElement;
    if (selectWf) {
      selectWf.addEventListener('change', () => {
        soundEngine.playMechanicalKeyboardClick();
        const chosenId = selectWf.value;
        const found = (this.workflowTemplatesList || []).find(t => t.id === chosenId);
        if (found) {
          this.activeWorkflow = JSON.parse(JSON.stringify(found));
          this.selectedWorkflowNodeId = this.activeWorkflow.nodes?.[0]?.id || null;
          this.render();
          this.showToast(`[*] Active Blueprint: ${this.activeWorkflow.name}`);
        } else if (chosenId === 'tpl-incident-healer') {
          this.activeWorkflow = {
            id: 'tpl-incident-healer',
            name: 'Autonomous Incident Root-Cause & Self-Fixer',
            description: 'Monitors APM/Datadog alert webhooks, queries Gemini with stack trace, runs automated local patch validation, and opens remediation PR.',
            nodes: [
              { id: 'node-inc-1', type: 'TRIGGER_WEBHOOK', name: 'APM PagerDuty Alert Ingest', description: 'Listens for critical service alerts', posX: 40, posY: 140, config: { service: 'payment-gateway', severity: 'CRITICAL' } },
              { id: 'node-inc-2', type: 'HTTP_REST_REQUEST', name: 'Query Splunk Logs', description: 'Fetches recent stack trace & log context', posX: 280, posY: 140, config: { query: 'error_code: 500 service:payment-gateway limit:50' } },
              { id: 'node-inc-3', type: 'AI_GEMINI_REASONER', name: 'Gemini Root-Cause Analyst', description: 'Diagnoses memory leak or deadlock pattern', posX: 520, posY: 140, config: { prompt: 'Analyze stack trace and identify root cause with exact code patch.' } },
              { id: 'node-inc-4', type: 'BRANCH_IF_ELSE', name: 'Patch Feasibility Gate', description: 'Verifies confidence score > 0.85', posX: 760, posY: 140, config: { conditionField: 'confidence', expectedValue: 'true' } },
              { id: 'node-inc-5', type: 'FILE_SYSTEM_OUTPUT', name: 'Generate Patch Spec', description: 'Writes patch fix directly to workspace', posX: 1000, posY: 80, config: { fileName: 'incident-hotfix.patch' } }
            ],
            edges: [
              { id: 'e-inc-1', source: 'node-inc-1', target: 'node-inc-2', sourceHandle: 'default' },
              { id: 'e-inc-2', source: 'node-inc-2', target: 'node-inc-3', sourceHandle: 'default' },
              { id: 'e-inc-3', source: 'node-inc-3', target: 'node-inc-4', sourceHandle: 'default' },
              { id: 'e-inc-4', source: 'node-inc-4', target: 'node-inc-5', sourceHandle: 'true' }
            ]
          };
          this.selectedWorkflowNodeId = 'node-inc-1';
          this.render();
          this.showToast(`[*] Active Blueprint: ${this.activeWorkflow.name}`);
        } else if (chosenId === 'tpl-pr-governance') {
          this.activeWorkflow = {
            id: 'tpl-pr-governance',
            name: 'GitHub PR Auto-Review & Gemini SAST Audit',
            description: 'Ingests incoming GitHub PR Webhooks, runs static Shannon entropy scan, dispatches Gemini code review, and posts automated PR decisions.',
            nodes: [
              { id: 'node-1', type: 'TRIGGER_WEBHOOK', name: 'GitHub Webhook Ingest', description: 'Listens for pull_request.opened events', posX: 40, posY: 140, config: { event: 'pull_request.opened', repo: 'spring-enterprise-service' } },
              { id: 'node-2', type: 'CODE_TRANSFORM', name: 'Normalize PR Diff', description: 'Extracts changed source files & metadata', posX: 280, posY: 140, config: { filterExt: '.java,.ts,.js' } },
              { id: 'node-3', type: 'SECURITY_SAST_SCAN', name: 'SAST Secret Scanner', description: 'Detects leaked tokens & entropy anomalies', posX: 520, posY: 140, config: { failOnCritical: true } },
              { id: 'node-4', type: 'BRANCH_IF_ELSE', name: 'Security Quality Gate', description: 'Evaluates isSecure == true condition', posX: 760, posY: 140, config: { conditionField: 'isSecure', expectedValue: 'true' } },
              { id: 'node-5', type: 'AI_GEMINI_REASONER', name: 'Gemini AI PR Reviewer', description: 'Multimodal architectural evaluation', posX: 1000, posY: 80, config: { prompt: 'Perform code review on PR files and generate executive summary.' } },
              { id: 'node-6', type: 'FILE_SYSTEM_OUTPUT', name: 'Write Governance Report', description: 'Saves review report directly to workspace', posX: 1240, posY: 80, config: { fileName: 'governance-pr-audit.md' } }
            ],
            edges: [
              { id: 'e-1', source: 'node-1', target: 'node-2', sourceHandle: 'default' },
              { id: 'e-2', source: 'node-2', target: 'node-3', sourceHandle: 'default' },
              { id: 'e-3', source: 'node-3', target: 'node-4', sourceHandle: 'default' },
              { id: 'e-4', source: 'node-4', target: 'node-5', sourceHandle: 'true' },
              { id: 'e-5', source: 'node-5', target: 'node-6', sourceHandle: 'default' }
            ]
          };
          this.selectedWorkflowNodeId = 'node-1';
          this.render();
          this.showToast(`[*] Active Blueprint: ${this.activeWorkflow.name}`);
        }
      });
    }

    document.getElementById('btnCopyWorkflowWebhook')?.addEventListener('click', () => {
      soundEngine.playMechanicalKeyboardClick();
      const wfId = this.activeWorkflow?.id || 'tpl-pr-governance';
      const origin = window.location.origin;
      navigator.clipboard.writeText(`${origin}/api/workflow/webhook/${wfId}`);
      this.showToast(`[+] Webhook URL for ${wfId} copied`);
    });

    document.querySelectorAll('.workflow-node-card').forEach(card => {
      card.addEventListener('click', (e) => {
        soundEngine.playMechanicalKeyboardClick();
        const nodeId = (e.currentTarget as HTMLElement).dataset['nodeId'];
        if (nodeId) {
          this.selectedWorkflowNodeId = nodeId;
          this.render();
        }
      });
    });

    document.getElementById('btnCopySelectedNodePayload')?.addEventListener('click', () => {
      soundEngine.playMechanicalKeyboardClick();
      const node = this.activeWorkflow?.nodes?.find((n: any) => n.id === this.selectedWorkflowNodeId);
      const result = this.activeWorkflowRun?.nodeResults?.[this.selectedWorkflowNodeId || ''];
      const payload = {
        node: node || null,
        executionResult: result || null
      };
      navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      this.showToast('[+] Node payload JSON copied to clipboard');
    });

    document.getElementById('btnCopyWorkflowLogs')?.addEventListener('click', () => {
      soundEngine.playMechanicalKeyboardClick();
      const text = (this.workflowExecutionLogs || []).join('\n');
      navigator.clipboard.writeText(text);
      this.showToast('[+] Workflow execution logs copied');
    });

    document.getElementById('btnClearWorkflowLogs')?.addEventListener('click', () => {
      soundEngine.playMechanicalKeyboardClick();
      this.workflowExecutionLogs = [];
      this.render();
    });

    // Pipeline Trigger & Control Actions
    const handleTriggerPipelineAction = async () => {
      soundEngine.playLeverClack();
      const repo = this.pipelineRepoInput || 'spring-enterprise-service';
      const branch = this.pipelineBranchInput || 'main';
      this.pipelineTerminalLogs = [`[${new Date().toLocaleTimeString()}] [>] Initiating Pipeline Trigger for repository: ${repo} (branch: ${branch})...`];
      if (this.activePipelineRun) {
        this.activePipelineRun.status = 'RUNNING';
        if (this.activePipelineRun.stages) {
          this.activePipelineRun.stages.forEach((s: any) => { s.status = 'PENDING'; s.durationMs = 0; });
        }
      }
      this.render();
      try {
        await api.triggerPipeline(repo, branch);
        this.showToast(`[>] CI/CD Pipeline triggered for ${repo}:${branch}`);
      } catch (err: any) {
        this.showToast(`Pipeline trigger error: ${err.message}`, true);
      }
    };

    document.getElementById('btnDirectTriggerPipeline')?.addEventListener('click', handleTriggerPipelineAction);
    document.getElementById('btnQuickTriggerPipelineTop')?.addEventListener('click', handleTriggerPipelineAction);

    document.getElementById('btnOpenTriggerPipelineModal')?.addEventListener('click', () => {
      soundEngine.playMechanicalKeyboardClick();
      this.pipelineTriggerModalOpen = true;
      this.render();
    });

    document.getElementById('btnClosePipelineModal')?.addEventListener('click', () => {
      this.pipelineTriggerModalOpen = false;
      this.render();
    });

    document.getElementById('btnCancelPipelineModal')?.addEventListener('click', () => {
      this.pipelineTriggerModalOpen = false;
      this.render();
    });

    document.getElementById('btnExecutePipelineRun')?.addEventListener('click', async () => {
      soundEngine.playLeverClack();
      const repoInput = (document.getElementById('inputPipelineRepo') as HTMLInputElement)?.value.trim() || 'spring-enterprise-service';
      const branchInput = (document.getElementById('inputPipelineBranch') as HTMLInputElement)?.value.trim() || 'main';
      this.pipelineRepoInput = repoInput;
      this.pipelineBranchInput = branchInput;
      this.pipelineTriggerModalOpen = false;
      this.pipelineTerminalLogs = [`[${new Date().toLocaleTimeString()}] [>] Initiating Pipeline Trigger for repository: ${repoInput} (branch: ${branchInput})...`];
      if (this.activePipelineRun) {
        this.activePipelineRun.repoName = repoInput;
        this.activePipelineRun.branch = branchInput;
        this.activePipelineRun.status = 'RUNNING';
        if (this.activePipelineRun.stages) {
          this.activePipelineRun.stages.forEach((s: any) => { s.status = 'PENDING'; s.durationMs = 0; });
        }
      }
      this.render();
      try {
        await api.triggerPipeline(repoInput, branchInput);
        this.showToast(`[>] CI/CD Pipeline triggered for ${repoInput}:${branchInput}`);
      } catch (err: any) {
        this.showToast(`Pipeline trigger error: ${err.message}`, true);
      }
    });

    document.getElementById('btnCopyPipelineLogs')?.addEventListener('click', () => {
      soundEngine.playMechanicalKeyboardClick();
      const text = (this.pipelineTerminalLogs || []).join('\n');
      navigator.clipboard.writeText(text);
      this.showToast('[+] Pipeline logs copied to clipboard');
    });

    document.getElementById('btnClearPipelineLogs')?.addEventListener('click', () => {
      soundEngine.playMechanicalKeyboardClick();
      this.pipelineTerminalLogs = [];
      this.render();
    });

    document.getElementById('btnCopyWebhookUrl')?.addEventListener('click', () => {
      soundEngine.playMechanicalKeyboardClick();
      const origin = window.location.origin;
      navigator.clipboard.writeText(`${origin}/api/pipeline/webhook`);
      this.showToast('[+] GitHub Webhook URL copied to clipboard');
    });

    // Sound Mute Toggle
    document.getElementById('btnToggleSound')?.addEventListener('click', () => {
      const isMuted = soundEngine.toggleMute();
      this.render();
      this.showToast(isMuted ? '🔇 Audio muted' : '🔊 Mechanical & CRT Audio Active');
    });

    document.getElementById('btnToggleSidePanel')?.addEventListener('click', async () => {
      this.showSidePanel = !this.showSidePanel;
      if (this.showSidePanel) {
        await this.loadFiles();
        await this.bundleProjectToSrcDoc();
      }
      this.render();
    });

    document.getElementById('btnCloseSidePanel')?.addEventListener('click', () => {
      this.showSidePanel = false;
      this.render();
    });

    // Right Workspace Tabs
    document.querySelectorAll('.btn-ws-tab').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const tab = (e.currentTarget as HTMLElement).dataset['tab'] as any;
        if (tab) {
          this.activeWorkspaceTab = tab;
          if (tab === 'browser') {
            await this.bundleProjectToSrcDoc();
          }
          this.render();
        }
      });
    });

    // Viewport is always desktop — no mobile/tablet toggles

    document.getElementById('btnReloadPreview')?.addEventListener('click', async () => {
      await this.loadFiles();
      await this.bundleProjectToSrcDoc();
      this.updatePreviewIframe();
      this.showToast('Preview reloaded.');
    });

    document.getElementById('btnOpenExternalBrowser')?.addEventListener('click', () => {
      window.open('http://localhost:3001/', '_blank');
    });

    document.getElementById('btnExportProjectZip')?.addEventListener('click', () => {
      window.location.href = '/api/workspace/export-zip';
    });

    // Workspace Folder Modal & Picker Controls
    const openFolderModalAction = () => {
      soundEngine.playMechanicalKeyboardClick();
      this.showFolderModal = true;
      this.customFolderInput = this.currentWorkspacePath;
      this.render();
    };

    document.getElementById('btnOpenFolderModal')?.addEventListener('click', openFolderModalAction);
    document.getElementById('btnHeaderSelectFolder')?.addEventListener('click', openFolderModalAction);
    document.getElementById('btnSettingsBrowseFolder')?.addEventListener('click', openFolderModalAction);

    document.getElementById('btnCloseFolderModal')?.addEventListener('click', () => {
      soundEngine.playMechanicalKeyboardClick();
      this.showFolderModal = false;
      this.render();
    });

    document.getElementById('btnCancelFolderModal')?.addEventListener('click', () => {
      soundEngine.playMechanicalKeyboardClick();
      this.showFolderModal = false;
      this.render();
    });

    // 1-Click Native Windows Folder Dialog
    document.getElementById('btnPickFolderDialog')?.addEventListener('click', async () => {
      soundEngine.playLeverClack();
      this.showToast('[..] Opening Windows Folder Dialog...');
      try {
        const res = await api.pickFolderDialog();
        if (res && res.status === 'SUCCESS' && res.folderPath) {
          this.currentWorkspacePath = res.folderPath;
          this.customFolderInput = res.folderPath;
          this.showFolderModal = false;
          await this.loadFiles();
          await this.bundleProjectToSrcDoc();
          this.render();
          this.updatePreviewIframe();
          this.showToast(`[+] Workspace set to: ${this.getFolderDisplayBasename()}`);
        } else {
          this.showToast('Folder selection cancelled.');
        }
      } catch (err: any) {
        this.showToast(`Folder picker error: ${err.message}`, true);
      }
    });

    // Manual Custom Path Apply
    document.getElementById('btnApplyCustomFolder')?.addEventListener('click', () => {
      const input = document.getElementById('inputCustomFolderPath') as HTMLInputElement;
      if (input && input.value.trim()) {
        this.setCustomFolder(input.value.trim());
      }
    });

    const customFolderInputEl = document.getElementById('inputCustomFolderPath') as HTMLInputElement;
    if (customFolderInputEl) {
      customFolderInputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && customFolderInputEl.value.trim()) {
          this.setCustomFolder(customFolderInputEl.value.trim());
        }
      });
    }

    // Quick Folder Presets
    document.querySelectorAll('.btn-quick-folder').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const path = (e.currentTarget as HTMLElement).dataset['path'];
        if (path) {
          this.setCustomFolder(path);
        }
      });
    });

    // Open Folder in OS Explorer
    const handleOpenInExplorer = async () => {
      soundEngine.playMechanicalKeyboardClick();
      try {
        const res = await api.openFolderInOs();
        if (res && res.status === 'SUCCESS') {
          this.showToast('[+] Opened in Windows File Explorer');
        } else {
          this.showToast(res?.message || 'Opened folder in explorer');
        }
      } catch (err: any) {
        this.showToast(`Error opening explorer: ${err.message}`, true);
      }
    };

    document.getElementById('btnOpenExplorerDirect')?.addEventListener('click', handleOpenInExplorer);
    document.getElementById('btnModalOpenInOs')?.addEventListener('click', handleOpenInExplorer);
    document.getElementById('btnSettingsOpenExplorer')?.addEventListener('click', handleOpenInExplorer);

    document.getElementById('btnNewSession')?.addEventListener('click', () => {
      this.messages = [];
      this.backendLogs = [];
      this.activeSession = null;
      this.render();
      this.showToast('New studio prompt started.');
    });

    // Sessions Selection
    document.querySelectorAll('.session-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if ((e.target as HTMLElement).closest('.btn-delete-session')) return;
        const id = (e.currentTarget as HTMLElement).dataset['id'];
        const s = this.sessions.find(x => x.id === id);
        if (s) {
          this.activeSession = s;
          this.messages = s.messages || [];
          this.render();
        }
      });
    });

    document.querySelectorAll('.btn-delete-session').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = (e.currentTarget as HTMLElement).dataset['id'];
        this.sessions = this.sessions.filter(s => s.id !== id);
        if (this.activeSession?.id === id) {
          this.activeSession = this.sessions.length > 0 ? this.sessions[0] : null;
          this.messages = this.activeSession?.messages || [];
        }
        this.saveSessionsToStorage();
        this.render();
      });
    });

    // Editor Save (Ctrl+S & button)
    const editorTextarea = document.getElementById('editorTextarea') as HTMLTextAreaElement;
    if (editorTextarea) {
      editorTextarea.addEventListener('input', () => {
        this.fileContent = editorTextarea.value;
      });
      editorTextarea.addEventListener('keydown', async (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
          e.preventDefault();
          const targetPath = this.selectedFile ? this.selectedFile.path : 'index.html';
          await api.saveFile(targetPath, editorTextarea.value);
          this.fileContent = editorTextarea.value;
          await this.bundleProjectToSrcDoc();
          this.updatePreviewIframe();
          this.showToast(`Saved ${targetPath} successfully!`);
        }
      });
    }

    document.getElementById('btnSaveFile')?.addEventListener('click', async () => {
      const targetPath = this.selectedFile ? this.selectedFile.path : 'index.html';
      await api.saveFile(targetPath, this.fileContent);
      await this.bundleProjectToSrcDoc();
      this.updatePreviewIframe();
      this.showToast(`Saved ${targetPath} successfully!`);
    });

    // File Selection
    document.querySelectorAll('.btn-select-file, .file-item').forEach(item => {
      item.addEventListener('click', async (e) => {
        if ((e.target as HTMLElement).closest('.btn-delete-file')) return;
        const path = (e.currentTarget as HTMLElement).dataset['path'];
        if (path) {
          this.showSidePanel = true;
          this.activeWorkspaceTab = path.toLowerCase().endsWith('.html') ? 'browser' : 'editor';
          await this.loadFiles();
          const node = this.fileList.find(f => f.path === path || f.name === path);
          if (node) {
            this.selectedFile = node;
            const res = await api.getFileContent(node.path);
            this.fileContent = res.content || '';
          }
          if (this.activeWorkspaceTab === 'browser') {
            await this.bundleProjectToSrcDoc();
          }
          this.render();
          this.updatePreviewIframe();
        }
      });
    });

    document.querySelectorAll('.btn-delete-file').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const path = (e.currentTarget as HTMLElement).dataset['path'];
        if (!path) return;
        await api.deleteFile(path);
        if (this.selectedFile?.path === path) {
          this.selectedFile = null;
          this.fileContent = '';
        }
        await this.loadFiles();
        await this.bundleProjectToSrcDoc();
        this.render();
        this.updatePreviewIframe();
        this.showToast(`Deleted ${path}`);
      });
    });

    document.getElementById('btnRefreshFiles')?.addEventListener('click', async () => {
      await this.loadFiles();
      await this.bundleProjectToSrcDoc();
      this.render();
      this.updatePreviewIframe();
      this.showToast('Workspace refreshed.');
    });

    // Decision Options
    document.querySelectorAll('.btn-decision-choice').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = (e.currentTarget as HTMLElement).dataset['action'];
        if (action) {
          this.taskPrompt = `[Decision] Selected: ${action}`;
          this.submitTask();
        }
      });
    });

    // Collapsible Thoughts
    document.querySelectorAll('.btn-thought-toggle').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).dataset['id'];
        const msg = this.messages.find(m => m.id === id);
        if (msg) {
          msg.collapsed = !(msg.collapsed ?? false);
          this.render();
        }
      });
    });

    // Prompt Input
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
    document.getElementById('btnHeaderRun')?.addEventListener('click', () => this.submitTask());
    document.getElementById('btnStopExecution')?.addEventListener('click', () => this.stopExecution());
    document.getElementById('btnClearChat')?.addEventListener('click', () => {
      this.messages = [];
      this.render();
    });

    // System Instructions
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

    // Gemini API Key & Model Engine Settings
    const inputGeminiKey = document.getElementById('inputGeminiApiKey') as HTMLInputElement;
    if (inputGeminiKey) {
      inputGeminiKey.addEventListener('input', () => {
        localStorage.setItem('gemini_api_key', inputGeminiKey.value.trim());
      });
    }

    const btnToggleShowKey = document.getElementById('btnToggleShowGeminiKey');
    if (btnToggleShowKey && inputGeminiKey) {
      btnToggleShowKey.addEventListener('click', () => {
        if (inputGeminiKey.type === 'password') {
          inputGeminiKey.type = 'text';
          btnToggleShowKey.textContent = 'HIDE';
        } else {
          inputGeminiKey.type = 'password';
          btnToggleShowKey.textContent = 'SHOW';
        }
      });
    }

    const selectModel = document.getElementById('selectModelId') as HTMLSelectElement;
    if (selectModel) {
      selectModel.addEventListener('change', () => {
        this.selectedModelId = selectModel.value;
        localStorage.setItem('agent_model', selectModel.value);
        this.showToast(`Selected model: ${selectModel.value}`);
      });
    }

    const inputTemp = document.getElementById('inputTemperature') as HTMLInputElement;
    if (inputTemp) {
      inputTemp.addEventListener('input', () => {
        this.temperature = parseFloat(inputTemp.value);
        const badge = document.getElementById('tempValueBadge');
        if (badge) badge.textContent = this.temperature.toFixed(2);
      });
    }

    // Resizer
    const resizer = document.getElementById('resizerHandle');
    if (resizer) {
      resizer.addEventListener('mousedown', (e) => {
        this.isResizing = true;
        resizer.classList.add('resizing');
      });
    }

    // Copy Code Snippets
    document.querySelectorAll('.btn-copy-code').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const code = (e.currentTarget as HTMLElement).dataset['code'] || '';
        if (code) {
          navigator.clipboard.writeText(code);
          this.showToast('Copied code to clipboard.');
        }
      });
    });

    document.querySelectorAll('.btn-copy-turn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const text = (e.currentTarget as HTMLElement).dataset['text'] || '';
        if (text) {
          navigator.clipboard.writeText(text);
          this.showToast('Copied response to clipboard.');
        }
      });
    });

    // Global Delegated Clicks for Folder & Account
    document.getElementById('btnOpenUserAccountModal')?.addEventListener('click', () => {
      this.showUserMenu = true;
      this.render();
    });
    document.getElementById('btnDirectLogoutSidebar')?.addEventListener('click', () => this.handleLogoutAction());
    document.getElementById('btnHeaderLogout')?.addEventListener('click', () => this.handleLogoutAction());
  }

  private onMouseMove(e: MouseEvent) {
    if (!this.isResizing) return;
    const containerWidth = this.container.offsetWidth || window.innerWidth;
    const mouseX = e.clientX;
    const newWidthPercent = Math.max(20, Math.min(80, ((containerWidth - mouseX) / containerWidth) * 100));
    this.panelWidthPercent = Math.round(newWidthPercent);
    const sidePanel = this.container.querySelector('aside[style*="width"]') as HTMLElement;
    if (sidePanel) {
      sidePanel.style.width = `${this.panelWidthPercent}%`;
    }
  }

  // --- Enterprise Autonomous CI/CD Pipeline Renderer & Terminal ---

  public updatePipelineTerminal(): void {
    const el = document.getElementById('pipelineTerminalStream');
    if (el) {
      el.innerHTML = this.pipelineTerminalLogs.map(l => this.formatTerminalLogLine(l)).join('\n');
      el.scrollTop = el.scrollHeight;
    }
  }

  private formatTerminalLogLine(line: string): string {
    let escaped = this.escapeHtml(line);
    if (escaped.includes('PASSED') || escaped.includes('SUCCESS') || escaped.includes('Grade A+')) {
      return `<span class="text-[#4ade80] font-bold">${escaped}</span>`;
    }
    if (escaped.includes('FAILED') || escaped.includes('ERROR') || escaped.includes('CRITICAL')) {
      return `<span class="text-[#f87171] font-bold">${escaped}</span>`;
    }
    if (escaped.includes('WARNING') || escaped.includes('PENDING') || escaped.includes('SCANNING')) {
      return `<span class="text-[#facc15]">${escaped}</span>`;
    }
    if (escaped.includes('[TEST]') || escaped.includes('Artifact built:') || escaped.includes('Quality Gate:')) {
      return `<span class="text-[#38bdf8] font-bold">${escaped}</span>`;
    }
    if (escaped.startsWith('[')) {
      const idx = escaped.indexOf(']');
      if (idx !== -1) {
        return `<span class="text-[#737373]">${escaped.substring(0, idx + 1)}</span><span class="text-[#e5e5e5]">${escaped.substring(idx + 1)}</span>`;
      }
    }
    return `<span class="text-[#d4d4d4]">${escaped}</span>`;
  }

  public renderWorkflowStudio(): string {
    const wf = this.activeWorkflow || {
      id: 'tpl-pr-governance',
      name: 'GitHub PR Auto-Review & Gemini SAST Audit',
      description: 'Ingests incoming GitHub PR Webhooks, runs static Shannon entropy scan, dispatches Gemini code review, and posts automated PR decisions.',
      nodes: [],
      edges: []
    };

    const selectedNode = (wf.nodes || []).find((n: any) => n.id === this.selectedWorkflowNodeId) || wf.nodes?.[0];
    const selectedNodeResult = this.activeWorkflowRun?.nodeResults?.[selectedNode?.id || ''];

    const totalNodes = (wf.nodes || []).length;
    const completedNodes = (wf.nodes || []).filter((n: any) => n.status === 'SUCCESS').length;
    const isRunning = this.isWorkflowExecuting || (wf.nodes || []).some((n: any) => n.status === 'RUNNING');
    const isFailed = (wf.nodes || []).some((n: any) => n.status === 'FAILED');
    const isSuccess = completedNodes === totalNodes && totalNodes > 0;

    const getNodeSymbol = (type: string) => {
      switch (type) {
        case 'TRIGGER_WEBHOOK':
        case 'TRIGGER_MANUAL': return '[>] TRIGGER';
        case 'AI_GEMINI_REASONER': return '[?] GEMINI AI';
        case 'SECURITY_SAST_SCAN': return '[#] SAST SCAN';
        case 'BRANCH_IF_ELSE': return '[?] QUALITY GATE';
        case 'CODE_TRANSFORM': return '[//] TRANSFORM';
        case 'HTTP_REST_REQUEST': return '[*] REST API';
        case 'FILE_SYSTEM_OUTPUT': return '[+] FS WRITE';
        default: return '[#] NODE';
      }
    };

    return `
      <div class="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar flex flex-col items-center bg-[#000000] font-mono">
        <div class="max-w-7xl w-full space-y-5">
          
          <!-- 1. Workflow Header & Blueprint Toolbar -->
          <div class="retro-panel p-4 sm:p-5 border-2 ${isSuccess ? 'border-[#38bdf8]' : (isFailed ? 'border-red-500' : 'border-[#383838]')} shadow-2xl space-y-4">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#242424] pb-4">
              <div class="space-y-1.5 min-w-0 flex-1">
                <div class="flex items-center gap-2.5 flex-wrap">
                  <span class="led-indicator ${isRunning ? 'led-accent led-pulsing' : (isSuccess ? 'led-white' : 'led-white')}"></span>
                  <span class="text-xs px-2 py-0.5 bg-[#082038] border border-[#0369a1] text-[#38bdf8] rounded font-bold uppercase">
                    DAG WORKFLOW ENGINE
                  </span>
                  
                  <!-- Blueprint Selector Dropdown -->
                  <div class="flex items-center gap-1.5 bg-[#141414] border border-[#383838] rounded px-2 py-1">
                    <span class="text-[10px] text-[#737373] uppercase font-bold">[#] BLUEPRINT:</span>
                    <select id="selectWorkflowBlueprint" class="bg-transparent text-white text-xs font-mono font-bold outline-none cursor-pointer">
                      <option value="tpl-pr-governance" ${wf.id === 'tpl-pr-governance' ? 'selected' : ''}>GitHub PR Auto-Review &amp; Gemini SAST Audit</option>
                      <option value="tpl-incident-healer" ${wf.id === 'tpl-incident-healer' ? 'selected' : ''}>Autonomous Incident Root-Cause &amp; Self-Fixer</option>
                      ${(this.workflowTemplatesList || []).filter(t => t.id !== 'tpl-pr-governance' && t.id !== 'tpl-incident-healer').map(t => `
                        <option value="${t.id}" ${wf.id === t.id ? 'selected' : ''}>${this.escapeHtml(t.name)}</option>
                      `).join('')}
                    </select>
                  </div>
                </div>

                <p class="text-xs text-[#a3a3a3] font-sans leading-relaxed">
                  ${this.escapeHtml(wf.description || 'Distributed asynchronous directed acyclic graph (DAG) workflow engine.')}
                </p>
              </div>

              <!-- Action Controls -->
              <div class="flex items-center gap-2 flex-wrap flex-shrink-0">
                <button id="btnExecuteWorkflowCanvas" class="retro-btn retro-btn-accent px-4 py-2 text-xs font-bold flex items-center gap-2 shadow-lg">
                  <span>${isRunning ? '[~] EXECUTING DAG...' : '[>] RUN WORKFLOW'}</span>
                </button>
                <button id="btnCopyWorkflowWebhook" class="retro-btn px-3 py-2 text-xs text-[#a3a3a3] hover:text-white flex items-center gap-1.5" title="Copy Webhook Endpoint URL">
                  <span>[#] COPY WEBHOOK URL</span>
                </button>
              </div>
            </div>

            <!-- Metrics & State Strip -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div class="p-3 bg-[#080808] border border-[#242424] rounded space-y-1">
                <div class="text-[10px] text-[#737373] uppercase font-bold">EXECUTION STATE</div>
                <div class="text-sm font-bold ${isSuccess ? 'text-[#4ade80]' : (isFailed ? 'text-[#f87171]' : (isRunning ? 'text-[#38bdf8]' : 'text-white'))} flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full ${isSuccess ? 'bg-[#4ade80]' : (isFailed ? 'bg-[#f87171]' : (isRunning ? 'bg-[#38bdf8]' : 'bg-[#737373]'))} block"></span>
                  <span>${isRunning ? 'RUNNING' : (isSuccess ? 'COMPLETED' : (isFailed ? 'FAILED' : 'READY / IDLE'))}</span>
                </div>
              </div>

              <div class="p-3 bg-[#080808] border border-[#242424] rounded space-y-1">
                <div class="text-[10px] text-[#737373] uppercase font-bold">NODE PROGRESS</div>
                <div class="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>${completedNodes} / ${totalNodes} NODES</span>
                  <span class="text-xs text-[#38bdf8] font-bold">(${totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0}%)</span>
                </div>
              </div>

              <div class="p-3 bg-[#080808] border border-[#242424] rounded space-y-1">
                <div class="text-[10px] text-[#737373] uppercase font-bold">DAG TOPOLOGY</div>
                <div class="text-xs font-bold text-[#38bdf8] truncate flex items-center gap-1">
                  <span>[*]</span>
                  <span>${(wf.edges || []).length} EDGES • ASYNC PARALLEL</span>
                </div>
              </div>

              <div class="p-3 bg-[#080808] border border-[#242424] rounded space-y-1">
                <div class="text-[10px] text-[#737373] uppercase font-bold">WEBHOOK LISTENER</div>
                <div class="text-[11px] font-mono text-[#4ade80] truncate flex items-center gap-1">
                  <span>[+]</span>
                  <span>/api/workflow/webhook/${wf.id}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 2. Main Workflow Area: Connected DAG Graph Canvas (Col 8) + Live Node Payload Inspector (Col 4) -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            <!-- Left DAG Canvas (8 cols) -->
            <div class="lg:col-span-8 retro-panel p-4 sm:p-5 border border-[#383838] flex flex-col space-y-4 shadow-xl">
              <div class="flex items-center justify-between border-b border-[#242424] pb-2 flex-shrink-0">
                <span class="text-xs font-bold text-white uppercase flex items-center gap-2">
                  <span class="screw-head"></span>
                  <span>[INTERACTIVE DAG WORKFLOW CANVAS // TOPOLOGICAL GRAPH]</span>
                </span>
                <span class="text-[10px] text-[#737373] font-mono">CLICK ANY NODE TO INSPECT LIVE DATA</span>
              </div>

              <!-- Node Cards Sequence Strip -->
              <div class="space-y-3 overflow-y-auto max-h-[580px] custom-scrollbar pr-1">
                ${(wf.nodes || []).map((node: any) => {
                  const isNodeSelected = selectedNode?.id === node.id;
                  const isNodeSuccess = node.status === 'SUCCESS';
                  const isNodeRunning = node.status === 'RUNNING';
                  const isNodeFailed = node.status === 'FAILED';
                  const nodeDuration = node.durationMs ? `${node.durationMs}ms` : '--';

                  // Find outgoing edge
                  const outgoingEdge = (wf.edges || []).find((e: any) => e.source === node.id);

                  return `
                    <div class="space-y-2">
                      <div class="workflow-node-card p-4 rounded border-2 transition-all cursor-pointer select-none ${
                        isNodeSelected 
                          ? 'bg-[#121212] border-[#38bdf8] shadow-[0_0_16px_rgba(56,189,248,0.35)]' 
                          : (isNodeSuccess 
                              ? 'bg-[#080808] border-[#224422] hover:border-[#38bdf8]' 
                              : (isNodeRunning 
                                  ? 'bg-[#0f172a] border-[#facc15] animate-pulse' 
                                  : (isNodeFailed 
                                      ? 'bg-[#1a0505] border-red-500' 
                                      : 'bg-[#050505] border-[#242424] hover:border-[#444]')))}" 
                        data-node-id="${node.id}">
                        
                        <div class="flex items-center justify-between gap-2 border-b border-[#1c1c1c] pb-2 mb-2">
                          <div class="flex items-center gap-2">
                            <span class="text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                              node.type.includes('TRIGGER') ? 'bg-[#1e1b4b] text-[#818cf8] border border-[#4338ca]' :
                              node.type.includes('AI') ? 'bg-[#082038] text-[#38bdf8] border border-[#0369a1]' :
                              node.type.includes('SECURITY') ? 'bg-[#2e1065] text-[#c084fc] border border-[#7e22ce]' :
                              node.type.includes('BRANCH') ? 'bg-[#422006] text-[#fb923c] border border-[#9a3412]' :
                              'bg-[#141414] text-white border border-[#383838]'
                            }">
                              ${getNodeSymbol(node.type)}
                            </span>
                            <span class="text-[10px] font-mono text-[#737373]">#${node.id}</span>
                          </div>

                          <div class="flex items-center gap-2">
                            <span class="text-[10px] font-mono text-[#737373]">${nodeDuration}</span>
                            <span class="text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                              isNodeSuccess ? 'bg-[#082038] text-[#38bdf8] border border-[#0369a1]' :
                              isNodeRunning ? 'bg-[#2a2408] text-[#facc15] border border-[#71580d]' :
                              isNodeFailed ? 'bg-[#2d0606] text-red-400 border border-red-900' :
                              'bg-[#141414] text-[#737373] border border-[#242424]'
                            }">
                              ${isNodeSuccess ? '[+] PASSED' : (isNodeRunning ? '[~] RUNNING' : (isNodeFailed ? '[!] FAILED' : '[-] QUEUED'))}
                            </span>
                          </div>
                        </div>

                        <div class="space-y-1">
                          <div class="font-bold text-xs text-white uppercase tracking-tight flex items-center justify-between">
                            <span>${this.escapeHtml(node.name)}</span>
                            ${isNodeSelected ? '<span class="text-[10px] text-[#38bdf8] font-mono font-bold">[SELECTED]</span>' : ''}
                          </div>
                          <div class="text-[11px] text-[#a3a3a3] font-sans leading-relaxed">${this.escapeHtml(node.description || '')}</div>
                        </div>

                        <!-- Config Quick Preview -->
                        ${node.config ? `
                          <div class="mt-2.5 pt-2 border-t border-[#1a1a1a] flex items-center justify-between text-[10px] text-[#737373] font-mono">
                            <span class="truncate max-w-[320px]">CONFIG: ${this.escapeHtml(JSON.stringify(node.config))}</span>
                            <span class="text-[#38bdf8] hover:underline flex-shrink-0">INSPECT ↗</span>
                          </div>
                        ` : ''}
                      </div>

                      ${outgoingEdge ? `
                        <div class="flex items-center justify-center py-0.5">
                          <div class="flex items-center gap-2 px-3 py-1 bg-[#0a0a0a] border border-[#242424] rounded text-[10px] font-mono text-[#737373]">
                            <span>↓</span>
                            <span>DISPATCH EDGE [${outgoingEdge.sourceHandle || 'DEFAULT'}]</span>
                            <span>↓</span>
                          </div>
                        </div>
                      ` : ''}
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- Right Live Node Payload Inspector (4 cols) -->
            <div class="lg:col-span-4 retro-panel p-4 border border-[#383838] flex flex-col space-y-3.5 shadow-xl">
              <div class="flex items-center justify-between border-b border-[#242424] pb-2 flex-shrink-0">
                <span class="text-xs font-bold text-white uppercase flex items-center gap-2">
                  <span class="text-[#38bdf8] flex-shrink-0">[#]</span>
                  <span>[NODE PAYLOAD INSPECTOR]</span>
                </span>
                <button id="btnCopySelectedNodePayload" class="text-[10px] text-[#737373] hover:text-white cursor-pointer uppercase font-bold">
                  COPY JSON
                </button>
              </div>

              ${selectedNode ? `
                <div class="space-y-3 overflow-y-auto max-h-[580px] custom-scrollbar pr-1 text-xs font-mono">
                  
                  <!-- Node Metadata Card -->
                  <div class="p-3 bg-[#080808] border border-[#242424] rounded space-y-1.5">
                    <div class="flex items-center justify-between">
                      <span class="text-[10px] text-[#737373] uppercase font-bold">NODE IDENTIFIER</span>
                      <span class="text-[10px] px-1.5 py-0.2 bg-[#141414] border border-[#383838] text-[#38bdf8] rounded font-bold">${selectedNode.id}</span>
                    </div>
                    <div class="font-bold text-white text-xs uppercase">${this.escapeHtml(selectedNode.name)}</div>
                    <div class="text-[10px] text-[#a3a3a3] font-sans">${this.escapeHtml(selectedNode.description || '')}</div>
                  </div>

                  <!-- Node Configuration JSON -->
                  <div class="space-y-1">
                    <div class="text-[10px] text-[#737373] uppercase font-bold flex items-center justify-between">
                      <span>NODE CONFIGURATION</span>
                      <span class="text-[9px] text-[#38bdf8]">[SCHEMA]</span>
                    </div>
                    <pre class="p-2.5 bg-[#000000] border border-[#1f1f1f] rounded text-[10.5px] font-mono text-[#e5e5e5] leading-relaxed custom-scrollbar whitespace-pre-wrap select-text max-h-[140px] overflow-y-auto">${this.escapeHtml(JSON.stringify(selectedNode.config || {}, null, 2))}</pre>
                  </div>

                  <!-- Evaluated Input Payload -->
                  <div class="space-y-1">
                    <div class="text-[10px] text-[#737373] uppercase font-bold flex items-center justify-between">
                      <span>LIVE INPUT PAYLOAD</span>
                      <span class="text-[9px] text-[#4ade80]">[INTERPOLATED]</span>
                    </div>
                    <pre class="p-2.5 bg-[#000000] border border-[#1f1f1f] rounded text-[10.5px] font-mono text-[#a3e635] leading-relaxed custom-scrollbar whitespace-pre-wrap select-text max-h-[150px] overflow-y-auto">${this.escapeHtml(JSON.stringify(selectedNodeResult?.inputData || selectedNode.config || { status: 'STANDBY_AWAITING_INPUT' }, null, 2))}</pre>
                  </div>

                  <!-- Evaluated Output Payload -->
                  <div class="space-y-1">
                    <div class="text-[10px] text-[#737373] uppercase font-bold flex items-center justify-between">
                      <span>LIVE OUTPUT / AI EVALUATION</span>
                      <span class="text-[9px] text-[#38bdf8]">[RESULT]</span>
                    </div>
                    <pre class="p-2.5 bg-[#000000] border border-[#1f1f1f] rounded text-[10.5px] font-mono text-[#38bdf8] leading-relaxed custom-scrollbar whitespace-pre-wrap select-text max-h-[170px] overflow-y-auto">${this.escapeHtml(JSON.stringify(selectedNodeResult?.outputData || (selectedNode.outputData ? selectedNode.outputData : { status: 'READY_TO_DISPATCH' }), null, 2))}</pre>
                  </div>

                </div>
              ` : `
                <div class="p-6 text-center text-[#737373] text-xs font-mono">
                  SELECT A NODE ON THE CANVAS TO INSPECT INPUT/OUTPUT STATE
                </div>
              `}
            </div>

          </div>

          <!-- 3. Bottom Live Workflow Execution Terminal -->
          <div class="retro-panel p-4 border border-[#383838] flex flex-col h-[280px] shadow-xl">
            <div class="flex items-center justify-between border-b border-[#242424] pb-2 mb-2 flex-shrink-0">
              <span class="text-xs font-bold text-white uppercase flex items-center gap-2">
                <span class="text-[#38bdf8] flex-shrink-0">[#]</span>
                <span>[LIVE WORKFLOW ENGINE TELEMETRY STREAM]</span>
              </span>
              <div class="flex items-center gap-2">
                <button id="btnCopyWorkflowLogs" class="text-[10px] text-[#737373] hover:text-white cursor-pointer uppercase font-bold">
                  COPY LOGS
                </button>
                <button id="btnClearWorkflowLogs" class="text-[10px] text-[#737373] hover:text-white cursor-pointer uppercase font-bold">
                  CLEAR
                </button>
              </div>
            </div>

            <pre id="workflowTerminalStream" class="flex-1 overflow-y-auto p-3 bg-[#000000] border border-[#1a1a1a] rounded text-[11px] font-mono leading-relaxed custom-scrollbar whitespace-pre-wrap select-text">${(this.workflowExecutionLogs.length > 0 ? this.workflowExecutionLogs : [
              '[*] Distributed Workflow Engine initialized and listening on SSE stream /api/workflow/stream',
              '[*] Ready to accept webhook events and manual trigger requests.',
              '[*] Blueprint templates loaded: GitHub PR Auto-Review & Gemini SAST Audit, Autonomous Incident Root-Cause & Self-Fixer'
            ]).map(l => this.formatTerminalLogLine(l)).join('\n')}</pre>
          </div>

        </div>
      </div>
    `;
  }

  public renderPipelineDashboard(): string {
    const p = this.activePipelineRun || {
      id: 'pipe-idle',
      repoName: 'spring-enterprise-service',
      branch: 'main',
      commitHash: '7a9f21d',
      status: 'IDLE',
      durationMs: 0,
      qualityGrade: 'A+',
      governanceDecision: 'APPROVED_FOR_DEPLOYMENT',
      totalTests: 24,
      passedTests: 24,
      coveragePercent: 94.5,
      artifactName: 'spring-enterprise-service-1.0.0.jar',
      artifactSha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
      stages: []
    };

    const isRunning = p.status === 'RUNNING';
    const isSuccess = p.status === 'SUCCESS';
    const isFailed = p.status === 'FAILED';

    return `
      <div class="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar flex flex-col items-center bg-[#000000] font-mono">
        <div class="max-w-6xl w-full space-y-5">
          
          <!-- 1. Pipeline Overview & Command Strip -->
          <div class="retro-panel p-4 sm:p-5 border-2 ${isSuccess ? 'border-[#38bdf8]' : (isFailed ? 'border-red-500' : 'border-[#383838]')} shadow-2xl space-y-4">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#242424] pb-4">
              <div class="space-y-1">
                <div class="flex items-center gap-2.5">
                  <span class="led-indicator ${isRunning ? 'led-accent led-pulsing' : (isSuccess ? 'led-white' : 'led-danger')}"></span>
                  <h1 class="text-base sm:text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <span>${this.escapeHtml(p.repoName || 'spring-enterprise-service')}</span>
                    <span class="text-xs px-2 py-0.5 bg-[#141414] border border-[#383838] text-[#38bdf8] rounded font-bold">git: ${this.escapeHtml(p.branch || 'main')}</span>
                    <span class="text-xs text-[#737373] hidden sm:inline">#${this.escapeHtml((p.commitHash || 'HEAD').substring(0, 10))}</span>
                  </h1>
                </div>
                <p class="text-xs text-[#a3a3a3] font-sans">
                  Enterprise Multi-Stage Distributed CI/CD Pipeline &amp; Automated Code Governance Engine
                </p>
              </div>

              <!-- Action Controls -->
              <div class="flex items-center gap-2 flex-wrap">
                <button id="btnDirectTriggerPipeline" class="retro-btn retro-btn-accent px-4 py-2 text-xs font-bold flex items-center gap-2 shadow-lg">
                  <span>${isRunning ? '[//] PIPELINE RUNNING...' : '[>] TRIGGER PIPELINE'}</span>
                </button>
                <button id="btnOpenTriggerPipelineModal" class="retro-btn px-3 py-2 text-xs font-bold text-white flex items-center gap-1.5" title="Configure repository & branch">
                  ${MAC_ICONS.command}
                  <span>CONFIG</span>
                </button>
                <button id="btnCopyWebhookUrl" class="retro-btn px-3 py-2 text-xs text-[#a3a3a3] hover:text-white flex items-center gap-1" title="Copy GitHub Webhook Endpoint">
                  ${MAC_ICONS.doc}
                  <span>WEBHOOK</span>
                </button>
              </div>
            </div>

            <!-- Top Summary Metric Cards -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div class="p-3 bg-[#080808] border border-[#242424] rounded space-y-1">
                <div class="text-[10px] text-[#737373] uppercase font-bold">PIPELINE STATUS</div>
                <div class="text-sm font-bold ${isSuccess ? 'text-[#4ade80]' : (isFailed ? 'text-[#f87171]' : 'text-[#38bdf8]')} flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full ${isSuccess ? 'bg-[#4ade80]' : (isFailed ? 'bg-[#f87171]' : 'bg-[#38bdf8]')} block"></span>
                  <span>${p.status || 'READY'}</span>
                </div>
              </div>

              <div class="p-3 bg-[#080808] border border-[#242424] rounded space-y-1">
                <div class="text-[10px] text-[#737373] uppercase font-bold">SECURITY SAST GRADE</div>
                <div class="text-sm font-bold text-[#38bdf8] flex items-center gap-1.5">
                  <span class="px-1.5 py-0.2 bg-[#082038] border border-[#0369a1] text-[#38bdf8] rounded text-xs font-black">${p.qualityGrade || 'A+'}</span>
                  <span class="text-xs text-white">0 Vulnerabilities</span>
                </div>
              </div>

              <div class="p-3 bg-[#080808] border border-[#242424] rounded space-y-1">
                <div class="text-[10px] text-[#737373] uppercase font-bold">TEST PASS RATE</div>
                <div class="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>${p.passedTests || 24} / ${p.totalTests || 24}</span>
                  <span class="text-xs text-[#4ade80] font-bold">(${p.coveragePercent || 94.5}% cov)</span>
                </div>
              </div>

              <div class="p-3 bg-[#080808] border border-[#242424] rounded space-y-1">
                <div class="text-[10px] text-[#737373] uppercase font-bold">GOVERNANCE GATE</div>
                <div class="text-xs font-bold text-[#38bdf8] truncate flex items-center gap-1">
                  <span>[#]</span>
                  <span>${(p.governanceDecision || 'APPROVED').replace(/_/g, ' ')}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 2. Interactive 6-Stage Execution Pipeline Grid -->
          <div class="retro-panel p-4 sm:p-5 border border-[#383838] space-y-3">
            <div class="flex items-center justify-between border-b border-[#242424] pb-2">
              <span class="text-xs font-bold text-white uppercase flex items-center gap-2">
                <span class="screw-head"></span>
                <span>[STAGE PROGRESSION // MULTI-NODE WORKERS]</span>
              </span>
              <span class="text-[10px] text-[#737373] font-mono">EXECUTION TIME: ${(p.durationMs ? (p.durationMs / 1000).toFixed(2) : '3.84')}s</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
              ${(p.stages || []).map((s: any, idx: number) => {
                const isStageSuccess = s.status === 'SUCCESS';
                const isStageRunning = s.status === 'RUNNING';
                const isStageFailed = s.status === 'FAILED';
                
                return `
                  <div class="p-3 bg-[#050505] border ${isStageSuccess ? 'border-[#38bdf8] shadow-[0_0_10px_rgba(56,189,248,0.2)]' : (isStageRunning ? 'border-[#facc15] shadow-[0_0_10px_rgba(250,204,21,0.3)] animate-pulse' : (isStageFailed ? 'border-red-500' : 'border-[#242424]'))} rounded flex flex-col justify-between space-y-2.5">
                    <div class="flex items-center justify-between">
                      <span class="text-[9px] font-bold text-[#737373] uppercase">STAGE 0${idx + 1}</span>
                      <span class="text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${isStageSuccess ? 'bg-[#082038] text-[#38bdf8] border border-[#0369a1]' : (isStageRunning ? 'bg-[#2a2408] text-[#facc15] border border-[#71580d]' : 'bg-[#141414] text-[#737373]')}">
                        ${s.status || 'PENDING'}
                      </span>
                    </div>

                    <div class="space-y-1">
                      <div class="font-bold text-xs text-white uppercase tracking-tight truncate">${s.name}</div>
                      <div class="text-[10px] text-[#a3a3a3] line-clamp-2 leading-tight font-sans">${s.description}</div>
                    </div>

                    <div class="pt-1 border-t border-[#1c1c1c] flex items-center justify-between text-[10px] font-mono">
                      <span class="text-[#737373]">${isStageSuccess ? '[+] PASSED' : (isStageRunning ? '[~] RUNNING' : '[-] PENDING')}</span>
                      <span class="text-white font-bold">${s.durationMs ? `${s.durationMs}ms` : '--'}</span>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- 3. Telemetry Stream & Security Auditing Suite -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            <!-- Left Console Log Streamer (7 cols) -->
            <div class="lg:col-span-7 retro-panel p-4 border border-[#383838] flex flex-col h-[420px] shadow-xl">
              <div class="flex items-center justify-between border-b border-[#242424] pb-2 mb-2 flex-shrink-0">
                <span class="text-xs font-bold text-white uppercase flex items-center gap-2">
                  <span class="text-[#38bdf8] flex-shrink-0">${MAC_ICONS.macScreen}</span>
                  <span>[LIVE PIPELINE CONSOLE STREAM]</span>
                </span>
                <div class="flex items-center gap-2">
                  <button id="btnCopyPipelineLogs" class="text-[10px] text-[#737373] hover:text-white cursor-pointer uppercase font-bold">
                    COPY LOGS
                  </button>
                  <button id="btnClearPipelineLogs" class="text-[10px] text-[#737373] hover:text-white cursor-pointer uppercase font-bold">
                    CLEAR
                  </button>
                </div>
              </div>

              <pre id="pipelineTerminalStream" class="flex-1 overflow-y-auto p-3 bg-[#000000] border border-[#1a1a1a] rounded text-[11px] font-mono leading-relaxed custom-scrollbar whitespace-pre-wrap select-text">${(this.pipelineTerminalLogs.length > 0 ? this.pipelineTerminalLogs : p.logs || []).map((l: any) => this.formatTerminalLogLine(l)).join('\n')}</pre>
            </div>

            <!-- Right Governance, Test & SAST Cards (5 cols) -->
            <div class="lg:col-span-5 space-y-4">
              
              <!-- SAST Security Scan Card -->
              <div class="retro-panel p-4 border border-[#383838] space-y-2.5 shadow-lg">
                <div class="flex items-center justify-between border-b border-[#242424] pb-2">
                  <span class="text-xs font-bold text-white uppercase flex items-center gap-2">
                    <span class="text-[#38bdf8]">[#]</span>
                    <span>SAST SECURITY AUDIT</span>
                  </span>
                  <span class="text-[10px] px-2 py-0.5 bg-[#082038] border border-[#0369a1] text-[#38bdf8] rounded font-bold">GRADE A+</span>
                </div>
                <div class="space-y-1.5 text-xs text-[#a3a3a3] font-sans">
                  <div class="flex items-center justify-between font-mono">
                    <span>Shannon Secret Entropy:</span>
                    <span class="text-[#4ade80] font-bold">0 Leaks Detected</span>
                  </div>
                  <div class="flex items-center justify-between font-mono">
                    <span>Static AST Vulnerabilities:</span>
                    <span class="text-[#4ade80] font-bold">0 High / 0 Crit</span>
                  </div>
                  <div class="flex items-center justify-between font-mono">
                    <span>Dependency CVE Audit:</span>
                    <span class="text-white font-bold">All 18 Clean</span>
                  </div>
                </div>
              </div>

              <!-- JUnit 5 & Jest Test Metrics Card -->
              <div class="retro-panel p-4 border border-[#383838] space-y-2.5 shadow-lg">
                <div class="flex items-center justify-between border-b border-[#242424] pb-2">
                  <span class="text-xs font-bold text-white uppercase flex items-center gap-2">
                    <span class="text-[#38bdf8]">${MAC_ICONS.doc}</span>
                    <span>AUTOMATED QA SUITE</span>
                  </span>
                  <span class="text-[10px] text-[#4ade80] font-bold">24 / 24 PASSED</span>
                </div>
                <div class="space-y-2">
                  <div class="flex items-center justify-between text-xs font-mono">
                    <span class="text-[#a3a3a3]">Branch Coverage:</span>
                    <span class="text-white font-bold">${p.coveragePercent || 94.5}%</span>
                  </div>
                  <!-- Progress Bar -->
                  <div class="w-full h-2 bg-[#141414] border border-[#242424] rounded-full overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-[#0369a1] to-[#38bdf8]" style="width: ${p.coveragePercent || 94.5}%"></div>
                  </div>
                </div>
              </div>

              <!-- Packaging & Checksum Artifact Card -->
              <div class="retro-panel p-4 border border-[#383838] space-y-2.5 shadow-lg">
                <div class="flex items-center justify-between border-b border-[#242424] pb-2">
                  <span class="text-xs font-bold text-white uppercase flex items-center gap-2">
                    <span class="text-[#38bdf8]">${MAC_ICONS.floppy}</span>
                    <span>ARTIFACT PACKAGING</span>
                  </span>
                  <span class="text-[9px] text-[#737373] uppercase font-mono">JAR BINARY</span>
                </div>
                <div class="space-y-1.5 text-xs">
                  <div class="font-mono text-white font-bold truncate">${p.artifactName || 'spring-enterprise-service-1.0.0.jar'}</div>
                  <div class="text-[10px] text-[#737373] font-mono break-all leading-tight bg-[#050505] p-2 border border-[#1f1f1f] rounded">
                    SHA-256: ${p.artifactSha256 || '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'}
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    `;
  }

  private renderPipelineTriggerModal(): string {
    if (!this.pipelineTriggerModalOpen) return '';
    return `
      <div class="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-mono select-none">
        <div class="max-w-md w-full retro-panel p-6 space-y-4 text-xs shadow-2xl animate-fadeIn border-2 border-white">
          <div class="flex items-center justify-between border-b border-[#242424] pb-2">
            <span class="font-bold text-white uppercase flex items-center gap-2">
              <span class="text-[#38bdf8] flex-shrink-0">[>]</span>
              <span>[TRIGGER CI/CD PIPELINE]</span>
            </span>
            <button id="btnClosePipelineModal" class="text-[#737373] hover:text-white cursor-pointer">✕</button>
          </div>
          
          <p class="text-[#a3a3a3] leading-relaxed">
            Dispatch a multi-stage autonomous build job across the distributed AST, SAST, and Test workers.
          </p>

          <div class="space-y-3">
            <div class="space-y-1">
              <label class="text-[10px] text-white uppercase font-bold">REPOSITORY NAME</label>
              <input type="text" id="inputPipelineRepo" value="${this.escapeHtml(this.pipelineRepoInput)}" class="w-full bg-[#000000] border border-[#383838] focus:border-[#38bdf8] rounded p-2.5 text-white font-mono text-xs outline-none shadow-inner" />
            </div>

            <div class="space-y-1">
              <label class="text-[10px] text-white uppercase font-bold">GIT TARGET BRANCH</label>
              <input type="text" id="inputPipelineBranch" value="${this.escapeHtml(this.pipelineBranchInput)}" class="w-full bg-[#000000] border border-[#383838] focus:border-[#38bdf8] rounded p-2.5 text-white font-mono text-xs outline-none shadow-inner" />
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2 border-t border-[#242424]">
            <button id="btnCancelPipelineModal" class="retro-btn">CANCEL</button>
            <button id="btnExecutePipelineRun" class="retro-btn retro-btn-accent flex items-center gap-1.5 font-bold">
              <span>[>] RUN PIPELINE NOW</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  private async setCustomFolder(path: string) {
    if (!path || !path.trim()) return;
    try {
      soundEngine.playMechanicalKeyboardClick();
      this.showToast(`[..] Setting workspace to ${path.trim()}...`);
      const res = await api.setFolder(path.trim());
      if (res && res.currentFolder) {
        this.currentWorkspacePath = res.currentFolder;
      } else {
        this.currentWorkspacePath = path.trim();
      }
      this.customFolderInput = this.currentWorkspacePath;
      this.showFolderModal = false;
      await this.loadFiles();
      await this.bundleProjectToSrcDoc();
      this.render();
      this.updatePreviewIframe();
      this.showToast(`[+] Active workspace directory: ${this.getFolderDisplayBasename()}`);
    } catch (e: any) {
      this.showToast(`Folder update error: ${e.message}`, true);
    }
  }

  private renderFolderSelectionModal(): string {
    if (!this.showFolderModal) return '';
    return `
      <div class="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-mono select-none">
        <div class="max-w-lg w-full retro-panel p-6 space-y-4 text-xs shadow-2xl animate-fadeIn border-2 border-white">
          <div class="flex items-center justify-between border-b border-[#242424] pb-2">
            <span class="font-bold text-white uppercase flex items-center gap-2">
              <span class="text-[#38bdf8] flex-shrink-0 text-base">📁</span>
              <span>[WORKSPACE DIRECTORY CONFIGURATION]</span>
            </span>
            <button id="btnCloseFolderModal" class="text-[#737373] hover:text-white cursor-pointer text-sm">✕</button>
          </div>
          
          <!-- Current Active Path Display -->
          <div class="space-y-1.5 p-3 bg-[#050505] border border-[#242424] rounded">
            <div class="flex items-center justify-between text-[10px] text-[#737373] font-bold">
              <span>CURRENT ACTIVE WORKSPACE ROOT:</span>
              <button id="btnModalOpenInOs" class="text-[#38bdf8] hover:underline cursor-pointer">↗ OPEN IN EXPLORER</button>
            </div>
            <div class="p-2.5 bg-[#000000] border border-[#383838] rounded text-white font-mono text-xs select-text break-all font-bold">
              ${this.escapeHtml(this.currentWorkspacePath)}
            </div>
          </div>

          <!-- 1. Native Windows Folder Picker Dialog (1-Click) -->
          <div class="p-3.5 bg-[#082038] border border-[#0369a1] rounded space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-bold text-[#38bdf8] text-[11px] uppercase">1. BROWSE SYSTEM FOLDERS (NATIVE WINDOWS DIALOG)</span>
            </div>
            <p class="text-[10.5px] text-[#93c5fd] font-sans">
              Click to open the Windows Folder Selector to choose any existing folder or create a new project directory.
            </p>
            <button id="btnPickFolderDialog" class="w-full retro-btn retro-btn-accent py-2 text-xs font-bold flex items-center justify-center gap-2 shadow-md">
              <span>📁 OPEN WINDOWS FOLDER BROWSER DIALOG ↵</span>
            </button>
          </div>

          <!-- 2. Manual Custom Path Input -->
          <div class="space-y-2">
            <label class="text-[10px] text-white uppercase font-bold">2. OR TYPE / PASTE CUSTOM PATH DIRECTLY:</label>
            <div class="flex gap-2">
              <input type="text" id="inputCustomFolderPath" value="${this.escapeHtml(this.customFolderInput || this.currentWorkspacePath)}" placeholder="e.g. C:/Users/prana/Downloads/agent/workspace" class="flex-1 bg-[#000000] border border-[#383838] focus:border-[#38bdf8] rounded p-2 text-white font-mono text-xs outline-none shadow-inner" />
              <button id="btnApplyCustomFolder" class="retro-btn retro-btn-white px-4 font-bold">
                APPLY
              </button>
            </div>
          </div>

          <!-- 3. Quick Folder Presets -->
          <div class="space-y-1.5 pt-1">
            <label class="text-[10px] text-[#737373] uppercase font-bold">QUICK PRESET DIRECTORIES:</label>
            <div class="grid grid-cols-2 gap-2">
              <button class="btn-quick-folder p-2 bg-[#121212] hover:bg-[#1a1a1a] border border-[#242424] hover:border-[#38bdf8] rounded text-left flex flex-col gap-0.5 transition cursor-pointer" data-path="${this.commonFolders['projectWorkspace'] || 'workspace'}">
                <span class="font-bold text-white text-[11px] flex items-center gap-1">📁 Default Workspace</span>
                <span class="text-[9px] text-[#737373] truncate font-mono">${this.commonFolders['projectWorkspace'] || 'workspace'}</span>
              </button>
              <button class="btn-quick-folder p-2 bg-[#121212] hover:bg-[#1a1a1a] border border-[#242424] hover:border-[#38bdf8] rounded text-left flex flex-col gap-0.5 transition cursor-pointer" data-path="${this.commonFolders['downloads'] || 'C:/Users/prana/Downloads'}">
                <span class="font-bold text-white text-[11px] flex items-center gap-1">📥 Downloads</span>
                <span class="text-[9px] text-[#737373] truncate font-mono">${this.commonFolders['downloads'] || 'Downloads'}</span>
              </button>
              <button class="btn-quick-folder p-2 bg-[#121212] hover:bg-[#1a1a1a] border border-[#242424] hover:border-[#38bdf8] rounded text-left flex flex-col gap-0.5 transition cursor-pointer" data-path="${this.commonFolders['desktop'] || 'C:/Users/prana/Desktop'}">
                <span class="font-bold text-white text-[11px] flex items-center gap-1">🖥️ Desktop</span>
                <span class="text-[9px] text-[#737373] truncate font-mono">${this.commonFolders['desktop'] || 'Desktop'}</span>
              </button>
              <button class="btn-quick-folder p-2 bg-[#121212] hover:bg-[#1a1a1a] border border-[#242424] hover:border-[#38bdf8] rounded text-left flex flex-col gap-0.5 transition cursor-pointer" data-path="${this.commonFolders['documents'] || 'C:/Users/prana/Documents'}">
                <span class="font-bold text-white text-[11px] flex items-center gap-1">📄 Documents</span>
                <span class="text-[9px] text-[#737373] truncate font-mono">${this.commonFolders['documents'] || 'Documents'}</span>
              </button>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-3 border-t border-[#242424]">
            <button id="btnCancelFolderModal" class="retro-btn px-4 py-1.5 font-bold">CLOSE</button>
          </div>
        </div>
      </div>
    `;
  }

  private renderUserAccountModal(): string {
    if (!this.showUserMenu) return '';
    return `
      <div class="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-mono select-none">
        <div class="max-w-md w-full retro-panel p-6 space-y-4 text-xs shadow-2xl animate-fadeIn border-2 border-white">
          <div class="flex items-center justify-between border-b border-[#242424] pb-2">
            <span class="font-bold text-white uppercase flex items-center gap-2">
              <span class="text-[#38bdf8] flex-shrink-0">${MAC_ICONS.github}</span>
              <span>[GITHUB PROFILE // ACCOUNT]</span>
            </span>
            <button id="btnCloseUserMenu" class="text-[#737373] hover:text-white cursor-pointer">✕</button>
          </div>
          
          <!-- GitHub Profile Card -->
          <div class="flex items-center gap-3.5 p-3.5 bg-[#050505] border border-[#242424] rounded shadow-inner">
            <img src="${this.getUserAvatarUrl()}" alt="${this.escapeHtml(this.userProfile.login)}" class="w-12 h-12 rounded-full border-2 border-[#38bdf8] object-cover flex-shrink-0 shadow-[0_0_12px_rgba(56,189,248,0.4)]" onerror="this.onerror=null; this.src='https://avatars.githubusercontent.com/u/9919?v=4';" />
            <div class="flex flex-col min-w-0 space-y-1">
              <div class="flex items-center gap-2">
                <span class="font-bold text-white text-sm truncate font-mono">${this.userProfile.login}</span>
                <span class="text-[9px] px-1.5 py-0.2 bg-[#082038] border border-[#0369a1] text-[#38bdf8] rounded font-bold uppercase">GITHUB USER</span>
              </div>
              <span class="text-[10px] text-[#a3a3a3] truncate font-mono">${this.userProfile.organization || 'GitHub Workspace'}</span>
            </div>
          </div>

          <div class="space-y-2 text-white">
            <div class="flex items-center gap-2">
              <span class="text-[#737373]">ACTIVE WORKSPACE:</span>
              <span class="truncate text-[#38bdf8] font-bold font-mono">${this.currentWorkspacePath}</span>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2 border-t border-[#242424]">
            <button id="btnSignOutGitHub" class="retro-btn retro-btn-danger flex items-center gap-1.5 font-bold">
              ${MAC_ICONS.bomb}
              <span>SIGN OUT / SWITCH USER</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // --- Rendering & SPA Routing Views ---

  public renderWorkspaceView(): void {
    this.container.innerHTML = this.getWorkspaceHtml();
    this.attachEventListeners();
    this.updatePreviewIframe();
  }

  public renderLoginView(): void {
    this.container.innerHTML = this.getLoginHtml();
    this.attachLoginEventListeners();
  }

  public renderLandingView(): void {
    this.container.innerHTML = this.getLandingHtml();
    this.attachLandingEventListeners();
  }

  public render(): void {
    if (this.currentRoute === 'landing') {
      this.renderLandingView();
    } else if (this.currentRoute === 'login') {
      this.renderLoginView();
    } else {
      this.renderWorkspaceView();
    }
  }

  // --- Landing & Login Pages ---

  private getLandingCodeSnippet(): string {
    if (this.landingCodeTab === 'curl') {
      return `# Direct Autonomous Multi-Agent Synthesis via REST API
curl -X POST http://localhost:8080/api/task \\
  -H "Content-Type: application/json" \\
  -d '{
    "mode": "agent",
    "prompt": "Synthesize a 2D retro arcade space game with canvas physics, score counter, and Web Audio effects.",
    "targetDirectory": "workspace"
  }'`;
    }

    if (this.landingCodeTab === 'py') {
      return `from retro_agent import AgentSwarm

# 1. Connect to Autonomous Backend Multi-Agent Swarm
swarm = AgentSwarm(
    endpoint="http://localhost:8080",
    workspace="./workspace"
)

# 2. Execute multi-file software synthesis with AST validation
result = swarm.synthesize(
    prompt="Create a real-time reactive telemetry dashboard with live chart metrics and dark theme",
    mode="agent",
    validate_ast=True
)

print(f"[+] Synthesized {len(result.files)} files directly to disk.")`;
    }

    // Default: TypeScript / Node.js
    return `import { AutonomousAgent } from '@retro/agent-sdk';

// 1. Initialize Multi-Agent Swarm for local workspace synthesis
const agent = new AutonomousAgent({
  endpoint: 'http://localhost:8080/api/task',
  workspace: './workspace'
});

// 2. Run autonomous synthesis with AST & QA test validation
await agent.execute({
  mode: 'AGENT',
  prompt: 'Build a polyphonic synthesizer with step sequencer and audio visualizer.',
  onStep: (event) => console.log(\`[\${event.role}] \${event.content}\`)
});`;
  }

  public getLandingHtml(): string {
    return `
      <div class="fixed inset-0 w-full h-full bg-[#000000] text-white font-mono overflow-y-auto z-30 custom-scrollbar select-none">
        
        <!-- 1. Header Navigation -->
        <header class="border-b border-[#242424] bg-[#0a0a0a] sticky top-0 z-40 shadow-md">
          <div class="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <div class="flex items-center gap-2.5 cursor-pointer" id="btnLandingBrand">
              <span class="text-[#38bdf8] flex-shrink-0">${MAC_ICONS.happyMac}</span>
              <div class="flex items-center gap-1.5">
                <span class="font-bold text-sm text-white uppercase tracking-wider font-mono">RETRO</span>
                <span class="text-[9px] font-mono font-bold px-1.5 py-0.2 bg-[#38bdf8] text-black rounded-sm">STUDIO</span>
              </div>
            </div>

            <nav class="hidden md:flex items-center gap-6 text-xs text-[#737373] font-bold">
              <a href="#code-example" class="hover:text-white transition cursor-pointer">CODE EXAMPLE</a>
              <a href="#swarm" class="hover:text-white transition cursor-pointer">SWARM PIPELINE</a>
              <a href="#sandbox" class="hover:text-white transition cursor-pointer">SANDBOX RUNNER</a>
              <a href="#specs" class="hover:text-white transition cursor-pointer">SYSTEM SPECS</a>
            </nav>

            <div class="flex items-center gap-2">
              <button id="btnLandingAudioDemo" class="retro-btn px-2.5 py-1 text-[10px] hidden sm:flex items-center gap-1 font-bold" title="Test Retro CRT Audio Engine">
                ${MAC_ICONS.sound}
                <span>AUDIO TEST</span>
              </button>
              <button id="btnLandingGitHubLogin" class="retro-btn retro-btn-accent px-3.5 py-1.5 text-xs font-bold flex items-center gap-2 shadow-md">
                <img src="${this.getUserAvatarUrl()}" alt="${this.escapeHtml(this.userProfile.login)}" class="w-4 h-4 rounded-full border border-black object-cover flex-shrink-0" onerror="this.onerror=null; this.src='https://avatars.githubusercontent.com/u/9919?v=4';" />
                <span>${this.userProfile.authenticated && this.userProfile.login !== 'Guest' ? this.userProfile.login.toUpperCase() : 'LOGIN WITH GITHUB'} ↵</span>
              </button>
            </div>
          </div>
        </header>

        <!-- 2. Hero Section -->
        <main class="max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-24 space-y-16">
          <div class="text-center space-y-6 max-w-3xl mx-auto">
            <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#38bdf8] bg-[#082038] text-[#38bdf8] text-[10px] font-bold uppercase tracking-widest shadow-[0_0_12px_rgba(56,189,248,0.35)]">
              <span class="led-indicator led-accent led-pulsing"></span>
              <span>SKEUOMORPHIC RETRO-MINIMALISM // WHITE, BLACK &amp; LIGHT BLUE</span>
            </div>

            <h1 class="text-4xl sm:text-6xl font-black text-white tracking-tight uppercase leading-none drop-shadow-md">
              Autonomous Software Studio.
            </h1>

            <p class="text-sm sm:text-base text-[#a3a3a3] leading-relaxed font-sans max-w-2xl mx-auto">
              A high-precision developer console adhering strictly to Brauncore functionalism. Decompose architectural prompts, synthesize multi-file full-stack codebases, execute in live sandboxes, and self-heal with real-time mechanical keyboard acoustic feedback.
            </p>

            <div class="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button id="btnHeroLaunch" class="retro-btn retro-btn-accent px-7 py-3 text-xs font-bold text-sm shadow-xl flex items-center gap-2">
                ${MAC_ICONS.github}
                <span>SIGN IN WITH GITHUB ↵</span>
              </button>
              <a href="#code-example" class="retro-btn px-5 py-3 text-xs font-bold flex items-center gap-2 text-white">
                ${MAC_ICONS.doc}
                <span>VIEW CODE EXAMPLE</span>
              </a>
            </div>
          </div>

          <!-- 3. Interactive Skeuomorphic Telemetry Screen Preview Mockup -->
          <div class="retro-panel border-2 border-white p-4 sm:p-6 shadow-2xl space-y-4">
            <div class="flex items-center justify-between border-b border-[#242424] pb-3">
              <div class="flex items-center gap-3">
                <span class="screw-head"></span>
                <span class="text-xs font-bold text-white uppercase tracking-wider">[LIVE TELEMETRY &amp; REASONING MONITOR]</span>
              </div>
              <div class="flex items-center gap-2 text-[10px] text-[#737373]">
                <span class="led-indicator led-accent led-pulsing"></span>
                <span class="text-[#38bdf8] font-bold">PORT 8080 // ONLINE</span>
              </div>
            </div>

            <!-- Inset Bezel Display -->
            <div class="retro-screen-telemetry p-4 space-y-3 shadow-inner">
              <div class="flex items-center justify-between border-b border-[#0b2540] pb-2 text-xs">
                <div class="flex items-center gap-2">
                  <span class="text-[#38bdf8]">${MAC_ICONS.macScreen}</span>
                  <span class="font-bold text-[#38bdf8]">DEEPSEEK-CODER // MULTI-AGENT SWARM ACTIVE</span>
                </div>
                <!-- Cassette Reels & VU Meter -->
                <div class="flex items-center gap-3">
                  <div class="flex items-center gap-1 px-1.5 py-0.5 bg-[#000000] border border-[#242424] rounded">
                    <svg class="w-3.5 h-3.5 text-[#38bdf8] tape-spool-active" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <circle cx="12" cy="12" r="10" />
                      <circle cx="12" cy="12" r="3" />
                      <path d="M12 2v7M12 15v7M2 12h7M15 12h7" />
                    </svg>
                    <svg class="w-3.5 h-3.5 text-[#38bdf8] tape-spool-active" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <circle cx="12" cy="12" r="10" />
                      <circle cx="12" cy="12" r="3" />
                      <path d="M12 2v7M12 15v7M2 12h7M15 12h7" />
                    </svg>
                  </div>
                  <div class="vu-meter-chassis hidden sm:block">
                    <div class="vu-meter-scale"></div>
                    <div class="vu-needle active-high"></div>
                    <div class="absolute bottom-1 right-2 text-[7px] font-mono text-[#000000] font-extrabold">VU dB</div>
                  </div>
                </div>
              </div>

              <!-- Live Stream Logs Mockup -->
              <div class="bg-[#020912] border border-[#0b2540] rounded p-3 text-xs space-y-1.5 select-none text-[11px]">
                <div class="flex items-start gap-2">
                  <span class="text-[#0369a1] font-bold">[10:48:12]</span>
                  <span class="text-[#38bdf8] font-bold">[ARCHITECT]</span>
                  <span class="text-[#e0f2fe]">Deconstructed prompt into 4 modular application layers with AST validation.</span>
                </div>
                <div class="flex items-start gap-2">
                  <span class="text-[#0369a1] font-bold">[10:48:14]</span>
                  <span class="text-[#38bdf8] font-bold">[CODER]</span>
                  <span class="text-[#e0f2fe]">Synthesized DOM hierarchy, CSS tokens, and reactive state machine.</span>
                </div>
                <div class="flex items-start gap-2">
                  <span class="text-[#0369a1] font-bold">[10:48:16]</span>
                  <span class="text-[#38bdf8] font-bold">[TESTER]</span>
                  <span class="text-[#e0f2fe]">QA test suite passed: 100% assertions verified. No runtime exceptions.</span>
                </div>
                <div class="flex items-start gap-2">
                  <span class="text-[#0369a1] font-bold">[10:48:18]</span>
                  <span class="text-[#38bdf8] font-bold">[SECURITY]</span>
                  <span class="text-[#e0f2fe]">Sandbox security audit: Strict CSP policy verified. Local storage bounded.</span>
                </div>
              </div>

              <!-- Notification Banner -->
              <div class="p-2.5 bg-[#082038] border border-[#0369a1] rounded flex items-center justify-between text-xs text-white">
                <div class="flex items-center gap-2 truncate">
                  <span class="text-[#38bdf8]">${MAC_ICONS.floppy}</span>
                  <span class="font-bold text-[#38bdf8] uppercase">TARGET DIR:</span>
                  <span class="truncate font-mono">${this.currentWorkspacePath}/index.html</span>
                </div>
                <span class="text-[10px] px-2 py-0.5 rounded border border-[#38bdf8] text-[#38bdf8] font-bold">READY</span>
              </div>
            </div>
          </div>

          <!-- 4. Interactive Code Example (Replaces Core Capabilities) -->
          <div id="code-example" class="space-y-4 pt-4">
            <div class="flex items-center justify-between border-b border-[#242424] pb-2">
              <span class="font-bold text-xs text-white uppercase flex items-center gap-2">
                <span class="text-[#38bdf8]">${MAC_ICONS.doc}</span>
                <span>AUTONOMOUS CODE GENERATION // SDK &amp; API CODE EXAMPLE</span>
              </span>
              <span class="text-[10px] text-[#737373]">INTERACTIVE EXAMPLES</span>
            </div>

            <div class="retro-panel border border-[#383838] p-4 sm:p-6 space-y-4 shadow-2xl">
              <!-- Code Tab Selector Bar -->
              <div class="flex items-center justify-between flex-wrap gap-2 border-b border-[#242424] pb-3">
                <div class="flex items-center gap-1.5">
                  <button class="btn-code-tab px-3 py-1.5 rounded text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer ${this.landingCodeTab === 'ts' ? 'bg-[#38bdf8] text-black shadow' : 'bg-[#141414] text-[#737373] hover:text-white border border-[#242424]'}" data-tab="ts">
                    <span>TYPESCRIPT / NODE.JS</span>
                  </button>
                  <button class="btn-code-tab px-3 py-1.5 rounded text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer ${this.landingCodeTab === 'curl' ? 'bg-[#38bdf8] text-black shadow' : 'bg-[#141414] text-[#737373] hover:text-white border border-[#242424]'}" data-tab="curl">
                    <span>cURL / REST API</span>
                  </button>
                  <button class="btn-code-tab px-3 py-1.5 rounded text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer ${this.landingCodeTab === 'py' ? 'bg-[#38bdf8] text-black shadow' : 'bg-[#141414] text-[#737373] hover:text-white border border-[#242424]'}" data-tab="py">
                    <span>PYTHON SDK</span>
                  </button>
                </div>

                <button id="btnCopyLandingCode" class="retro-btn px-3 py-1 text-[10px] font-mono flex items-center gap-1.5 font-bold" data-code="${this.escapeHtml(this.getLandingCodeSnippet())}">
                  ${MAC_ICONS.doc}
                  <span id="copyLandingCodeLabel">COPY CODE</span>
                </button>
              </div>

              <!-- Code Box Content with Dark Terminal Chassis -->
              <div class="bg-[#050505] border border-[#242424] rounded p-4 font-mono text-xs overflow-x-auto custom-scrollbar relative shadow-inner">
                <pre class="text-[#38bdf8] leading-relaxed select-text"><code>${this.escapeHtml(this.getLandingCodeSnippet())}</code></pre>
              </div>

              <div class="flex items-center justify-between text-[11px] text-[#737373] pt-1">
                <div class="flex items-center gap-2">
                  <span class="screw-head"></span>
                  <span>Direct local AST parsing with 100% offline synthesis capability.</span>
                </div>
                <span class="text-[#38bdf8] font-bold font-mono">STATUS: 200 OK</span>
              </div>
            </div>
          </div>

          <!-- 5. Swarm Pipeline Section -->
          <div id="swarm" class="space-y-6 pt-4">
            <div class="flex items-center justify-between border-b border-[#242424] pb-2">
              <span class="font-bold text-xs text-white uppercase flex items-center gap-2">
                <span class="text-[#38bdf8]">${MAC_ICONS.briefcase}</span>
                <span>AUTONOMOUS SWARM ARCHITECTURE</span>
              </span>
              <span class="text-[10px] text-[#737373]">SEQUENTIAL ORCHESTRATION</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div class="p-3.5 retro-panel border border-[#242424] text-xs space-y-1 text-center">
                <div class="font-bold text-[#38bdf8] text-[10px]">STAGE 1</div>
                <div class="font-bold text-white text-[11px]">ARCHITECT</div>
                <div class="text-[10px] text-[#737373] font-sans">Prompt decomposition &amp; plan checklist</div>
              </div>
              <div class="p-3.5 retro-panel border border-[#242424] text-xs space-y-1 text-center">
                <div class="font-bold text-[#38bdf8] text-[10px]">STAGE 2</div>
                <div class="font-bold text-white text-[11px]">CODER</div>
                <div class="text-[10px] text-[#737373] font-sans">Code synthesis &amp; multi-file write</div>
              </div>
              <div class="p-3.5 retro-panel border border-[#242424] text-xs space-y-1 text-center">
                <div class="font-bold text-[#38bdf8] text-[10px]">STAGE 3</div>
                <div class="font-bold text-white text-[11px]">QA TESTER</div>
                <div class="text-[10px] text-[#737373] font-sans">Test suite execution &amp; assertions</div>
              </div>
              <div class="p-3.5 retro-panel border border-[#242424] text-xs space-y-1 text-center">
                <div class="font-bold text-[#38bdf8] text-[10px]">STAGE 4</div>
                <div class="font-bold text-white text-[11px]">SECURITY</div>
                <div class="text-[10px] text-[#737373] font-sans">Sandbox policy &amp; audit analysis</div>
              </div>
              <div class="p-3.5 retro-panel border border-[#242424] text-xs space-y-1 text-center">
                <div class="font-bold text-[#38bdf8] text-[10px]">STAGE 5</div>
                <div class="font-bold text-white text-[11px]">DEVOPS</div>
                <div class="text-[10px] text-[#737373] font-sans">Checkpoints &amp; export packaging</div>
              </div>
            </div>
          </div>

          <!-- 6. Sandbox & Dual Modes Breakdown -->
          <div id="sandbox" class="space-y-6 pt-4">
            <div class="flex items-center justify-between border-b border-[#242424] pb-2">
              <span class="font-bold text-xs text-white uppercase flex items-center gap-2">
                <span class="text-[#38bdf8]">${MAC_ICONS.macScreen}</span>
                <span>DUAL EXECUTION MODES &amp; SANDBOX</span>
              </span>
              <span class="text-[10px] text-[#737373]">AGENT vs ASK</span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="p-5 retro-panel border border-[#38bdf8] space-y-3">
                <div class="flex items-center gap-2">
                  <span class="text-[#38bdf8]">${MAC_ICONS.happyMac}</span>
                  <span class="font-bold text-white text-xs uppercase">5-AGENT SWARM // FULL AUTONOMY</span>
                </div>
                <p class="text-xs text-[#a3a3a3] font-sans leading-relaxed">
                  Autonomous multi-agent orchestration. Architect, Coder, QA Tester, Security Reviewer, and DevOps synthesize complete production codebases directly to disk.
                </p>
                <div class="flex items-center gap-2 text-[10px] font-mono text-[#38bdf8]">
                  <span class="screw-head"></span>
                  <span>BEST FOR: FULL APPS, GAMES, DASHBOARDS, TOOLS</span>
                </div>
              </div>

              <div class="p-5 retro-panel border border-[#242424] space-y-3">
                <div class="flex items-center gap-2">
                  <span class="text-white">${MAC_ICONS.macScreen}</span>
                  <span class="font-bold text-white text-xs uppercase">LIVE PREVIEW RUNNER // ZERO CONFIG</span>
                </div>
                <p class="text-xs text-[#a3a3a3] font-sans leading-relaxed">
                  Instant hot-reloading browser preview environment with sandboxed telemetry, DOM inspector, console logs, and CRT phosphor monitor rendering.
                </p>
                <div class="flex items-center gap-2 text-[10px] font-mono text-[#737373]">
                  <span class="screw-head"></span>
                  <span>BUILT-IN: TAILWIND, LUCIDE, THREE.JS, CANVAS 2D</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 7. Metrics Strip -->
          <div id="specs" class="retro-panel p-6 border border-[#383838] grid grid-cols-2 md:grid-cols-4 gap-4 text-center shadow-xl">
            <div class="space-y-1">
              <div class="text-2xl sm:text-3xl font-black text-white">0.00s</div>
              <div class="text-[10px] text-[#737373] uppercase font-bold">Audio Latency</div>
            </div>
            <div class="space-y-1">
              <div class="text-2xl sm:text-3xl font-black text-[#38bdf8]">100%</div>
              <div class="text-[10px] text-[#737373] uppercase font-bold">Local File Sync</div>
            </div>
            <div class="space-y-1">
              <div class="text-2xl sm:text-3xl font-black text-white">5-Node</div>
              <div class="text-[10px] text-[#737373] uppercase font-bold">Swarm Pipeline</div>
            </div>
            <div class="space-y-1">
              <div class="text-2xl sm:text-3xl font-black text-[#38bdf8]">0</div>
              <div class="text-[10px] text-[#737373] uppercase font-bold">External Assets</div>
            </div>
          </div>

          <!-- 8. Call To Action Footer Banner -->
          <div class="text-center p-8 retro-panel border-2 border-white space-y-4 shadow-2xl">
            <h2 class="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">Ready to build with GitHub?</h2>
            <p class="text-xs text-[#a3a3a3] max-w-md mx-auto font-sans">Authenticate with your GitHub account, select your workspace folder, and synthesize software with multi-agent intelligence.</p>
            <div class="pt-2">
              <button id="btnBottomEnterStudio" class="retro-btn retro-btn-accent px-8 py-3 text-xs font-bold text-sm shadow-xl flex items-center gap-2 mx-auto">
                ${MAC_ICONS.github}
                <span>SIGN IN WITH GITHUB ↵</span>
              </button>
            </div>
          </div>
        </main>

        <!-- 9. Footer -->
        <footer class="border-t border-[#242424] bg-[#050505] py-8 text-xs text-[#737373]">
          <div class="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="flex items-center gap-2">
              <span class="text-[#38bdf8]">${MAC_ICONS.happyMac}</span>
              <span class="text-white font-bold">SPRINGAI-AGENT // AUTONOMOUS SOFTWARE ENGINEERING</span>
            </div>
            <div class="flex items-center gap-2 text-[10px]">
              <span class="led-indicator led-accent"></span>
              <span class="text-white">SYSTEM OPERATIONAL</span>
            </div>
          </div>
        </footer>
      </div>
    `;
  }

  public getLoginHtml(): string {
    return `
      <div class="fixed inset-0 w-full h-full bg-[#000000] text-white font-mono flex flex-col items-center justify-center p-4 z-30 select-none">
        <div class="max-w-md w-full retro-panel p-6 space-y-4 shadow-2xl animate-fadeIn border-2 border-white">
          <div class="flex items-center justify-between border-b border-[#242424] pb-2">
            <span class="font-bold text-xs text-white uppercase flex items-center gap-2">
              <span class="text-[#38bdf8] flex-shrink-0">${MAC_ICONS.github}</span>
              <span>[GITHUB AUTHENTICATION // SPRINGAI-AGENT]</span>
            </span>
            <button id="btnBackToLanding" class="text-xs text-[#737373] hover:text-white cursor-pointer">✕</button>
          </div>
          <div class="space-y-3">
            <p class="text-xs text-[#a3a3a3] leading-relaxed">
              Connect your GitHub profile to manage workspace repositories, synthesize codebases, and commit snapshots.
            </p>
            
            <!-- Live Profile Avatar & Handle Input Card -->
            <div class="flex items-center gap-3.5 p-3 bg-[#050505] border border-[#242424] rounded shadow-inner">
              <img id="loginAvatarPreview" src="${this.getUserAvatarUrl()}" alt="GitHub Avatar" class="w-12 h-12 rounded-full border-2 border-[#38bdf8] object-cover flex-shrink-0 shadow-[0_0_12px_rgba(56,189,248,0.4)]" onerror="this.onerror=null; this.src='https://avatars.githubusercontent.com/u/9919?v=4';" />
              <div class="flex flex-col min-w-0 flex-1 space-y-1">
                <label class="text-[10px] text-white uppercase font-bold">GITHUB USERNAME / HANDLE</label>
                <input type="text" id="inputLoginUsername" placeholder="e.g. Developer or octocat" value="${this.escapeHtml(this.userProfile.login || 'Developer')}" class="w-full bg-[#000000] border border-[#383838] focus:border-[#38bdf8] rounded p-2 text-white font-mono text-xs outline-none shadow-inner" />
              </div>
            </div>
          </div>
          <div class="pt-2">
            <button id="btnAuthorizeGitHub" class="w-full retro-btn retro-btn-accent py-2.5 text-xs font-bold flex items-center justify-center gap-2">
              ${MAC_ICONS.github}
              <span>AUTHORIZE WITH GITHUB ↵</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  private attachLandingEventListeners(): void {
    document.getElementById('btnLandingBrand')?.addEventListener('click', () => this.navigateTo('landing'));
    document.getElementById('btnLandingGitHubLogin')?.addEventListener('click', () => this.navigateTo('login'));
    document.getElementById('btnHeroLaunch')?.addEventListener('click', () => this.navigateTo('login'));
    document.getElementById('btnBottomEnterStudio')?.addEventListener('click', () => this.navigateTo('login'));
    
    document.getElementById('btnLandingAudioDemo')?.addEventListener('click', () => {
      soundEngine.playCrtClick();
      this.showToast('🔊 Classic Retro CRT Click');
    });

    // Code Example Tab Selector (TS, cURL, Python)
    document.querySelectorAll('.btn-code-tab').forEach(btn => {
      btn.addEventListener('click', (e) => {
        soundEngine.playMechanicalKeyboardClick();
        const tab = (e.currentTarget as HTMLElement).dataset['tab'] as 'ts' | 'curl' | 'py';
        if (tab) {
          this.landingCodeTab = tab;
          this.render();
        }
      });
    });

    // Copy Code Button
    document.getElementById('btnCopyLandingCode')?.addEventListener('click', (e) => {
      soundEngine.playMechanicalKeyboardClick();
      const code = (e.currentTarget as HTMLElement).dataset['code'] || this.getLandingCodeSnippet();
      if (code) {
        navigator.clipboard.writeText(code);
        const label = document.getElementById('copyLandingCodeLabel');
        if (label) {
          label.textContent = 'COPIED!';
          setTimeout(() => { label.textContent = 'COPY CODE'; }, 1800);
        }
        this.showToast('[+] Code snippet copied to clipboard');
      }
    });
  }

  private attachLoginEventListeners(): void {
    document.getElementById('btnBackToLanding')?.addEventListener('click', () => this.navigateTo('landing'));

    const input = document.getElementById('inputLoginUsername') as HTMLInputElement;
    const previewImg = document.getElementById('loginAvatarPreview') as HTMLImageElement;
    if (input && previewImg) {
      input.addEventListener('input', () => {
        const val = input.value.trim() || 'Developer';
        previewImg.src = `https://github.com/${encodeURIComponent(val)}.png`;
      });
    }

    document.getElementById('btnAuthorizeGitHub')?.addEventListener('click', () => {
      soundEngine.playMechanicalKeyboardClick();
      const val = input?.value.trim() || 'Developer';
      this.userProfile = {
        login: val,
        name: val,
        avatar_url: `https://github.com/${val}.png`,
        organization: 'GitHub Workspace',
        authenticated: true
      };
      this.currentTenant = val.toLowerCase();
      localStorage.setItem('agent_user_profile', JSON.stringify(this.userProfile));
      localStorage.setItem('agent_tenant', this.currentTenant);
      localStorage.removeItem('agent_logged_out');
      this.showToast(`[+] Logged in as @${val} via GitHub`);
      this.navigateTo('workspace');
    });
  }
}
