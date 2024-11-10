import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"; // Use Routes instead of Switch
import Home from "./components/Home";
import Login from "./components/Login";
import Favorite from "./components/Favorite";
import WithoutHome from "./components/WithoutHome";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WithoutHome />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/favorites" element={<Favorite />} />
      </Routes>
    </Router>
  );
};

export default App;
