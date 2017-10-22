(function() {
    var timelapseLength = 2;
    var secondsBetweenPhotos = 4;

    var timelapseCount = null;

    var width = 1280;
    var height = 720;

    var photoCount = null;
    var cameraReady = false;

    var video = null;
    var canvas = null;
    var photo = null;
    var startButton = null;
    var status = null;
    var flashArea = null;
    var photosTaken = null;
    var flash = null;
    var cameraDevice = null;

    function init() {
        video = document.getElementById('video');
        canvas = document.getElementById('canvas');
        photo = document.getElementById('photo');
        status = document.getElementById('status');
        flashArea = document.getElementById('flash-area');
        photosTaken = document.getElementById('photos-taken');
        flash = document.getElementById('flash');
        startButton = document.getElementById('start-button');

        turnOnCamera();

        startButton.addEventListener('click', function(ev){
            clearTimelapse(); //clears out previous screens

            // TODO call reset funciton

            timelapseCount++;
            timelapse();
            ev.preventDefault();
        }, false);
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
                    status.parentNode.removeChild(status);
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

    function clearPhoto() {
        flash.parentNode.removeChild(flash);

        // removes previous photo from dom
        //TODO this doesn't quite work right(adds a border to the photo element)
        photo.setAttribute('src', '');
    }

    function clearTimelapse() {
        
        // may need to double check return; area below
        // to make sure this doesn't screw it up

        photo.setAttribute('src', '');
        photoCount = null;
        photosTaken.innerHTML = photoCount;
    }

    function timelapse() {

        function takePhoto() {
            // creates a flash effects
            flash = document.createElement("div");
            flash.setAttribute('id', "flash");
            flash.className = 'flash';
            flashArea.appendChild(flash);

            // captures image and adds new photo data to the dom
            canvas.width = width;
            canvas.height = height;
            canvas.getContext('2d').drawImage(video, 0, 0, width, height);
            photo.setAttribute('src', canvas.toDataURL('image/png'));
            
            // increment photo count and update display
            console.log('* took a photo');
            photoCount++;
            photosTaken.innerHTML = photoCount;
            console.log('Photos taken: ' + photoCount);

            // stop timelapse if photoCount hits photoCount
            if (photoCount >= timelapseLength) {
                clearInterval(timelapseLoop);
                photosTaken.innerHTML = photoCount + ' and done';
                console.log("timelapse finished");
                cameraDevice.getTracks()[0].stop();
                
                // freezes on final photo
                return;
            } else if (secondsBetweenPhotos >= 4) {
                cameraDevice.getTracks()[0].stop();
                cameraReady = false;
            }

            setTimeout(function() {
                clearPhoto();
            }, 1000);
        }

        var timelapseLoop = setInterval(function() {
            if (cameraReady == false) {
                turnOnCamera();
            }
            var readyToTakePhoto = setInterval(function() {
                if (cameraReady == true) {
                    console.log('CAM READY!!');
                    takePhoto();
                    clearInterval(readyToTakePhoto);
                }
            }, 100);
        }, secondsBetweenPhotos * 1000);
    }

    // starts app once everything is loaded
    window.addEventListener('load', init, false);
})();