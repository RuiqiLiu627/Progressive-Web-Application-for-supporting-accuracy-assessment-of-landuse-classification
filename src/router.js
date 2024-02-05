import React from "react";
import Sheet from "./pages/Sheet/index";
import Geoserver from "./pages/Geoserver/index";
import LandingPage from "./pages/Map/index";
import { Route, Routes } from "react-router";
import { useRoutes } from "react-router-dom";

/*Routes is used to be Switch*/
const Router = () => {
  /* nesting routes*/
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/sheet" element={<Sheet />} />
      <Route path="/geoserver" element={<Geoserver />} />
      
    </Routes>
  );


};
export default Router;
