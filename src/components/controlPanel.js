import React, { useState } from "react";
import classNames from "classnames";
import ControlBar from "./controlBar";

const ControlPanel = (props) => {
  const { children } = props;
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const classes = classNames("control-panel", {
    "animate-controls-up": isPanelOpen,
    "animate-controls-down": !isPanelOpen
  });

  // TODO
  // There's still something funky here. When a live-reload happens after
  // changes are saved and the app refreshes... the dom updates the location
  // of the controlPanel for some reason.

  // After more research, it seems like command + R is a hot reload which
  // clears state but doens't update the dom. Clicking the menu bar button
  // again moves up instead of back down and leaves the controlPanel
  // with extra height because of it's new starting position.

  return (
    <div className={classes}>
      <ControlBar isPanelOpen={isPanelOpen} setIsPanelOpen={setIsPanelOpen} />
      {children}

      <style jsx>{`
        .control-panel {
          height: 100vh;
          position: absolute;
          margin-top: 320px;
          width: 100%;
          will-change: top;
        }
        .animate-controls-up {
          margin-top: 24px;
          transition: margin-top 0.2s ease-in-out;
        }
        .animate-controls-down {
          margin-top: 320px;
          transition: margin-top 0.2s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default ControlPanel;