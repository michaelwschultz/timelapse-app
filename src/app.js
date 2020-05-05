import React, { Component, useState } from "react";
import Settings from "./components/settings";
import ControlBar from "./components/controlBar";
import ControlPanel from "./components/controlPanel";
class App extends Component {
  render() {
    // still need to hook this up...
    // should probably happen in control panel; rather than here
    const [panelOpen, setPanelOpen] = useState(false);

    return (
      <div>
        <ControlBar />
        <ControlPanel panelOpen={panelOpen} setPanelOpen={setPanelOpen}>
          <Settings />
        </ControlPanel>
      </div>
    );
  }
}
export default App;