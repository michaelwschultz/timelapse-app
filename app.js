navigator.webkitGetUserMedia({video: true},
  function(stream) {
    var video = document.getElementById('camera');
    video.srcObject = stream;

    video.onloadedmetadata = function(e) {
      video.classList.add('fadeInOnce');
      console.log('Video feed live!')
   };
  },
  function() {
    alert('Could not connect to camera!');
  }
);