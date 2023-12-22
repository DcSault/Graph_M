const { app, BrowserWindow } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const log = require('electron-log');

// Configurez le logging pour electron-updater
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';

let mainWindow;

function createWindow() {
  // Créez la fenêtre du navigateur.
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, 
      enableRemoteModule: true 
    }
  });

  // Chargez le fichier index.html de l'application.
  mainWindow.loadFile('index.html');

  // Ouvrez les DevTools. Commentez ceci avant de déployer la version finale.
  // mainWindow.webContents.openDevTools();
}

// Cette méthode sera appelée quand Electron aura fini
// de s'initialiser et sera prêt à créer des fenêtres de navigation.
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // Sur macOS, il est courant de recréer une fenêtre dans l'application quand
    // l'icône du dock est cliquée et qu'il n'y a pas d'autres fenêtres d'ouvertes.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  // Vérifiez les mises à jour après la création de la fenêtre
  autoUpdater.checkForUpdatesAndNotify();
});

app.on('window-all-closed', () => {
  // Quittez l'application lorsque toutes les fenêtres sont fermées, sauf sur macOS.
  if (process.platform !== 'darwin') app.quit();
});

// Logique de mise à jour automatique
autoUpdater.on('checking-for-update', () => {
  log.info('Recherche de mises à jour...');
});

autoUpdater.on('update-available', (info) => {
  log.info('Une mise à jour est disponible.');
  mainWindow.webContents.send('update_available');
});

autoUpdater.on('update-not-available', (info) => {
  log.info('Aucune mise à jour disponible.');
  mainWindow.webContents.send('update_not_available');
});

autoUpdater.on('error', (err) => {
  log.error('Erreur dans auto-updater: ' + err);
  mainWindow.webContents.send('update_error', err);
});

autoUpdater.on('download-progress', (progressObj) => {
  let log_message = `Vitesse de téléchargement: ${progressObj.bytesPerSecond}`;
  log_message += ` - Téléchargé ${progressObj.percent}%`;
  log_message += ` (${progressObj.transferred}/${progressObj.total})`;
  log.info(log_message);
  mainWindow.webContents.send('update_download_progress', progressObj);
});

autoUpdater.on('update-downloaded', (info) => {
  log.info('Mise à jour téléchargée; elle sera installée dans 5 secondes.');
  mainWindow.webContents.send('update_downloaded');
  setTimeout(() => {
    autoUpdater.quitAndInstall();  
  }, 5000);
});
