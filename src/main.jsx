import "react-calendar/dist/Calendar.css";
import ReactDOM from "react-dom/client";
import React from "react";

import { Wrapper } from "./components/Wrapper.jsx";
import { Example } from "./Example.jsx";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Wrapper>
      <App />
    </Wrapper>
    {/* <Example></Example> */}
  </React.StrictMode>
);
