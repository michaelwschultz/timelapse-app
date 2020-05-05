import React from "react";
import Spinner from "./spinner";

const ControlBar = () => {
  const showSpinner = false;
  const spinSpinner = false;

  return (
    <div>
      <div id="playback-controls" className="hide">
        <div className="flex justify-between px2 mb1">
          <button id="btn-play-pause" title="Play">
            Play
          </button>
          <div>
            <button id="btn-open-file" title="View in Quicktime">
              View in Quicktime
            </button>
            <button id="btn-show-file" title="Go to video">
              Go to video
            </button>
          </div>
          <button id="btn-close-playback" title="Back">
            Back
          </button>
        </div>
      </div>

      <div id="controls" className="fadeInUp">
        <div className="flex justify-between px2 mb1">
          <div
            className="absolute"
            style={{width: "28px", height: "28px", left: "50%", marginLeft: "-14px"}}
          >
            <Spinner showing={showSpinner} spinning={spinSpinner} />
            <div id="photo-count"></div>
          </div>
          <div className="flex">
            <button id="menu-button">
              <div className="bar"></div>
              <div className="bar"></div>
              <div className="bar"></div>
            </button>
            <button id="clear-all" disabled>
              Clear All
            </button>
          </div>
          <>
            <button id="create-video-button" disabled>
              Export Timelapse Video
            </button>
            <button id="start-button" title="Start">Start</button>
          </>
        </div>
      </div>
    </div>
  );
};

export default ControlBar;