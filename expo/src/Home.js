import React from "react";

import SearchandFilter from "SearchandFilter";
import SiteWrapper from "SiteWrapper.js";

import "App.css";

export default function Home() {
  return SiteWrapper(
    <div className="Home">
      <div className="row">
        <div className="col">
          <SearchandFilter origin="home" />
        </div>
      </div>
    </div>
  );
}
