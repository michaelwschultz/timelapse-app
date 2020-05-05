import React from "react";

const Settings = () => {
  return (
    <>
      <div id="settings" className="mt2 px2">
        <div className="flex justify-between items-center mb2">
          <span
            id="app-name"
            className="h4"
            style={{color: "white", pointerEvents: "none"}}
          >
            Timelapse
          </span>
          <span
            id="app-version"
            className="h6"
            style={{color: "white", opacity: 0.2, pointerEvents: "none"}}
          ></span>
        </div>

        <div id="timelapse-options" className="flex justify-between">
          <div className="option-group">
            <h4>Photo Frequency</h4>
            <div className="input-options flex items-center justify-between">
              <button id="frequency-down" className="option-button">
                <img src="assets/chevron.png" />
              </button>
              <input id="photo-frequency" value="15" type="number" />
              <button id="frequency-up" className="option-button right">
                <img src="assets/chevron.png" />
              </button>
            </div>
            <div className="timing flex items-center justify-between">
              <button id="frequency-time-s" value="s">
                S
              </button>
              <button id="frequency-time-m" value="m">
                M
              </button>
              <button id="frequency-time-h" value="h">
                H
              </button>
            </div>
          </div>

          <div className="option-group">
            <h4>Timelapse Duration</h4>
            <div className="input-options flex items-center justify-between">
              <button id="duration-down" className="option-button">
                <img src="assets/chevron.png" />
              </button>
              <input id="timelapse-duration" value="15" type="number" />
              <button id="duration-up" className="option-button right">
                <img src="assets/chevron.png" />
              </button>
            </div>
            <div className="timing flex items-center justify-between">
              <button id="duration-time-s" value="s">
                S
              </button>
              <button id="duration-time-m" value="m">
                M
              </button>
              <button id="duration-time-h" value="h">
                H
              </button>
            </div>
          </div>
        </div>

        <br />

        <ul>
          <li className="checkbox">
            <input
              type="checkbox"
              id="start-app-on-launch"
              name="startAppOnLaunch"
            />
            <label htmlFor="start-app-on-launch"></label>
            <span>Launch Lapsey on system startup</span>
          </li>
          <li className="checkbox">
            <input
              type="checkbox"
              id="user-notifications"
              name="userNotifications"
            />
            <label htmlFor="user-notifications"></label>
            <span>Notifications (when timelapse finishes)</span>
          </li>
        </ul>
      </div>

      {/* Move styles from app.css */}
      <style jsx>{`
        .test {
          color: white;
        }
      `}</style>
    </>
  );
};

export default Settings;