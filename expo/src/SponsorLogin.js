import React, { useState } from "react";
import axiosRequest from "Backend.js";

import Error from "Error.js";
import Login from "Login.js";
import SiteWrapper from "SiteWrapper.js";
import customize from "customize/customize";

import "App.css";

const errorText =
  "Invalid login code! Please see a member of the " +
  customize.hackathon_name +
  " staff if you don't know your access " +
  "code or are having trouble logging in.";
const InvalidErr = <Error text={errorText} />;

export default function SponsorLogin(props) {
  const [error, setError] = useState("");

  const onLogin = accessCode => {
    const codeExists = accessCode !== undefined && accessCode !== "";

    if (codeExists) {
      axiosRequest
        .post("api/login/sponsor", { access_code: accessCode })
        .then(data => {
          if (data.includes("Logged in")) {
            setError("");

            props.history.push({
              pathname: "/sponsor"
            });
          } else {
            setError(InvalidErr);
          }
        })
        .catch(error => {
          console.log(error);
        });
    } else {
      setError(InvalidErr);
    }
  };

  return SiteWrapper(
    <div className="SponsorLogin">
      <Login title="Sponsor Login" onLogin={onLogin} error={error} />
    </div>
  );
}
