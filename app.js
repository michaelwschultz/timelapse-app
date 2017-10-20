navigator.getUserMedia = navigator.getUserMedia ||
                         navigator.webkitGetUserMedia ||
                         navigator.mozGetUserMedia;

if (navigator.getUserMedia) {
    navigator.getUserMedia({video: true},
        function(stream) {
            var video = document.getElementById('camera');
            video.srcObject = stream;

            video.onloadedmetadata = function(e) {
                video.play();
                video.classList.add('fadeInOnce');
                console.log('Video feed live!')
            };
        },
        function() {
            alert('Could not connect to camera!');
        }
    );
} else {
   console.log("getUserMedia not supported.");
}