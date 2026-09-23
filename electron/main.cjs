const { app, BrowserWindow, shell } = require('electron');
const path = require('node:path');

const isDevelopment = !app.isPackaged;

function createWindow() {
  const window = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: '#f8fafc',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  if (isDevelopment) {
    window.loadURL('http://localhost:3000').catch((error) => {
      console.error('Failed to load development renderer:', error);
    });
  } else {
    const rendererPath = path.join(app.getAppPath(), 'dist', 'index.html');
    window.loadFile(rendererPath).catch((error) => {
      console.error(`Failed to load packaged renderer from ${rendererPath}:`, error);
    });
  }

  window.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    console.error(
      `Renderer failed to load (${errorCode}): ${errorDescription} - ${validatedURL}`,
    );
  });
  window.webContents.on('render-process-gone', (_event, details) => {
    console.error('Renderer process exited:', details);
  });
  window.webContents.on('console-message', (_event, details) => {
    if (details.level === 2 || details.level === 3) {
      console.error(`Renderer console [${details.level}]: ${details.message}`);
    }
  });

  window.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
