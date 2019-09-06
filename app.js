(function() {
  // requirements
  const { app } = require("electron").remote;
  const fs = require("fs");
  const path = require("path");
  const shell = require("electron").shell;
  const ipcRenderer = require("electron").ipcRenderer;
  const os = require("os");
  const ffbinaries = require("ffbinaries");
  const ffmpeg = require("fluent-ffmpeg");
  const videoshow = require("videoshow");

  // development
  const testing = false;

  // constants
  const appName = app.getName();
  const appVersion = require("./package.json").version;
  const photosPath = path.join(app.getPath("pictures"), appName);
  const userDataPath = app.getPath("userData");
  const binaryDest = userDataPath + "/Binaries";
  const settingsFileLocation = userDataPath + "/userSettings.json";

  const videoOptions = {
    // audioBitrate: '128k',
    // audioChannels: 2,
    format: "mp4",
    fps: 30,
    loop: 0.3, // seconds
    pixelFormat: "yuv420p",
    size: "1280x720",
    transition: false,
    transitionDuration: 0, // seconds
    videoBitrate: 5000,
    videoCodec: "libx264",
  };

  // window
  const height = 720;
  const width = 1280;

  // timelapse settings
  let cameraTimeout = 4;
  let secondsBetweenPhotos = 5;
  let timelapseLength = 20;

  // global
  // TODO figure out how to remove this need for assigning variables here
  let barProgress = null;
  let cameraReady = false;
  let canvas = null;
  let checkbox = null;
  let controls = null;
  let currentPhoto = null;
  let flash = null;
  let flashArea = null;
  let formatBetweenPhotos = "seconds"; // not currently using this
  let imageBugger = null;
  let imageData = null;
  let justImage = null;
  let menuButton = null;
  let numPhotosTaken = null;
  let photo = null;
  let photoArray = null;
  let photoContainer = null;
  let photoCount = 0;
  let photos = null;
  let progressBar = null;
  let progressWrapper = null;
  let readyToTakePhoto = null;
  let removeButton = null;
  let settings = null;
  let spinner = null;
  let startButton = null;
  let status = null;
  let timelapseDirectoryName = null;
  let timelapseRunning = false;
  let userSettings = null;
  let video = null;
  let videoFiles = [];
  let videoPath = null;

  const updateUserSettings = function() {
    try {
      fs.writeFileSync(
        settingsFileLocation,
        JSON.stringify(userSettings, null, 4)
      );
    } catch (e) {
      console.log("Failed to save the user settings file!");
    } finally {
      userSettings = require(settingsFileLocation);
      console.log("User settings updated");
    }
  };

  const changeButtonType = function(btn, value) {
    btn.title = value;
    btn.innerHTML = value;
    btn.className = value;
  };

  // TODO if user is offline then let them know that they need to connect
  // when they come back online download binaries if needed
  const updateOnLineStatus = () => {
    console.error("internet connection changed");
  };

  window.addEventListener("online", updateOnLineStatus);
  window.addEventListener("offline", updateOnLineStatus);

  function init() {
    const downloadFfbinaries = (function() {
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
          function() {
            ffmpeg.setFfmpegPath(binaryDest + "/ffmpeg");
            console.log("Downloaded ffmpeg to " + binaryDest + ".");
          }
        );
      } else {
        ffmpeg.setFfmpegPath(binaryDest + "/ffmpeg");
      }
    })();

    const createPhotosDirectory = (function() {
      if (!fs.existsSync(photosPath)) {
        fs.mkdirSync(photosPath);
        console.log("New photo folder created");
      }
    })();

    const getUserSettings = (function() {
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
    })();

    // assign all UI items, this could be avoided by using React
    btnClosePlayback = document.getElementById("btn-close-playback");
    btnOpenFile = document.getElementById("btn-open-file");
    btnPlayPause = document.getElementById("btn-play-pause");
    btnShowFile = document.getElementById("btn-show-file");
    canvas = document.getElementById("canvas");
    checkbox = document.querySelectorAll("input[type=checkbox]");
    clearAllButton = document.getElementById("clear-all");
    controls = document.getElementById("controls");
    createVideoButton = document.getElementById("create-video-button");
    flashArea = document.getElementById("flash-area");
    menuButton = document.getElementById("menu-button");
    numPhotosTaken = document.getElementById("photo-count");
    photos = document.getElementById("photos");
    playback = document.getElementById("playback");
    playbackControls = document.getElementById("playback-controls");
    progressBar = document.getElementById("progress-bar");
    progressWrapper = document.getElementById("progress-wrapper");
    settings = document.getElementById("settings");
    settingsAppVersion = document.getElementById("app-version");
    spinner = document.getElementById("spinner");
    startButton = document.getElementById("start-button");
    status = document.getElementById("status");
    // timelapseOptions = document.getElementById('timelapse-options')
    video = document.getElementById("video");

    settingsAppVersion.innerHTML = "Version " + appVersion;

    const genereateTimelapseOptions = (function() {
      const timelapseDuration = document.getElementById("timelapse-duration");
      const durationDown = document.getElementById("duration-down");
      const durationUp = document.getElementById("duration-up");
      const durationTimeS = document.getElementById("duration-time-s");
      const durationTimeM = document.getElementById("duration-time-m");
      const durationTimeH = document.getElementById("duration-time-h");

      const photoFrequency = document.getElementById("photo-frequency");
      const frequencyDown = document.getElementById("frequency-down");
      const frequencyUp = document.getElementById("frequency-up");
      const frequencyTimeS = document.getElementById("frequency-time-s");
      const frequencyTimeM = document.getElementById("frequency-time-m");
      const frequencyTimeH = document.getElementById("frequency-time-h");

      timelapseDuration.value = timelapseLength;
      photoFrequency.value = secondsBetweenPhotos;

      let durationTime = "s";
      let frequencyTime = "m";

      timelapseDuration.addEventListener("change", function() {
        timelapseDuration.value = this.value;
        timelapseLength = this.value;

        console.log("Timelapse Duration " + timelapseDuration.value);
      });

      durationDown.addEventListener("click", function() {
        timelapseDuration.value--;
        timelapseLength = timelapseDuration.value;

        console.log("Timelapse Duration " + timelapseDuration.value);
      });

      durationUp.addEventListener("click", function() {
        timelapseDuration.value++;
        timelapseLength = timelapseDuration.value;

        console.log("Timelapse Duration " + timelapseDuration.value);
      });

      durationTimeS.addEventListener("click", function() {
        durationTime = this.value;
        this.classList = "active";
        durationTimeM.classList = "";
        durationTimeH.classList = "";

        console.log("Duration time changed to " + durationTime);
      });

      durationTimeM.addEventListener("click", function() {
        durationTime = this.value;
        this.classList = "active";
        durationTimeS.classList = "";
        durationTimeH.classList = "";

        console.log("Duration time changed to " + durationTime);
      });

      durationTimeH.addEventListener("click", function() {
        durationTime = this.value;
        this.classList = "active";
        durationTimeS.classList = "";
        durationTimeM.classList = "";

        console.log("Duration time changed to " + durationTime);
      });

      photoFrequency.addEventListener("change", function() {
        photoFrequency.value = this.value;
        secondsBetweenPhotos = this.value;

        console.log("Timelapse Frequency " + photoFrequency.value);
      });

      frequencyDown.addEventListener("click", function() {
        photoFrequency.value--;
        secondsBetweenPhotos = photoFrequency.value;

        console.log("Timelapse Frequency " + photoFrequency.value);
      });

      frequencyUp.addEventListener("click", function() {
        photoFrequency.value++;
        secondsBetweenPhotos = photoFrequency.value;

        console.log("Timelapse Frequency " + photoFrequency.value);
      });

      frequencyTimeS.addEventListener("click", function() {
        frequencyTime = this.value;
        this.classList = "active";
        frequencyTimeM.classList = "";
        frequencyTimeH.classList = "";

        console.log("Frequency time changed to " + frequencyTime);
      });

      frequencyTimeM.addEventListener("click", function() {
        frequencyTime = this.value;
        this.classList = "active";
        frequencyTimeS.classList = "";
        frequencyTimeH.classList = "";

        console.log("Frequency time changed to " + frequencyTime);
      });

      frequencyTimeH.addEventListener("click", function() {
        frequencyTime = this.value;
        this.classList = "active";
        frequencyTimeS.classList = "";
        frequencyTimeM.classList = "";

        console.log("Frequency time changed to " + frequencyTime);
      });
    })();

    // TRASH THIS
    /* const genereateTimelapseOptions = function() {
            // TODO refactor function to auto create all event listeners based on querySelectorAll
            // options = document.querySelectorAll('.option')
            totalDurationTime = document.getElementById('total-duration-time')
            totalDurationFormat = document.getElementById('total-duration-format')
            shutterTimingTime = document.getElementById('shutter-timing-time')
            shutterTimingFormat = document.getElementById('shutter-timing-format')

            totalDurationTime.addEventListener('change', function() {
                timelapseLength = this.value

                console.log(timelapseLength)
            })

            totalDurationFormat.addEventListener('change', function() {
                timelapseFormat = this.value
                console.log(value)
            })

            shutterTimingTime.addEventListener('change', function() {
                secondsBetweenPhotos = this.value
                console.log(secondsBetweenPhotos)
            })

            shutterTimingFormat.addEventListener('change', function() {
                formatBetweenPhotos = this.value
            })
        }() */

    renderControls().then(turnOnCamera);

    // add event listeners to controls
    startButton.addEventListener(
      "click",
      function(ev) {
        // resets state of app before starting a new timelapse
        if (timelapseRunning == false) {
          timelapseRunning = true;
          reset(timelapse);
          console.log(
            "Timelapse started with a frequency of - " +
              secondsBetweenPhotos +
              " and duration of - " +
              timelapseLength
          );
        } else {
          timelapseFinished();
          console.warn("User stopped timelapse");
        }
        ev.preventDefault();
      },
      false
    );

    createVideoButton.addEventListener(
      "click",
      function(ev) {
        makeVideo();
        ev.preventDefault();
      },
      false
    );

    clearAllButton.addEventListener(
      "click",
      function(ev) {
        reset();
        ev.preventDefault();
      },
      false
    );

    menuButton.addEventListener(
      "click",
      function(ev) {
        if (controls.classList.contains("animate-controls")) {
          controls.classList.remove("animate-controls");
          video.classList.remove("blur");
        } else {
          controls.classList.add("animate-controls");
          video.classList.add("blur");
        }

        ev.preventDefault();
      },
      false
    );

    checkbox.forEach(function(elem) {
      // set checked states of user settings
      elem.checked = userSettings.user[elem.name];

      elem.addEventListener("change", function() {
        if (this.checked == true) {
          this.checked = true;
          userSettings.user[this.name] = true;
        } else {
          this.checked = false;
          userSettings.user[this.name] = false;
        }
        updateUserSettings();
      });
    });

    btnClosePlayback.addEventListener(
      "click",
      function(ev) {
        closePlayback();

        ev.preventDefault();
      },
      false
    );

    btnOpenFile.addEventListener(
      "click",
      function(ev) {
        shell.openItem(videoPath);

        ev.preventDefault();
      },
      false
    );

    btnShowFile.addEventListener(
      "click",
      function(ev) {
        shell.showItemInFolder(videoPath);

        ev.preventDefault();
      },
      false
    );

    btnPlayPause.addEventListener(
      "click",
      function(ev) {
        if (playback.paused || playback.ended) {
          // Change the button to a pause button
          changeButtonType(btnPlayPause, "Pause");
          playback.play();
        } else {
          // Change the button to a play button
          changeButtonType(btnPlayPause, "Play");
          playback.pause();
        }

        ev.preventDefault();
      },
      false
    );

    // Add a listener for the play and pause events so the buttons state can be updated
    playback.addEventListener(
      "play",
      function() {
        // Change the button to be a pause button
        changeButtonType(btnPlayPause, "Pause");
      },
      false
    );

    playback.addEventListener(
      "pause",
      function() {
        // Change the button to be a play button
        changeButtonType(btnPlayPause, "Play");
      },
      false
    );
  }

  const closePlayback = function() {
    playback.className = "fadeOut";
    playbackControls.className = "fadeOutDown";
    photos.className = "fadeInOnce";

    setTimeout(function() {
      playback.src = "";
      renderControls();
    }, 500);
  };

  const notifyUser = function(notifTitle, notifBody) {
    // notify user of something via the notification system
    if (userSettings.user.userNotifications == true) {
      let notif = new window.Notification(notifTitle, {
        body: notifBody,
      });

      // If the user clicks in the notification, show the app
      notif.onclick = function() {
        ipcRenderer.send("focusWindow", "main");
      };
    }
  };

  const reset = function(callback) {
    // removes status element from dom
    status.innerHTML = "";
    spinner.className = "hide";
    createVideoButton.disabled = true;
    clearAllButton.disabled = true;

    // clears out all photo atributes
    numPhotosTaken.innerHTML = "";
    photoCount = 0;

    if (cameraReady == false) {
      turnOnCamera();
    }

    // clears out photos in dom
    if (photos.children.length > 0) {
      photos.innerHTML = "";
    }

    // starts timelapse
    // TODO change to promise
    if (callback) {
      callback();
    }
  };

  const renderControls = function() {
    controls.className = "fadeInUp";

    return new Promise(function(resolve, reject) {
      setTimeout(function() {
        resolve();
      }, 1000);
    });
  };

  const hideControls = function() {
    controls.className = "fadeOutDown";
  };

  const turnOnCamera = function() {
    if (testing) {
      status.innerHTML = "camera on";
      cameraReady = true;
      return;
    }

    if (navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({
          video: {
            width: { min: 1280, ideal: 1280, max: 1280 },
            height: { min: 720, ideal: 720, max: 720 },
          },
        })
        .then(function(stream) {
          console.log("- warming up camera");
          cameraReady = false;
          status.innerHTML = "Warming up camera...";
          video.srcObject = stream;
          window.localStream = stream;

          video.onloadedmetadata = function(e) {
            cameraReady = true;
            console.log("* video feed live");

            video.className = "fadeInOnce";
            status.innerHTML = "";

            localStream.getTracks()[0].onended = function(event) {
              if (testing) {
                console.log("camera off");
              }
            };
          };
        })
        .catch(function() {
          console.log("x could not connect to camera");
          status.innerHTML = "Could not connect to camera!";
        });
    } else {
      status.innerHTML = "Sorry, can't find your webcam.";
      console.log("getUserMedia not supported.");
    }
  };

  const turnOffCamera = function() {
    if (testing) {
      status.innerHTML = "";
      return;
    }

    video.className = "fadeOut";

    setTimeout(function() {
      cameraReady = false;
      localStream.getTracks()[0].stop();
    }, 1000);
  };

  const showPhoto = function() {
    photo.classList.remove("hide");
    photo.classList.add("fadeInRight");
  };

  const hidePhoto = function() {
    photo.classList.remove("fadeInRight");
    photo.classList.add("hide");
  };

  const takePhoto = function() {
    if (flash !== null) {
      flash.parentNode.removeChild(flash);
    }

    // creates a flash effects
    flash = document.createElement("div");
    flash.setAttribute("id", "flash");
    flash.className = "flash";
    flashArea.appendChild(flash);

    // creates a new photo component
    photoContainer = document.createElement("div");
    photoContainer.setAttribute("id", "photo-" + photoCount);
    photoContainer.className = "photo-container fadeInRight";

    photo = document.createElement("img");
    photo.className = "photo";
    photoContainer.appendChild(photo);

    photos.appendChild(photoContainer);

    // inserts a remove button
    removeButton = document.createElement("div");
    removeButton.className = "close-button";
    photoContainer.appendChild(removeButton);

    // gathers all the photos taken into an array
    let photoArray = Array.from(document.querySelectorAll(".close-button"));

    removeButton.addEventListener(
      "click",
      function(ev) {
        let removePhoto = ev.target.classList.contains("close-button");
        let index = photoArray.findIndex(el => el == ev.target);

        if (removePhoto) {
          try {
            fs.unlinkSync(
              timelapseDirectoryName + "/timelapse-photo-" + index + ".png"
            );
          } catch (e) {
            alert("Failed to remove photo!");
          } finally {
            document
              .getElementById("photo-" + index)
              .parentNode.removeChild(
                document.getElementById("photo-" + index)
              );
            photoCount--;
            numPhotosTaken.innerHTML = photoCount;
            if (photoCount == 0) {
              reset();
            }
          }
        }

        ev.preventDefault();
      },
      false
    );

    // captures image and adds new photo data to the dom
    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d").drawImage(video, 0, 0, width, height);
    photo.setAttribute("src", canvas.toDataURL("image/png"));
    showPhoto();

    if (timelapseLength > cameraTimeout && timelapseRunning == true) {
      turnOffCamera();
    }

    imageData = canvas.toDataURL("image/png");
    justImage = imageData.replace(/^data:image\/\w+;base64,/, "");
    imageBuffer = new Buffer.from(justImage, "base64");
    try {
      fs.writeFileSync(
        timelapseDirectoryName + "/timelapse-photo-" + photoCount + ".png",
        imageBuffer
      );
    } catch (e) {
      alert("Failed to save the photo!");
    }

    // increment photo count and update display
    photoCount++;
    numPhotosTaken.innerHTML = photoCount;

    // continues to scroll to the left as more photos come in
    photos.scrollLeft = photos.scrollWidth - photos.clientWidth;

    return new Promise(function(resolve, reject) {
      resolve();
    });
  };

  let timelapseFinished = function() {
    // run after timelapse
    timelapseRunning = false;
    changeButtonType(startButton, "Start");
    createVideoButton.disabled = false;
    clearAllButton.disabled = false;
    video.className = "hide";
    spinner.classList.remove("spin");
    numPhotosTaken.innerHTML = photoCount;
    console.log(
      "photo count - " + photoCount + " timelapse length - " + timelapseLength
    );

    turnOffCamera();

    notifyUser("Timelapse Finished", "Lapsey took " + photoCount + " photos.");

    // increases timelapseComplete by 1 and adds photos to total count.
    ++userSettings.user.timelapseComplete;
    userSettings.user.photosTaken = userSettings.user.photosTaken + photoCount;
    updateUserSettings();
  };

  const timelapse = function() {
    changeButtonType(startButton, "Stop");
    spinner.className = "spin";

    if (cameraReady == false) {
      turnOnCamera();
    }

    const createTimelapseDirectory = (function() {
      timelapseDirectoryName =
        photosPath +
        "/timelapse-" +
        new Date().toISOString().slice(0, 10) +
        "-" +
        new Date().getHours() +
        new Date().getMinutes() +
        new Date().getSeconds();
      if (!fs.existsSync(timelapseDirectoryName)) {
        fs.mkdirSync(timelapseDirectoryName);
        console.log("New timelapse folder created");
      }
    })();

    const timelapseLoop = function() {
      let count = 0;

      const waitForNextPhoto = function() {
        return new Promise(function(resolve, reject) {
          setTimeout(function() {
            resolve();
          }, secondsBetweenPhotos * 1000);
        });
      };

      if (!cameraReady && timelapseRunning) {
        turnOnCamera();
      }

      // TODO why isn't this declaired here?
      readyToTakePhoto = function() {
        // makes sure camera is ready to take a photo
        if (cameraReady && timelapseRunning) {
          if (photoCount == timelapseLength - 1) {
            takePhoto().then(timelapseFinished);
          } else {
            takePhoto()
              .then(waitForNextPhoto)
              .then(timelapseLoop);
          }
        } else if (count >= 20) {
          timelapseFinished();
          console.error("camera not available");
        } else if (timelapseRunning) {
          count++;
          setTimeout(function() {
            readyToTakePhoto();
          }, 500);
        }
      };

      readyToTakePhoto();
    };

    timelapseLoop();
  };

  let groupPhotos = function(callback) {
    videoFiles = [];

    fs.readdir(timelapseDirectoryName, (err, files) => {
      files.forEach(file => {
        if (path.extname(file) === "." + "png") {
          videoFiles.push(timelapseDirectoryName + "/" + file);
        }
      });
      if (callback) {
        callback();
      }
    });
  };

  const renderPlayback = function() {
    hideControls();
    photos.className = "fadeOutDown";
    video.className = "hide";

    setTimeout(function() {
      playbackControls.className = "fadeInUp";
    }, 1000);

    playback.src = videoPath;
    playback.preload = "auto";
    playback.controls = false;
    playback.autoplay = false;
    playback.className = "fadeInOnce";
  };

  const buildVideo = function() {
    updateProgressBar();
    videoPath =
      timelapseDirectoryName +
      "/timelapse-video-" +
      new Date().toISOString().slice(0, 10) +
      "-" +
      new Date().getHours() +
      new Date().getMinutes() +
      new Date().getSeconds() +
      ".mp4";

    videoshow(videoFiles, videoOptions)
      .save(videoPath)
      .on("start", function(command) {
        // console.log('ffmpeg process started:', command)
      })
      // this built in function is broken so I use updateProgressBar instead
      // .on('progress', function(progress) {
      // console.log('Processing: ' + progress.percent + '% done')
      // })
      .on("error", function(err, stdout, stderr) {
        console.error("Error:", err);
        console.error("ffmpeg stderr:", stderr);
      })
      .on("end", function() {
        console.log("Video created!");
        document.getElementById("create-video-button").disabled = false;
        progressBar.setAttribute("style", "transform: translateX(0%);");

        notifyUser("Timelapse Video Exported", "Watch your timelapse now!");

        setTimeout(function() {
          progressWrapper.className = "fadeOutUp";
        }, 1000);
        setTimeout(function() {
          progressBar.setAttribute("style", "transform: translateX(-100%);");
        }, 2000);

        renderPlayback();
      });
  };

  const makeVideo = function() {
    document.getElementById("create-video-button").disabled = true;
    groupPhotos(buildVideo);
  };

  const updateProgressBar = function() {
    progressWrapper.className = "fadeInDown";
    barProgress = photoCount;
    barIncrements = 100 / barProgress;
    barIncrements = Math.floor(barIncrements);
    barPosition = -100;

    // TODO there is a bug here somewhere
    (function moveProgress() {
      barProgress--;
      if (barProgress > 0) {
        barPosition += barIncrements;
        progressBar.setAttribute(
          "style",
          "transform: translateX(" + barPosition + "%) !important;"
        );
        setTimeout(moveProgress, 500);
      }
    })();
  };

  // starts app once everything is loaded
  window.addEventListener("load", init, false);
})();
