const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

app.name = 'Foco';

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  let mainWindow = null;

  function createWindow() {
    mainWindow = new BrowserWindow({
      width: 1100,
      height: 800,
      minWidth: 400,
      minHeight: 600,
      title: 'Foco',
      backgroundColor: '#0c0d0f',
      autoHideMenuBar: true,
      icon: path.join(__dirname, 'icon.png'),
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        backgroundThrottling: false
      }
    });

    mainWindow.setMenuBarVisibility(false);

    // Handle downloads (e.g. saving insights PNG directly to Downloads directory)
    mainWindow.webContents.session.on('will-download', (event, item) => {
      const downloadsDir = app.getPath('downloads');
      const filename = item.getFilename();
      const ext = path.extname(filename);
      const base = path.basename(filename, ext);
      let targetPath = path.join(downloadsDir, filename);
      let counter = 1;

      while (fs.existsSync(targetPath)) {
        targetPath = path.join(downloadsDir, `${base}(${counter})${ext}`);
        counter++;
      }

      item.setSavePath(targetPath);
    });

    mainWindow.loadFile(path.join(__dirname, 'index.html'));

    mainWindow.on('closed', () => {
      mainWindow = null;
    });
  }

  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
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
}
