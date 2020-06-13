import React from "react";
import { Link } from "react-router-dom";
import hackathon_logo from "customize/imgs/hackathon-logo.svg";
import "SiteWrapper.css";

/* Header / constant app features */

let SiteWrapper = (content) => (
  <div className="App">
    <nav className="navbar navbar-expand-md">
      <Link to="/">
        <img className="logo" src={hackathon_logo} alt="Logo" />
      </Link>
    </nav>
    <div className="container">{content}</div>
  </div>
);

export default SiteWrapper;
