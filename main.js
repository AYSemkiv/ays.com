const { app, BrowserWindow, session } = require('electron');
const path = require('path');

function createWindow() {
  const customSession = session.fromPartition('persist:aysOS13');

  const win = new BrowserWindow({
    // 1. START DIRECTLY IN FULLSCREEN
    fullscreen: true, 
    autoHideMenuBar: true, 
    webPreferences: {
      session: customSession,
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false
    }
  });

  win.setMenu(null);

  // 2. INJECT THE "ALT + F4" EXIT NOTICE ONCE THE PAGE LOADS
  win.webContents.on('did-finish-load', () => {
    const injectNoticeScript = `
      (function() {
        // Create container
        const div = document.createElement('div');
        div.innerText = 'Press Alt + F4 to leave';
        
        // Style the notice banner
        Object.assign(div.style, {
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          color: '#ffffff',
          padding: '12px 24px',
          borderRadius: '8px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontSize: '16px',
          fontWeight: 'bold',
          zIndex: '999999',
          boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
          transition: 'opacity 1s ease, transform 1s ease',
          pointerEvents: 'none'
        });

        document.body.appendChild(div);

        // Fade out after 3 seconds, remove after 4
        setTimeout(() => {
          div.style.opacity = '0';
          div.style.transform = 'translateY(-20px) translateX(-50%)';
        }, 3000);
        
        setTimeout(() => div.remove(), 4000);
      })();
    `;
    
    win.webContents.executeJavaScript(injectNoticeScript);
  });

  // Keyboard shortcut handler
  win.webContents.on('before-input-event', (event, input) => {
    // Restore F11 toggle manual controls just in case they want it
    if (input.key === 'F11' && input.type === 'keyDown') {
      event.preventDefault();
      win.setFullScreen(!win.isFullscreen());
    }

    // Block reload + devtools shortcuts
    const isReload =
      input.key === 'F5' ||
      (input.control && input.key.toLowerCase() === 'r');

    const isDevTools =
      input.key === 'F12' ||
      (input.control && input.shift && input.key.toLowerCase() === 'i');

    if (isReload || isDevTools) {
      event.preventDefault();
    }
  });

  // Load your GitHub Pages live site
  win.loadURL('https://aysemkiv.github.io/aysOS13.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});