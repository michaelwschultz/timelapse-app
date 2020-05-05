import React from "react";
import classNames from "classnames";

const ControlPanel = (props) => {
  const { children, open = false } = props;

  const classes = classNames("control-panel", {"animate-controls": open});
  return (
    <div className={classes}>
      {open && children}
      <style jsx>{`
        .control-panel {
          margin: 32px auto;
          width: 408px;
          position: absolute;
          top: 296px;
          backgroundColor: white;
        }
        .animate-controls {
          will-change: transform;
          transform: translateY(-296px);
        }
      `}</style>
    </div>
  );
};

export default ControlPanel;