import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App, Providers } from './app';
import './styles/global.css';
import './styles/accessibility.css';
import { applyAccessibilitySettings, loadPrefs } from './utils/accessibility';

// Apply saved accessibility settings synchronously before first render
// to prevent a flash of unstyled/un-modified content.
applyAccessibilitySettings(loadPrefs());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers>
      <App />
    </Providers>
  </StrictMode>
);
