const { app, BrowserWindow, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');

let mainWindow;
let updateWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1920,
        height: 1080,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadFile('web\index.html');

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

function createUpdateWindow() {
    updateWindow = new BrowserWindow({
        width: 400,
        height: 200,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    updateWindow.loadFile('update.html');

    updateWindow.on('closed', () => {
        updateWindow = null;
    });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

app.on('ready', () => {
    autoUpdater.checkForUpdatesAndNotify();
});

autoUpdater.on('update-available', () => {
    createUpdateWindow();
});

autoUpdater.on('update-downloaded', () => {
    if (updateWindow) {
        updateWindow.close();
    }
    autoUpdater.quitAndInstall();
});

// Ici, vous pouvez gérer d'autres messages IPC si nécessaire
ipcMain.on('start-update', () => {
    autoUpdater.quitAndInstall();
});
