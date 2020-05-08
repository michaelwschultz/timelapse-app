import React from "react";
import Settings from "./components/settings";
import ControlPanel from "./components/controlPanel";

const App = () => {
  return (
    <div>
      <ControlPanel>
        <Settings />
      </ControlPanel>
    </div>
  );
}
export default App;