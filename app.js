(function() {
    var width = 1280;
    var height = 720;

    var photosTakenCount = null;
    var streaming = false;

    var video = null;
    var canvas = null;
    var photo = null;
    var shutter = null;
    var status = null;
    var flashArea = null;
    var photosTaken = null;
    var flash = null;

    function init() {
        video = document.getElementById('video');
        canvas = document.getElementById('canvas');
        photo = document.getElementById('photo');
        status = document.getElementById('status');
        flashArea = document.getElementById('flash-area');
        photosTaken = document.getElementById('photos-taken');
        flash = document.getElementById('flash');

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

                video.onloadedmetadata = function(e) {
                    video.play();
                    console.log('* video feed live');

                    video.classList.add('fadeInOnce');

                    // removes status element
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
        // var context = canvas.getContext('2d');
        // context.fillStyle = "#AAA";
        // context.fillRect(0, 0, canvas.width, canvas.height);

        // removes flash element from dom
        flash.parentNode.removeChild(flash);

        var data = canvas.toDataURL('image/png');
        photo.setAttribute('src', data);
    }

    function takePhoto() {
        console.log('* took a photo');

        var context = canvas.getContext('2d');
        canvas.width = width;
        canvas.height = height;
        context.drawImage(video, 0, 0, width, height);
    
        // creates a flash effects
        flash = document.createElement("div");
        flash.setAttribute('id', "flash");
        flash.className = 'flash';
        flashArea.appendChild(flash);

        // adds the new photo to the dom
        var data = canvas.toDataURL('image/png');
        photo.setAttribute('src', data);

        // increment photo count and update display
        photosTakenCount++;
        photosTaken.innerHTML = photosTakenCount;
        console.log('Photos taken: ' + photosTakenCount);

        setTimeout(function() {
            clearPhoto();
        }, 2000);
      }

    setInterval(function() {
        takePhoto();
    }, 3000);

    // starts app once everything is loaded
    window.addEventListener('load', init, false);
})();