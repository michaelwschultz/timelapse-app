// Import parts of electron to use
const { app, BrowserWindow, session } = require('electron');
const path = require('path');
const url = require('url');

// const appVersion = require("../package.json").version;
const isDev = require("electron-is-dev");

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
// const openAtLogin = false;

// point to update server
// let updateFeed = "//localhost:3000/updates/latest";
if (isDev) {
  process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";
  // updateFeed = "https://schultz.co/timelapse/updates/latest";
}

// removes deprecation warning
// can remove after upgrading to Electron 9
app.allowRendererProcessReuse = true;

// TODO app requires a certificate to run the updater
// autoUpdater.setFeedURL(updateFeed + '?v=' + appVersion)

// TODO figure out how this can be updated from the app side
app.setLoginItemSettings({
  openAtLogin: false,
});

// Improves security
// https://github.com/electron/electron/blob/master/docs/tutorial/security.md
app.on("web-contents-created", (_event, contents) => {
  contents.on("will-attach-webview", (_event, webPreferences) => {
    // Strip away preload scripts if unused or verify their location is legitimate
    delete webPreferences.preload;
    delete webPreferences.preloadURL;

    // Disable node integration
    webPreferences.nodeIntegration = false;

    // Verify URL being loaded is from my server
    // if (!params.src.startsWith('https://schultz.co')) {
    //   event.preventDefault()
    // }
  });
});

function createWindow() {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({ responseHeaders: `default-src 'none'` });
  });

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 640,
    height: 360,
    resizable: false,
    titleBarStyle: "hidden",
    backgroundColor: "#131D2A",
    icon: __dirname + "/assets/temp_icon.icns",
    // needed for require in app.js
    // https://stackoverflow.com/questions/44391448/electron-require-is-not-defined
    webPreferences: {
      nodeIntegration: true
    },
  });

  let indexPath;

  if (isDev) {
    indexPath = url.format({
      protocol: 'http:',
      host: 'localhost:8080',
      pathname: 'index.html',
      slashes: true
    });
  } else {
    indexPath = url.format({
      protocol: 'file:',
      pathname: path.join(__dirname, 'dist', 'index.html'),
      slashes: true
    });
  }

  mainWindow.loadURL(indexPath);

  // trash this
  // mainWindow.loadURL(
  //   isDev
  //     ? "http://localhost:3000"
  //     : `file://${path.join(__dirname, "../build/index.html")}`
  // );

  // Don't show until we are ready and loaded
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();

    // Open the DevTools automatically if developing
    if (dev) {
      const { default: installExtension, REACT_DEVELOPER_TOOLS } = require('electron-devtools-installer');

      installExtension(REACT_DEVELOPER_TOOLS)
        .catch(err => console.log('Error loading React DevTools: ', err))
      mainWindow.webContents.openDevTools();
    }
  });

  mainWindow.on("closed", () => (mainWindow = null));
}

// This method will be called when Electron has done everything
// initialization and ready for creating browser windows.
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})
