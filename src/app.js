import React, { Component } from "react";
import Settings from "./components/settings";
class App extends Component {
  render() {
    return (
      <div className="testing">
        <Settings />

        <style jsx>{`
          .testing {
            color: white;
          }
        `}</style>
      </div>
    );
  }
}
export default App;