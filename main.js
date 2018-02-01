const {app, BrowserWindow, autoUpdater} = require('electron')
const appVersion = require('./package.json').version

const openAtLogin = false
let mainWindow


// point to update server
let updateFeed = '//localhost:3000/updates/latest'
if (process.env.NODE_ENV !== 'development') {
  updateFeed = 'https://lapsey.com/updates/latest'
}

// TODO app requires a certificate to run the updater
// autoUpdater.setFeedURL(updateFeed + '?v=' + appVersion)


// Quit when all windows are closed.
app.on('window-all-closed', function() {
    if (process.platform != 'darwin') {
        app.quit()
    }
})

// TODO figure out how this can be updated from the app side
app.setLoginItemSettings({
    openAtLogin: false
})

// Improves security
// https://github.com/electron/electron/blob/master/docs/tutorial/security.md
app.on('web-contents-created', (event, contents) => {
  contents.on('will-attach-webview', (event, webPreferences, params) => {
    // Strip away preload scripts if unused or verify their location is legitimate
    delete webPreferences.preload
    delete webPreferences.preloadURL

    // Disable node integration
    webPreferences.nodeIntegration = false

    // Verify URL being loaded is from my server
    // if (!params.src.startsWith('https://localhost://')) {
    //   event.preventDefault()
    // }
  })
})

// This method will be called when Electron has done everything
// initialization and ready for creating browser windows.
app.on('ready', function() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        // titleBarStyle: 'hidden',
        width: 640,
        height: 360,
        resizable: false,
        backgroundColor: '#131D2A',
        icon: __dirname + '/temp_icon.icns'
    })

    // and load the index.html of the app.
    mainWindow.loadURL('file://' + __dirname + '/index.html')

    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })
})
