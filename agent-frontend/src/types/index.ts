export type AgentEventType =
  | 'THOUGHT'
  | 'ACTION'
  | 'OBSERVATION'
  | 'STEP_PROGRESS'
  | 'SWARM_STATUS'
  | 'TEST_REPORT'
  | 'SECURITY_AUDIT'
  | 'DECISION'
  | 'ANSWER'
  | 'ASK_COMPLETE'
  | 'FINISH'
  | 'SYSTEM'
  | 'USER'
  | 'ERROR';

export type SwarmRole =
  | 'ARCHITECT'
  | 'CODER'
  | 'TESTER'
  | 'SECURITY_REVIEWER'
  | 'DEVOPS'
  | 'GENERAL'
  | 'IDLE'
  | 'COMPLETE';

export interface DecisionOption {
  id: string;
  label: string;
  action: string;
}

export interface PlanStep {
  id: string;
  file?: string;
  label: string;
  status: 'pending' | 'in_progress' | 'completed';
  completed?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent' | 'system';
  type: 'text' | 'thought' | 'action' | 'observation' | 'answer' | 'finish' | 'error' | 'decision' | 'system' | 'plan' | 'test_report' | 'security_audit';
  title?: string;
  role?: string;
  content: string;
  timestamp: string;
  toolName?: string;
  collapsed?: boolean;
  options?: DecisionOption[];
  selectedOptionId?: string;
  planTitle?: string;
  taskPrompt?: string;
  steps?: PlanStep[];
  testResults?: Array<{ name: string; status: string; description?: string }>;
  securityAudit?: { score: number; grade: string; vulnerabilities: number; checks: Array<{ name: string; status: string; detail?: string }> };
  mode?: 'agent' | 'ask';
}

export interface AgentSessionItem {
  id: string;
  title: string;
  mode: 'agent' | 'ask';
  status: 'active' | 'completed' | 'failed';
  time: string;
  messages: ChatMessage[];
}

export interface AgentEventMetadata {
  role?: SwarmRole | string;
  step?: number;
  fileName?: string;
  tests?: Array<{ name: string; passed: boolean; duration?: string }>;
  passed?: number;
  total?: number;
  audit?: { grade?: string; findings?: Array<{ rule: string; severity: string; description: string }> };
  options?: Array<{ id: string; label: string; action?: string }>;
  model?: string;
  [key: string]: unknown;
}

export interface AgentEvent {
  type: AgentEventType | string;
  source: string;
  content: string;
  timestamp?: string;
  metadata?: AgentEventMetadata;
}

export interface UserProfile {
  login: string;
  name?: string;
  avatar_url?: string;
  organization?: string;
  authenticated?: boolean;
}

export interface FileNode {
  name: string;
  path: string;
  isDirectory?: boolean;
  type?: 'file' | 'directory';
  size?: number;
  children?: FileNode[];
}

export interface TaskPayload {
  prompt: string;
  mode: 'agent' | 'ask' | string;
  systemInstruction?: string;
  temperature?: number;
  topP?: number;
  model?: string;
  title?: string;
}

export interface StudioModelItem {
  id: string;
  name: string;
  description: string;
  contextWindow: number;
  recommended: boolean;
}

export interface StudioCodeSnippets {
  curl: string;
  python: string;
  typescript: string;
  java: string;
}

export interface SavedStudioPrompt {
  id: string;
  title: string;
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
  updatedAt?: string;
}

export interface TaskResponse {
  status: string;
  mode: string;
  prompt: string;
  message: string;
  response?: string;
}

export interface SkillItem {
  id: string;
  name: string;
  description: string;
  icon?: string;
  tags: string[];
  enabled: boolean;
  custom?: boolean;
  content: string;
}

export interface AgentPersona {
  id: string;
  name: string;
  role: string;
  icon?: string;
  color?: string;
  description: string;
  systemPrompt: string;
  temperature: number;
  active: boolean;
}

export interface CheckpointItem {
  hash: string;
  message: string;
  time: string;
}
