import React from "react";
import classNames from "classnames";

const Spinner = (props) => {
  const { showing = false, spinning = false } = props;

  if (!showing) {
    return null;
  }

  const classes = classNames({"fadeInOnce": showing, "spin": spinning});

  return (
    <div id="spinner" className={classes}>
      <style jsx>{`
        #spinner, #spinner, :after {
          border-radius: 50%;
          width: 20px;
          height: 20px;
        }
        #spinner {
          text-indent: -9999em;
          border-top: 2px solid rgba(255, 255, 255, 0.2);
          border-right: 2px solid rgba(255, 255, 255, 0.2);
          border-bottom: 2px solid rgba(255, 255, 255, 0.2);
          border-left: 2px solid var(--primary);
          transform: translateZ(0);
        }
        .spin {
          animation: spin 1s infinite linear;
        }
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default Spinner;