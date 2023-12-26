import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Signup from "./pages/signup/Signup";
import Login from "./pages/login/Login";
import Home from "./pages/home/Home";
import Organization from "./pages/organization/Organization";

function PrivateRouteWrapper({ children }) {
  const token = localStorage.getItem("access_token");
  return token ? children : <Navigate to="/login" />;
}

function PublicRouteWrapper({ children }) {
  const token = localStorage.getItem("access_token");
  return token ? <Navigate to="/" /> : children;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route
          exact
          path="/"
          element={
            <PrivateRouteWrapper>
              <Home />
            </PrivateRouteWrapper>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRouteWrapper>
              <Signup />
            </PublicRouteWrapper>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRouteWrapper>
              <Login />
            </PublicRouteWrapper>
          }
        />
        <Route
          path="/organization/:org_name"
          element={
            <PrivateRouteWrapper>
              <Organization />
            </PrivateRouteWrapper>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
