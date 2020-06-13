import React, { useState, useEffect } from "react";
import axiosRequest from "Backend.js";

import Error from "Error.js";
import Login from "Login.js";
import SiteWrapper from "SiteWrapper.js";

import "App.css";

const InvalidErr = <Error text="Invalid login code!" />;

export default function AdminLogin(props) {
  const [error, setError] = useState("");

  const onLogin = accessCode => {
    // TODO Validate login code in place
    let codeExists = accessCode !== undefined && accessCode !== "";

    if (codeExists) {
      // Try to set logged in state for admin
      axiosRequest
        .post("api/login/admin", { access_code: accessCode })
        .then(status => {
          if (status === "Logged in as admin") {
            // Log in was successful
            // Clear errors on component
            setError("");

            // Move to admin page
            redirect(props);
          } else {
            // Log in failed, show error
            setError(InvalidErr);
          }
        });
    } else {
      setError(InvalidErr);
    }
  };

  useEffect(() => {
    axiosRequest.get("api/whoami").then(credentials => {
      if (credentials !== undefined && credentials.user_type === "admin") {
        redirect(props);
      }
    });
  }, [props]);

  return SiteWrapper(
    <div className="AdminLogin">
      <Login title="Admin Login" onLogin={onLogin} error={error} />
    </div>
  );
}

function redirect(props) {
  props.history.push({
    pathname: "/admin"
  });
}
