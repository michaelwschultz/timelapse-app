const {app, BrowserWindow} = require('electron');

let mainWindow;
let openAtLogin = false;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    if (process.platform != 'darwin') {
        app.quit();
    }
});

// TODO figure out how this can be updated from the app side
app.setLoginItemSettings({
    openAtLogin: false
});

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
    });

    // and load the index.html of the app.
    mainWindow.loadURL('file://' + __dirname + '/index.html');

    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
});
