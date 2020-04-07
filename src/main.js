const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const { autoUpdater } = require('electron-updater');

function createWindow() {
    const mainWindow = new BrowserWindow({
            width: 500,
            height: 130,
            frame: false,
            transparent: true,
            resizable: false,
            webPreferences: {
                //preload: path.join(__dirname, 'preload.js'),
                nodeIntegration: true
            }
        })
        //mainWindow.openDevTools()
        //mainWindow.loadFile('html/index.html')
    mainWindow.loadURL(path.join("file://", __dirname, 'html', 'index.html'), )
    mainWindow.once('ready-to-show', () => {
        autoUpdater.checkForUpdatesAndNotify();
    });
}


app.whenReady().then(createWindow)

app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function() {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

autoUpdater.on('update-available', () => {
    mainWindow.webContents.send('update_available');
});
autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('update_downloaded');
});

ipcMain.on('restart_app', () => {
    autoUpdater.quitAndInstall();
});