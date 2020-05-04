const electron = require("electron");
const app = electron.app;

const BrowserWindow = electron.BrowserWindow;
const session = electron.session;


// const appVersion = require("../package.json").version;
const args = require('yargs').argv;
const path = require("path");
const isDev = require("electron-is-dev");

// const openAtLogin = false;
let mainWindow;

// Pass CLI args to app.js
global.appArguments = {...args};

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
      nodeIntegration: true,
    },
  });

  mainWindow.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );

  mainWindow.on("closed", () => (mainWindow = null));
}

// This method will be called when Electron has done everything
// initialization and ready for creating browser windows.
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  if (process.platform != "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
