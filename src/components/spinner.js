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
          width: 24px;
          height: 24px;
        }
        #spinner {
          position: absolute;
          font-size: 2px;
          text-indent: -9999em;
          border-top: 1.1em solid rgba(255, 255, 255, 0.2);
          border-right: 1.1em solid rgba(255, 255, 255, 0.2);
          border-bottom: 1.1em solid rgba(255, 255, 255, 0.2);
          border-left: 1.1em solid var(--primary);
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