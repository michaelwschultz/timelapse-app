export function downloadFfbinaries() {
  console.log('👋')
  if (!fs.existsSync(binaryDest)) {
    // TODO check to see if user is connected to the internet
    // download required ffmpeg binary for video conversion
    console.log("Downloading binaries");
    ffbinaries.downloadFiles(
      ["ffmpeg", "ffprobe"],
      {
        platform: "osx-64",
        quiet: false,
        destination: binaryDest,
      },
      () => {
        ffmpeg.setFfmpegPath(binaryDest + "/ffmpeg");
        console.log("Downloaded ffmpeg to " + binaryDest + ".");
      }
    );
  } else {
    console.log("/ffmpeg already downloaded");
    ffmpeg.setFfmpegPath(binaryDest + "/ffmpeg");
  }
  return;
};

export function createPhotosDirectory() {
  if (!fs.existsSync(photosPath)) {
    fs.mkdirSync(photosPath);
    console.log("New photo folder created");
  }
};

export function getUserSettings() {
  // TODO generate real unique ID
  const userId =
    "user-" +
    new Date().toISOString().slice(0, 10) +
    "-" +
    new Date().getHours() +
    new Date().getMinutes() +
    new Date().getSeconds();

  const userSettingsTemplate = {
    user: {
      appOpens: null,
      appVersion: appVersion,
      created: new Date(),
      photosTaken: null,
      timelapseComplete: null,
      userId: userId,
      userNotifications: true,
    },
    system: {
      architecture: os.arch(),
      homeDirectory: os.homedir(),
      platform: os.platform(),
      release: os.release(),
      tempDirectory: os.tmpdir(),
    },
  };

  if (!fs.existsSync(settingsFileLocation)) {
    try {
      fs.writeFileSync(
        settingsFileLocation,
        JSON.stringify(userSettingsTemplate, null, 4)
      );
    } catch (e) {
      console.log("Failed to save the user settings file!");
    } finally {
      userSettings = require(settingsFileLocation);
      console.log("New user settings file created.");
    }
  } else {
    userSettings = require(settingsFileLocation);
  }

  // increases appOpens by 1
  userSettings.user.appVersion = appVersion;
  ++userSettings.user.appOpens;
  updateUserSettings();
};