import "react-calendar/dist/Calendar.css";
import ReactDOM from "react-dom/client";
import React from "react";

import MyApp from "./MyApp.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <MyApp />
  </React.StrictMode>
);
