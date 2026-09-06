import { AgentEvent } from '../types';

export class AgentSseService {
  private eventSource: EventSource | null = null;
  private listeners: Array<(event: AgentEvent) => void> = [];

  constructor() {
    this.connect();
  }

  private recentEventKeys = new Map<string, number>();

  private isDuplicate(data: AgentEvent): boolean {
    const key = `${data.type}::${data.source || ''}::${data.content || ''}`;
    const now = Date.now();
    const lastTime = this.recentEventKeys.get(key);
    if (lastTime && (now - lastTime) < 800) {
      return true;
    }
    this.recentEventKeys.set(key, now);
    if (this.recentEventKeys.size > 100) {
      for (const [k, time] of this.recentEventKeys.entries()) {
        if (now - time > 5000) this.recentEventKeys.delete(k);
      }
    }
    return false;
  }

  private reconnectTimer: any = null;
  private reconnectDelay: number = 2000;
  private useDirectBackend: boolean = false;

  public connect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.eventSource) {
      try {
        this.eventSource.close();
      } catch {}
      this.eventSource = null;
    }

    try {
      const sseUrl = this.useDirectBackend ? 'http://127.0.0.1:8080/api/agent/events' : '/api/agent/events';
      this.eventSource = new EventSource(sseUrl);

      const handleEventData = (e: MessageEvent) => {
        try {
          // Reset reconnect backoff on receiving messages
          this.reconnectDelay = 3000;
          const data: AgentEvent = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
          if (!data.timestamp) {
            data.timestamp = new Date().toLocaleTimeString();
          }
          if (this.isDuplicate(data)) {
            return;
          }
          this.notifyListeners(data);
        } catch (err) {
          console.error('Error parsing SSE event:', err);
        }
      };

      const eventTypes = [
        'THOUGHT', 'ACTION', 'OBSERVATION', 'ANSWER', 'FINISH', 
        'PLAN_PROPOSAL', 'TEST_REPORT', 'SECURITY_AUDIT', 'SWARM_STATUS', 
        'RESET', 'SYSTEM', 'AGENT_EVENT', 'DECISION', 'QUESTION', 'STEP_PROGRESS'
      ];
      eventTypes.forEach(t => this.eventSource?.addEventListener(t, handleEventData));
      this.eventSource.onmessage = handleEventData;

      this.eventSource.onopen = () => {
        this.reconnectDelay = 3000;
      };

      this.eventSource.addEventListener('connected', () => {
        this.reconnectDelay = 3000;
        this.notifyListeners({
          type: 'SYSTEM',
          source: 'SSE_STREAM',
          content: 'Real-time reasoning stream connected.',
          timestamp: new Date().toLocaleTimeString()
        });
      });

      this.eventSource.onerror = () => {
        if (this.eventSource) {
          try {
            this.eventSource.close();
          } catch {}
          this.eventSource = null;
        }
        this.useDirectBackend = !this.useDirectBackend;
        
        if (!this.reconnectTimer) {
          this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this.reconnectDelay = Math.min(this.reconnectDelay * 1.5, 10000);
            this.connect();
          }, this.reconnectDelay);
        }
      };
    } catch (e) {
      console.warn('SSE EventSource not supported or backend unreachable:', e);
    }
  }

  public subscribe(callback: (event: AgentEvent) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notifyListeners(event: AgentEvent): void {
    this.listeners.forEach(fn => fn(event));
  }
}

export const sseService = new AgentSseService();
