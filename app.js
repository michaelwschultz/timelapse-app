(function() {
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
    var photo = null;
    var photos = null;
    var photoContainer = null;
    var closeButton = null;
    var startButton = null;
    var status = null;
    var flashArea = null;
    var numPhotosTaken = null;
    var flash = null;
    var cameraDevice = null;

    function init() {
        video = document.getElementById('video');
        canvas = document.getElementById('canvas');
        photos = document.getElementById('photos');
        status = document.getElementById('status');
        flashArea = document.getElementById('flash-area');
        numPhotosTaken = document.getElementById('photos-taken');
        startButton = document.getElementById('start-button');

        turnOnCamera();

        startButton.addEventListener('click', function(ev){
            // resets state of app before starting a new timelapse
            reset();

            timelapse();
            ev.preventDefault();
        }, false);
    }

    function reset() {
        // removes status element from dom
        status.innerHTML = "";

        // clears out all photo atributes
        photoCount = 0;
        numPhotosTaken.innerHTML = photoCount;
        // hidePhoto();
        // photo.setAttribute('src', '');
        console.log("** Reset! **");
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
                cameraDevice = stream;

                video.onloadedmetadata = function(e) {
                    video.play();
                    cameraReady = true;
                    console.log('* video feed live');

                    video.classList.add('fadeInOnce');

                    // removes status element from dom
                    status.innerHTML = "";
                    // status.parentNode.removeChild(status);
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
        cameraDevice.getTracks()[0].stop();
        cameraReady = false;
    }

    function showPhoto() {
        photo.classList.remove("hide");
        photo.classList.add("fadeInRight");
    }

    function hidePhoto() {
        photo.classList.remove("fadeInRight");
        photo.classList.add("hide");
    }

    // todo
    // function removePhoto() {
    //     get id of photo
    //     remove photo from array
    // }

    function takePhoto() {

        // creates a flash effects
        flash = document.createElement("div");
        flash.setAttribute('id', "flash");
        flash.className = 'flash';
        flashArea.appendChild(flash);

        // todo: create an array of divs that and know
        //       which one to add a photo to before moving on to the next

        // creates a new photo component
        newPhoto = "photo" + photoCount;

        photoContainer = document.createElement("div");
        photoContainer.className = "photo-container fadeInRight";
        

        // Add x button here
        closeButton = document.createElement("div");
        closeButton.className = "close-button";
        photoContainer.appendChild(closeButton);
        closeButton.innerHTML = "x";

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
        
        // increment photo count and update display;
        photoCount++;
        console.log("Photos taken: " + photoCount);

        // stop timelapse if photoCount hits timelapseLength
        if (photoCount >= timelapseLength) {
            numPhotosTaken.innerHTML = photoCount + ' and done';
            console.log("timelapse finished");
            turnOffCamera();

            status.innerHTML = "All done!";
        } else {
            numPhotosTaken.innerHTML = photoCount;
        }

        // setTimeout(function() {
        //     hidePhoto();
        // }, 2000);
        
        setTimeout(function() {

            // todo: final flash is being removed twice

            flash.parentNode.removeChild(flash);
        }, 1000);
    }

    function timelapse() {
        console.log("- start timelapse");

        if (cameraReady == false) {
            turnOnCamera();
        }

        var timelapseLoop = setInterval(function() {
            if (photoCount >= timelapseLength) {
                clearInterval(timelapseLoop);
            } else if (cameraReady == false) {
                turnOnCamera();
            }
            var readyToTakePhoto = setInterval(function() {
                // makes sure camera is ready to take a photo
                if (cameraReady == true) {
                    console.log('CAM READY!!');
                    takePhoto();
                    clearInterval(readyToTakePhoto);
                }
            }, 500);
        }, secondsBetweenPhotos * 1000);
    }

    // starts app once everything is loaded
    window.addEventListener('load', init, false);
})();