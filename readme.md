# Timelapse app
## https://github.com/michaelwschultz/timelapse-app
#### Built by Michael Schultz https://michaelschultz.com
Tiny desktop app that creates timelapse videos using your built in desktop/laptop camera.

![app screenshot](app-screenshot.jpg)

Timelapse is built on top of Electron https://github.com/electron/electron to make use of the desktop environment.

---

#### Running the app locally
This app requires Node https://nodejs.org. Download the latest version before getting started.

This should install everything you need (including a local version of Electron) to get started with the project. Note that it's only been tested on OSX High Sierra 10.13.6.

```
$ npm install
$ npm start
```

---

#### Building for OSX
$ npm run build
compress folder and place inside /updater/releases/

---

#### Good things to know
The app creates an application folder located at (/Users/{your username}/Library/Application Support/Timelapse) to store all your user settings and such.

Photos and timelapse videos are stored in your local ~/Pictures directory inside a /Timelapse folder that's created when you launch the app.