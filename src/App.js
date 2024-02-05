import React from "react";

import "./App.css";
import { HashRouter } from "react-router-dom";
import Router from "./router";
import NavigationBar from "./shared/components/navigation-bar";
import Container from "@material-ui/core/Container";



function App() {
	
	
  return (
    <HashRouter>
      <NavigationBar />
      <Container style={{'margin-right':'5rem'}}>
        <Router />
      </Container>
    </HashRouter>
  );
}

export default App;
