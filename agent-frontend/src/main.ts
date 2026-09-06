import './styles/main.css';
import './styles.css';
import { WorkspaceComponent } from './components/workspace';
import { soundEngine } from './services/sound';

// Prime mechanical keyboard acoustic engine immediately
soundEngine.attachGlobalInteractivity();

document.addEventListener('DOMContentLoaded', () => {
  const appContainer = document.getElementById('app') || document.body;
  if (appContainer) {
    new WorkspaceComponent(appContainer as HTMLElement);
  }
});