import React, { useRef } from 'react';
import useDeviceCamera from '../hooks/useDeviceCamera';

const CAPTURE_OPTIONS = {
  audio: false,
  video: {
    width: { min: 1280, ideal: 1280, max: 1280 },
    height: { min: 720, ideal: 720, max: 720 },
  }
};

// Poor mans CLI arguments
// These are currently being passed through webpack manualy
// Have I mentioned how much I hate webpack?
const CAMERA_HIDDEN = ARGUMENTS.includes("--env=nocam");

const Camera = () => {
  if (CAMERA_HIDDEN) {
    return (
      <div id="status">
        Camera hidden
      </div>
    );
  }

  const videoRef = useRef();
  const mediaStream = useDeviceCamera(CAPTURE_OPTIONS);

  if (mediaStream && videoRef.current && !videoRef.current.srcObject) {
    videoRef.current.srcObject = mediaStream;
  }

  function handleCanPlay() {
    videoRef.current.play();
  }

  return (
    <video id="video" ref={videoRef} onCanPlay={handleCanPlay} autoPlay playsInline muted />
  );
}

export default Camera;