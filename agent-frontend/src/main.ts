import './styles/main.css';
import './styles.css';
import { WorkspaceComponent } from './components/workspace';

document.addEventListener('DOMContentLoaded', () => {
  const appContainer = document.getElementById('app');
  if (appContainer) {
    new WorkspaceComponent(appContainer);
  }
});