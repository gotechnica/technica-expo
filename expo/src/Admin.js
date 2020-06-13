import React, { useState, useEffect } from "react";
import axiosRequest from "Backend.js";

import AdminProject from "admin/AdminProject";
import AdminSponsor from "admin/AdminSponsor";
import AdminWinner from "admin/AdminWinner";

import "Admin.css";
import "App.css";
import { sortByTableNumber } from "helpers.js";

import SiteWrapper from "SiteWrapper.js";

/* Final class containing admin page */
export default function Admin(props) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [projects, setProjects] = useState([]);
  const [challenges, setChallenges] = useState("");

  const loadProjects = () => {
    axiosRequest.get("api/projects_and_winners").then((projectData) => {
      // Check first project element and see if table numbers consist of both alpha and numeric portions
      const tableNumbersAreOnlyNumeric =
        projectData["projects"].length > 0 &&
        /^[0-9]+$/.test(projectData["projects"][0]["table_number"]);
      const projs = sortByTableNumber(
        projectData["projects"],
        !tableNumbersAreOnlyNumeric
      );

      setProjects(projs);
    });
  };

  const loadChallenges = () => {
    axiosRequest.get("api/challenges").then((challengeData) => {
      setChallenges(challengeData);
    });
  };

  const logout = () => {
    // Redirect back to admin login page and end session
    axiosRequest.post("api/logout").then(() => {
      props.history.push("/adminlogin");
    });
  };

  useEffect(() => {
    axiosRequest.get("api/whoami").then((credentials) => {
      if (credentials !== undefined && credentials.user_type === "admin") {
        setLoggedIn(true);
      } else {
        props.history.push({
          pathname: "/adminlogin",
        });
      }
    });
  }, [props]);

  useEffect(() => {
    loadProjects();
    loadChallenges();
  }, []);

  if (loggedIn) {
    return SiteWrapper(
      <div className="row">
        <div className="col">
          <AdminWinner
            projects={projects}
            loadProjects={loadProjects}
            logout={logout}
          />
          <AdminSponsor />
        </div>
        <div className="col">
          <AdminProject
            projects={projects}
            loadProjects={loadProjects}
            loadChallenges={loadChallenges}
            challenges={challenges}
          />
        </div>
      </div>
    );
  } else {
    return SiteWrapper();
  }
}
