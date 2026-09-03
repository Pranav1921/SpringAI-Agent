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

  public connect(): void {
    if (this.eventSource) {
      try {
        this.eventSource.close();
      } catch {}
    }

    try {
      this.eventSource = new EventSource('http://localhost:8080/api/agent/events');

      const handleEventData = (e: MessageEvent) => {
        try {
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

      this.eventSource.addEventListener('connected', () => {
        this.notifyListeners({
          type: 'SYSTEM',
          source: 'SSE_STREAM',
          content: 'Real-time reasoning stream connected.',
          timestamp: new Date().toLocaleTimeString()
        });
      });

      this.eventSource.onerror = () => {
        setTimeout(() => {
          if (!this.eventSource || this.eventSource.readyState === EventSource.CLOSED) {
            this.connect();
          }
        }, 2000);
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
