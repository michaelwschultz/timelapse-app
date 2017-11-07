(function() {
    var fs = require('fs');
    var path = require('path');
    var os = require('os');

    var settingsFileLocation = null;
    var userSettings = null;

    var timelapseLength = 3;
    var secondsBetweenPhotos = 1;
    var warmupDelaySeconds = 2;

    var directoryName = null;

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
    var photoContainer = null;
    var closeButton = null;
    var startButton = null;
    var status = null;
    var flashArea = null;
    var numPhotosTaken = null;
    var flash = null;

    function init() {
        var getUserSettings = function() {
            settingsFileLocation = './userSettings.json';
            
            // TODO generate real unique ID
            var userId = '29';

            var userSettingsTemplate = {
                "user": {
                    "userId": userId, 
                    "created": new Date(),
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
                console.log('Using current userSettings file.');
            }

            // increases appOpens by 1
            ++userSettings.user.appOpens;
            try { fs.writeFileSync(settingsFileLocation, JSON.stringify(userSettings, null, 4)); }
            catch(e) { alert('Failed to save userSettings!'); }
            finally {
                userSettings = require(settingsFileLocation);
            }

            console.table(userSettings);
        }();

        video = document.getElementById('video');
        canvas = document.getElementById('canvas');
        photos = document.getElementById('photos');
        status = document.getElementById('status');
        flashArea = document.getElementById('flash-area');
        numPhotosTaken = document.getElementById('photo-count');
        startButton = document.getElementById('start-button');

        console.log(photos.hasChildNodes.length);

        var createPhotoDirectory = function() {
            directoryName = 'photos';

            if (!fs.existsSync(directoryName)) {
                fs.mkdirSync(directoryName);
                console.log('new folder created')
            }
        }();

        turnOnCamera();

        startButton.addEventListener('click', function(ev){
            // resets state of app before starting a new timelapse
            reset(timelapse);
            ev.preventDefault();
        }, false);
    }

    function reset(callback) { 
        // removes status element from dom
        status.innerHTML = "";

        document.getElementById("start-button").disabled = true;

        // clears out all photo atributes
        photoCount = 0;
        numPhotosTaken.innerHTML = photoCount;

        if (photos.children.length > 0) {
            console.log("test");
            photos.innerHTML = "";
        }

        console.log("** Reset! **");
        callback();
    }

    function turnOnCamera() {
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
                    // video.play();
                    cameraReady = true;
                    console.log('* video feed live');

                    video.classList.add('fadeInOnce');

                    // removes status element from dom
                    status.innerHTML = "";
                    // status.parentNode.removeChild(status);

                    localStream.getTracks()[0].onended = function(event) {
                        document.getElementById("start-button").disabled = false;
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

    function turnOffCamera() {
        // cameraDevice.getTracks().forEach(function(track) {
        //     track.stop();
        // });

        localStream.getTracks()[0].stop();

        setTimeout(function() {
            cameraReady = false;
        }, 1000);
    }

    function showPhoto() {
        photo.classList.remove("hide");
        photo.classList.add("fadeInRight");
    }

    function hidePhoto() {
        photo.classList.remove("fadeInRight");
        photo.classList.add("hide");
    }

    // todo: actually remove the photo correctly
    // function removePhoto() {
    //     get id of photo
    //     remove photo from array
    // }

    function takePhoto() {
        if (flash !== null) {
            flash.parentNode.removeChild(flash);
        }

        // creates a flash effects
        flash = document.createElement("div");
        flash.setAttribute('id', "flash");
        flash.className = 'flash';
        flashArea.appendChild(flash);

        // creates a new photo component
        newPhoto = "photo" + photoCount;

        photoContainer = document.createElement("div");
        photoContainer.className = "photo-container fadeInRight";

        // inserts a close button
        closeButton = document.createElement("div");
        closeButton.className = "close-button";
        photoContainer.appendChild(closeButton);
        closeButton.innerHTML = "x";

        closeButton.addEventListener("click", function(ev){

            // TODO: fix bug that just removes the last photo in the array.
            //       Each button should know which photo it's tied to.
            photoContainer.parentNode.removeChild(photoContainer);

            ev.preventDefault();
        }, false);

        photo = document.createElement("img");
        photo.setAttribute("id", newPhoto);
        photo.className = "photo";
        photoContainer.appendChild(photo);

        photos.appendChild(photoContainer);
        
        currentPhoto = document.getElementById(newPhoto);

        // captures image and adds new photo data to the dom
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(video, 0, 0, width, height);
        photo.setAttribute("src", canvas.toDataURL("image/png"));
        showPhoto();

        imageData = canvas.toDataURL("image/png");
        justImage = imageData.replace(/^data:image\/\w+;base64,/, "");
        imageBuffer = new Buffer(justImage, 'base64');
        try { fs.writeFileSync(directoryName + '/time-lapse-photo' + photoCount + '.png', imageBuffer); }
        catch(e) { alert('Failed to save the photo!'); }
        
        // increment photo count and update display;
        photoCount++;
        console.log("Photos taken: " + photoCount);

        // stop timelapse if photoCount hits timelapseLength
        if (photoCount >= timelapseLength) {
            console.log('photo count - ' + photoCount + ' timelapse count - ' + timelapseLength);
            numPhotosTaken.innerHTML = photoCount + ' and done';
            console.log("timelapse finished");

            status.innerHTML = "All done!";

            turnOffCamera();

            // read userSettings to store stats
            fs.readFile(settingsFileLocation, 'utf8', function (err, data) {
                if (err) throw err;
                userSettings = JSON.parse(data);
            });

            // increases timelapseComplete by 1 and adds photos to total count.
            ++userSettings.user.timelapseComplete;
            userSettings.user.photosTaken = userSettings.user.photosTaken + photoCount;
            try { fs.writeFileSync(settingsFileLocation, JSON.stringify(userSettings, null, 4)); }
            catch(e) { alert('Failed to save userSettings!'); }
            finally {
                userSettings = require(settingsFileLocation);
            }
        } else {
            numPhotosTaken.innerHTML = photoCount;
        }
    }

    function timelapse() {
        console.log("- start timelapse");

        if (cameraReady == false) {
            turnOnCamera();
        }

        var timelapseLoop = setInterval(function() {
            if (photoCount >= timelapseLength) {
                clearInterval(timelapseLoop);

                // TODO: not sure if I need this return
                return;
            } else if (cameraReady == false) {
                turnOnCamera();
            }
            var readyToTakePhoto = setInterval(function() {
                // makes sure camera is ready to take a photo
                if (cameraReady == true) {
                    console.log('CAM READY!!');
                    clearInterval(readyToTakePhoto);
                    takePhoto();
                }
            }, 500);
        }, secondsBetweenPhotos * 1000);
    }

    // starts app once everything is loaded
    window.addEventListener('load', init, false);
})();