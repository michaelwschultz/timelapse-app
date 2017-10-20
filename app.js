if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({video: true})
    .then(function(stream) {
        console.log("- warming up camera")

        var status = document.getElementById("status");
        var video = document.getElementById('camera');
        video.srcObject = stream;
        status.innerHTML = "Warming up camera...";

        video.onloadedmetadata = function(e) {
            video.play();
            console.log('* video feed live');

            video.classList.add('fadeInOnce');
            
            // removes status element
            status.parentNode.removeChild(status);
        };
    })
    .catch(function() {
        status.innerHTML = "Could not connect to camera!";
    });
} else {
    document.getElementById("status").innerHTML = "Sorry, can't find your webcam.";
    console.log("getUserMedia not supported.");
}