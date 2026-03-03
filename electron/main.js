const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');
const fs = require('fs');

// Keep a global reference of the window object
let mainWindow;

// Check if running in development
const isDev = !app.isPackaged;

// App name for registry
const APP_NAME = 'ServiceLoggerUDC';

// Next.js server port
const PORT = 3456;

function ensureWindowsShellEnvironment() {
  if (process.platform !== 'win32') return;

  const candidates = [];
  const root = process.env.SystemRoot || process.env.WINDIR || 'C:\\Windows';
  candidates.push(path.join(root, 'System32', 'cmd.exe'));
  candidates.push(path.join(root, 'Sysnative', 'cmd.exe'));

  const validCmd = candidates.find((candidate) => fs.existsSync(candidate));
  if (validCmd) {
    process.env.ComSpec = validCmd;
    process.env.COMSPEC = validCmd;
  }

  if (!process.env.SystemRoot) process.env.SystemRoot = root;
  if (!process.env.WINDIR) process.env.WINDIR = root;
}

async function startNextServer() {
  if (isDev) return; // In dev, Next.js runs separately

  // Load environment variables from .env.local if it exists
  const envPath = path.join(process.resourcesPath, '.env.local');
  if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
  } else {
    // Try the app directory
    const appEnvPath = path.join(__dirname, '..', '.env.local');
    if (fs.existsSync(appEnvPath)) {
      require('dotenv').config({ path: appEnvPath });
    }
  }

  // Use next's custom server
  const next = require('next');
  const nextApp = next({
    dev: false,
    dir: path.join(__dirname, '..'),
    port: PORT,
  });

  const handle = nextApp.getRequestHandler();
  await nextApp.prepare();

  const http = require('http');
  const server = http.createServer((req, res) => {
    handle(req, res);
  });

  server.listen(PORT, '127.0.0.1', () => {
    console.log(`Next.js server running on http://127.0.0.1:${PORT}`);
  });
}

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: !isDev,
    },
    icon: path.join(__dirname, '../build/icon.ico'),
    show: false, // Don't show until ready
    titleBarStyle: 'default',
    autoHideMenuBar: true,
  });

  // Remove menu bar in production
  if (!isDev) {
    mainWindow.setMenu(null);
  }

  // Load the app - always from a server (dev or production)
  const url = isDev ? 'http://localhost:3000' : `http://127.0.0.1:${PORT}`;
  mainWindow.loadURL(url);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();

    // Check for updates (only in production)
    if (!isDev) {
      try {
        autoUpdater.checkForUpdatesAndNotify();
      } catch (e) {
        console.log('Auto-update check skipped:', e.message);
      }
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC handlers
ipcMain.handle('app-get-version', () => {
  return app.getVersion();
});

ipcMain.handle('app-get-path', (event, name) => {
  return app.getPath(name);
});

ipcMain.handle('set-startup', (event, enable) => {
  if (enable) {
    app.setLoginItemSettings({ openAtLogin: true, args: ['--hidden'] });
  } else {
    app.setLoginItemSettings({ openAtLogin: false });
  }
});

ipcMain.handle('show-message-box', async (event, options) => {
  const result = await dialog.showMessageBox(mainWindow, options);
  return result;
});

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

// App event handlers
app.whenReady().then(async () => {
  ensureWindowsShellEnvironment();

  try {
    await startNextServer();
  } catch (err) {
    console.error('Failed to start Next.js server:', err);
  }

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Auto-updater events
autoUpdater.on('update-available', () => {
  if (mainWindow) {
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'আপডেট পাওয়া গেছে',
      message: 'নতুন সংস্করণ পাওয়া গেছে। এটি ব্যাকগ্রাউন্ডে ডাউনলোড হবে।',
      buttons: ['ঠিক আছে']
    });
  }
});

autoUpdater.on('update-downloaded', () => {
  if (mainWindow) {
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'আপডেট প্রস্তুত',
      message: 'আপডেট ডাউনলোড সম্পন্ন। অ্যাপটি রিস্টার্ট করলে আপডেট হবে।',
      buttons: ['রিস্টার্ট', 'পরে']
    }).then((result) => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
  }
});
