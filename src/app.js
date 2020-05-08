import React from "react";
import Settings from "./components/settings";
import ControlPanel from "./components/controlPanel";
import Camera from "./components/camera";

const App = () => {
  return (
    <div>
      <ControlPanel>
        <Settings />
      </ControlPanel>
      <Camera />
    </div>
  );
}
export default App;