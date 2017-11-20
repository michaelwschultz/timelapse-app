(function() {
    const {app} = require('electron').remote;
    const fs = require('fs');
    const path = require('path');
    const shell = require('electron').shell
    const os = require('os');

    var ffbinaries = require('ffbinaries');
    var ffmpeg = require('fluent-ffmpeg');
    var videoshow = require('videoshow');

    var versionNumber = "0.0.1";
    var userDataPath = app.getPath('userData');

    var settingsFileLocation =  userDataPath + '/userSettings.json';
    var userSettings = null;

    var timelapseLength = 5;
    var secondsBetweenPhotos = 1;
    var warmupDelaySeconds = 2;

    var width = 1280;
    var height = 720;

    var currentPhoto = null;
    var photoCount = 0;
    var cameraReady = false;

    var video = null;
    var canvas = null;
    var imageData = null;
    var justImage = null;
    var imageBugger = null;
    var photo = null;
    var photos = null;
    var photoArray = null;
    var photoContainer = null;
    var removeButton = null;
    var startButton = null;
    var status = null;
    var flashArea = null;
    var numPhotosTaken = null;
    var flash = null;
    var controls = null;
    var settings = null;
    var menuButton = null;
    var spinner = null;
    var startAppOnLaunch = null;
    var checkbox = null;

    var timelapseRunning = false;
    var timelapseLoop = null;
    var loopInterval = null;

    var appName = app.getName();
    var photosPath = path.join(app.getPath('pictures'), appName);
    var timelapseDirectoryName = null;

    var binaryDest = userDataPath + '/Binaries';
    var videoFiles = [];
    var videoOptions = {
        fps: 30,
        loop: 0.3, // seconds
        transition: false,
        transitionDuration: 0, // seconds
        videoBitrate: 5000,
        videoCodec: 'libx264',
        size: '1280x720',
        // audioBitrate: '128k',
        // audioChannels: 2,
        format: 'mp4',
        pixelFormat: 'yuv420p'
    }

    var updateUserSettings = function() {
        try { fs.writeFileSync(settingsFileLocation, JSON.stringify(userSettings, null, 4)); }
        catch(e) { console.log('Failed to save the user settings file!'); }
        finally {
            userSettings = require(settingsFileLocation);
            console.log('User settings updated.');
        }
    }

    function init() {
        if (!fs.existsSync(binaryDest)) {
            // downloads required ffmpeg binary for video conversion
            ffbinaries.downloadFiles(['ffmpeg', 'ffprobe'], {
                platform: 'osx-64',
                quiet: true,
                destination: binaryDest
            }, function () {
                console.log('Downloaded ffmpeg to ' + binaryDest + '.');
            });
        }

        ffmpeg.setFfmpegPath(binaryDest + '/ffmpeg');

        var createPhotosDirectory = function() {
            if (!fs.existsSync(photosPath)) {
                fs.mkdirSync(photosPath);
                console.log('new photo folder created')
            }
        }();

        var getUserSettings = function() {
            // TODO generate real unique ID
            var userId = 'user-' + new Date().toISOString().slice(0, 10) + '-' + new Date().getHours() + new Date().getMinutes() + new Date().getSeconds();

            var userSettingsTemplate = {
                "user": {
                    "userId": userId, 
                    "created": new Date(),
                    "startAppOnLaunch": false,
                    "appOpens": null,
                    "photosTaken": null,
                    "timelapseComplete": null
                },
                "system": {
                    "platform": os.platform(),
                    "release": os.release(),
                    "architecture": os.arch(),
                    "homeDirectory": os.homedir(),
                    "tempDirectory": os.tmpdir()
                }
            };

            if (!fs.existsSync(settingsFileLocation)) {
                try { fs.writeFileSync(settingsFileLocation, JSON.stringify(userSettingsTemplate, null, 4)); }
                catch(e) { console.log('Failed to save the user settings file!'); }
                finally {
                    userSettings = require(settingsFileLocation);
                    console.log('New user settings file created.');
                }
            } else {
                userSettings = require(settingsFileLocation);
            }

            // increases appOpens by 1
            ++userSettings.user.appOpens;
            updateUserSettings();
        }();

        // global variables
        video = document.getElementById('video');
        canvas = document.getElementById('canvas');
        photos = document.getElementById('photos');
        status = document.getElementById('status');
        flashArea = document.getElementById('flash-area');
        numPhotosTaken = document.getElementById('photo-count');
        startButton = document.getElementById('start-button');
        createVideoButton = document.getElementById('create-video-button');
        controls = document.getElementById('controls');
        menuButton = document.getElementById('menu-button');
        spinner = document.getElementById('spinner');
        settings = document.getElementById('settings');
        checkbox = document.querySelectorAll('input[type=checkbox]');
        startAppOnLaunch = document.getElementById('start-app-on-launch');

        renderControls();

        // add event listeners to controls
        startButton.addEventListener('click', function(ev){
            // resets state of app before starting a new timelapse
            if (timelapseRunning == false) {
                timelapseRunning = true;
                reset(timelapse);
            } else {
                clearInterval(loopInterval);
                timelapseFinished();

                return;
            }
            ev.preventDefault();
        }, false);

        createVideoButton.addEventListener('click', function(ev){
            makeVideo();
            ev.preventDefault();
        }, false);

        menuButton.addEventListener('click', function(ev){
            if (controls.classList.contains('animate-controls')) {
                controls.classList.remove('animate-controls');
            } else {
                controls.classList.add('animate-controls');
            }
            
            ev.preventDefault();
        }, false);

        checkbox.forEach(function(elem) {

            // set checked states of user settings
            elem.checked = userSettings.user[elem.name];

            elem.addEventListener('change', function() {
                if (this.checked == true) {
                    this.checked = true;
                    userSettings.user[this.name] = true;
                } else {
                    this.checked = false;
                    userSettings.user[this.name] = false;
                }
                updateUserSettings();
            })
        });
    }

    var reset = function(callback)  { 
        // removes status element from dom
        status.innerHTML = "";

        startButton.innerHTML = "Stop";
        createVideoButton.disabled = true;

        // clears out all photo atributes
        if (photoCount > 0) {
            numPhotosTaken.innerHTML = "";
        }
        photoCount = 0;

        // clears out photos in dom
        if (photos.children.length > 0) {
            photos.innerHTML = "";
        }

        // starts timelapse
        callback();
    }

    var renderControls = function() {
        controls.className = 'fadeInUp';
        
        // TODO: fix this timeout hack to block video from starting before controls are visible
        setTimeout(function(){
            turnOnCamera();
        }, 500);
    }

    var turnOnCamera = function() {
        if (navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({
                video: {
                    width: {min: 1280, ideal: 1280, max: 1280},
                    height: {min: 720, ideal: 720, max: 720}
                }
            })
            .then(function(stream) {
                console.log("- warming up camera");
                status.innerHTML = "Warming up camera...";
                video.srcObject = stream;
                window.localStream = stream;

                video.onloadedmetadata = function(e) {
                    cameraReady = true;
                    console.log('* video feed live');

                    video.className = 'fadeInOnce';

                    // removes status element from dom
                    status.innerHTML = "";
                    // status.parentNode.removeChild(status);

                    localStream.getTracks()[0].onended = function(event) {
                        // TODO: move this line to the finished function
                        startButton.innerHTML = "Start";
                        createVideoButton.disabled = false;
                    }
                };
            })
            .catch(function() {
                console.log('x could not connect to camera');
                status.innerHTML = "Could not connect to camera!";
            });
        } else {
            status.innerHTML = "Sorry, can't find your webcam.";
            console.log("getUserMedia not supported.");
        }
    }

    var turnOffCamera = function() {
        // cameraDevice.getTracks().forEach(function(track) {
        //     track.stop();
        // });

        localStream.getTracks()[0].stop();

        setTimeout(function() {
            cameraReady = false;
        }, 1000);
    }

    var showPhoto = function() {
        photo.classList.remove("hide");
        photo.classList.add("fadeInRight");
    }

    var hidePhoto = function() {
        photo.classList.remove("fadeInRight");
        photo.classList.add("hide");
    }

    var takePhoto = function() {
        if (flash !== null) {
            flash.parentNode.removeChild(flash);
        }

        // creates a flash effects
        flash = document.createElement("div");
        flash.setAttribute('id', "flash");
        flash.className = 'flash';
        flashArea.appendChild(flash);

        // creates a new photo component
        photoContainer = document.createElement("div");
        photoContainer.setAttribute("id", "photo-" + photoCount);
        photoContainer.className = "photo-container fadeInRight";

        photo = document.createElement("img");
        photo.className = "photo";
        photoContainer.appendChild(photo);

        photos.appendChild(photoContainer);

        // inserts a close button
        removeButton = document.createElement("div");
        removeButton.className = "close-button";
        photoContainer.appendChild(removeButton);

        // gathers all the photos taken into an array
        var photoArray = Array.from(document.querySelectorAll('.close-button'));

        removeButton.addEventListener("click", function(ev){
            var removePhoto = ev.target.classList.contains('close-button');
            var index = photoArray.findIndex(el => el == ev.target);

            if (removePhoto) {
                try { fs.unlinkSync(timelapseDirectoryName + '/timelapse-photo-' + index + '.png'); }
                catch(e) { alert('Failed to remove photo!'); }
                finally { document.getElementById("photo-" + index).parentNode.removeChild(document.getElementById("photo-" + index)); }
            }

            ev.preventDefault();
        }, false);

        // captures image and adds new photo data to the dom
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(video, 0, 0, width, height);
        photo.setAttribute("src", canvas.toDataURL("image/png"));
        showPhoto();

        imageData = canvas.toDataURL("image/png");
        justImage = imageData.replace(/^data:image\/\w+;base64,/, "");
        imageBuffer = new Buffer(justImage, 'base64');
        try { fs.writeFileSync(timelapseDirectoryName + '/timelapse-photo-' + photoCount + '.png', imageBuffer); }
        catch(e) { alert('Failed to save the photo!'); }
        
        // increment photo count and update display;
        photoCount++;
        numPhotosTaken.innerHTML = photoCount;

        // continues to scroll to the left as more photos come in
        photos.scrollLeft = photos.scrollWidth - photos.clientWidth;
    }

    var timelapse = function() {
        spinner.classList.add("spin");

        if (cameraReady == false) {
            turnOnCamera();
        }

        var createTimelapseDirectory = function() {
            timelapseDirectoryName = photosPath + '/timelapse-' + new Date().toISOString().slice(0, 10) + '-' + new Date().getHours() + new Date().getMinutes() + new Date().getSeconds();
            if (!fs.existsSync(timelapseDirectoryName)) {
                fs.mkdirSync(timelapseDirectoryName);
                console.log('new timelapse folder created')
            }
        }();

        var timelapseFinished = function() {
            fs.readdir(timelapseDirectoryName, (err, files) => {
                files.forEach(file => {
                    if (!/^\..*/.test(file)) {
                        videoFiles.push(timelapseDirectoryName + '/' + file)
                    }
                });
            });

            // run after timelapse
            video.className = "hide";
            spinner.classList.remove("spin");
            numPhotosTaken.innerHTML = photoCount;
            console.log('photo count - ' + photoCount + ' timelapse count - ' + timelapseLength);

            // status.innerHTML = "All done!";

            turnOffCamera();
            timelapseRunning = false;

            // increases timelapseComplete by 1 and adds photos to total count.
            ++userSettings.user.timelapseComplete;
            userSettings.user.photosTaken = userSettings.user.photosTaken + photoCount;
            updateUserSettings();
        };

        var timelapseLoop = function() {

            var loop = function() {
                if (photoCount >= timelapseLength) {
                    clearInterval(loopInterval);
                    timelapseFinished();

                    return;
                } else if (cameraReady == false) {
                    turnOnCamera();
                }
                var readyToTakePhoto = setInterval(function() {
                    // makes sure camera is ready to take a photo
                    if (cameraReady == true) {
                        clearInterval(readyToTakePhoto);
                        takePhoto();
                    }
                }, 500);
            };

            loop();
            var loopInterval = setInterval(loop, secondsBetweenPhotos * 1000);
        }();
    }

    var makeVideo = function() {
        document.getElementById("create-video-button").disabled = true;

        videoshow(videoFiles, videoOptions)
            .save(timelapseDirectoryName + '/timelapse-video-' + new Date().toISOString().slice(0, 10) + '-' + new Date().getHours() + new Date().getMinutes() + new Date().getSeconds() + '.mp4')
            .on('start', function (command) {
            console.log('ffmpeg process started:', command)
            })
            .on('progress', function(progress) {
            console.log('Processing: ' + progress.percent + '% done')
            })
            .on('error', function (err, stdout, stderr) {
            console.error('Error:', err)
            console.error('ffmpeg stderr:', stderr)
            })
            .on('end', function () {
            console.log('Video created!');
            document.getElementById("create-video-button").disabled = false;
            })
    }

    // starts app once everything is loaded
    window.addEventListener('load', init, false);
})();