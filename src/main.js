const { app, BrowserWindow, Notification, ipcMain, dialog } = require('electron')
const path = require('path')
const { autoUpdater } = require('electron-updater');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
            width: 500,
            height: 130,
            frame: false,
            transparent: true,
            resizable: false,
            maximizable: false,
            fullscreenable: false,
            hasShadow: false,
            webPreferences: {
                nodeIntegration: true
            }
        })
        //mainWindow.openDevTools()
        //mainWindow.loadFile('html/index.html')
    mainWindow.loadURL(path.join("file://", __dirname, 'html', 'index.html'), )
    autoUpdater.checkForUpdatesAndNotify();
}

let tray = null
app.on("ready", () => {
    createWindow()
})

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
ipcMain.on('requestsong', (event, args) => {
    requestSongWindow = new BrowserWindow({
        parent: mainWindow,
        width: 600,
        height: 700,
        title: "Request songs",
        backgroundColor: "#000000",
    })
    requestSongWindow.loadURL(`https://radio.chickenfm.com/public/${args}/embed-requests`)
})
ipcMain.on("stationChanger", () => {
    stationChangeWindow = new BrowserWindow({
        parent: mainWindow,
        width: 400,
        height: 400,
        title: "Stations",
        webPreferences: {
            nodeIntegration: true
        }
    })
    stationChangeWindow.loadURL(path.join("file://", __dirname, 'html', 'stations.html'), )
})
ipcMain.on("changeStation", () => {
    mainWindow.webContents.send("updateStation")
})