import React from "react";
import Spinner from "../spinner";

const ControlBar = (props) => {
  const {
    isPanelOpen,
    setIsPanelOpen,
    showSpinner = false,
    spinSpinner = false,
  } = props;

  return (
    <>
      <div id="controls">
        <div className="flex justify-between items-center px2">

          {/* left affordance */}
          <div className="flex items-center">
            <button id="menu-button" onClick={() => setIsPanelOpen(!isPanelOpen)}>
              <div className="bar"></div>
              <div className="bar"></div>
              <div className="bar"></div>
            </button>
            {/* <button id="clear-all" disabled>
              Clear All
            </button> */}
          </div>

          {/* center affordance */}
          <div className="flex items-center">
            <Spinner showing={showSpinner} spinning={spinSpinner} />
            <div id="photo-count"></div>
          </div>

          {/* right affordance */}
          <div className="flex items-center">
            {/* <button id="create-video-button" disabled>
              Export Timelapse Video
            </button> */}
            <button id="start-button" title="Start">Start</button>
          </div>
        </div>
      </div>
      {/*
        TODO
        Rename this file to controlBar(s) and export
        several control bars: default, playBar, editBar, etc...

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
          background: #131D2A;
        </div>
      */}

      <style jsx>{`
        #controls {
          background: #131D2A;
          padding: 8px 0;
          width: 100%;
          z-index: 12;
        }
        #photo-count {
          color: white;
          font-size: 12px;
          line-height: 24px;
          opacity: 0.5;
          padding-left: 8px;
          pointer-events: none;
          text-align: center;
          z-index: 9;
        }
      `}</style>
    </>
  );
};

export default ControlBar;