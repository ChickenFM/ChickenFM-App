const { app, BrowserWindow, Notification } = require('electron')
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
    if (Notification.isSupported()) {
        new Notification('Update available!', {
            body: 'The new update is now downloading...'
        }).show()
    }
});
autoUpdater.on('update-downloaded', () => {
    if (Notification.isSupported()) {
        const updateNotif = new Notification({
            title: 'Update available!',
            body: 'Click here to install the new update'
        })
        updateNotif.show()
        updateNotif.on("click", () => {
            autoUpdater.quitAndInstall();
        })
    }
});