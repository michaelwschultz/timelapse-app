navigator.getUserMedia = navigator.getUserMedia ||
                         navigator.webkitGetUserMedia ||
                         navigator.mozGetUserMedia;

if (navigator.getUserMedia) {
    navigator.getUserMedia({video: true},
        function(stream) {
            var status = document.getElementById("status");
            var video = document.getElementById('camera');
            video.srcObject = stream;
            status.innerHTML = "Warming up camera...";

            video.onloadedmetadata = function(e) {
                video.play();
                video.classList.add('fadeInOnce');
                console.log('Video feed live!');

                // removes status element
                status.parentNode.removeChild(status);
            };
        },
        function() {
            status.innerHTML = "Could not connect to camera!";
        }
    );
} else {
    document.getElementById("status").innerHTML = "Sorry, can't find your webcam.";
    console.log("getUserMedia not supported.");
}