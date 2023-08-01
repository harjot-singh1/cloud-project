import React from "react";
import { BrowserRouter as Router, Switch, Link, Routes, Route } from "react-router-dom";
import UploadDetails from "./views/uploadDetails";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<UploadDetails />} />
      </Routes>
    </Router>
  );
}

export default App;
