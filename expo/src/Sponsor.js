import React, { Component, Fragment, useState, useEffect } from "react";
import axiosRequest from "Backend.js";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Error from "Error.js";
import SearchandFilter from "SearchandFilter.js";
import SiteWrapper from "SiteWrapper.js";
import Table from "Table.js";
import customize from "customize/customize";

import "App.css";
import "Sponsor.css";
import "CircleCheck.css";

import { faCircle } from "@fortawesome/free-regular-svg-icons";
import { faCircle as faCircleSolid } from "@fortawesome/free-solid-svg-icons";
import {
  faCheck,
  faExclamationTriangle,
  faTimesCircle,
  faClipboardList,
} from "@fortawesome/free-solid-svg-icons";
import { library } from "@fortawesome/fontawesome-svg-core";

library.add(faTimesCircle);
library.add(faCircle);
library.add(faCheck);
library.add(faExclamationTriangle);
library.add(faClipboardList);
library.add(faCircle, faCircleSolid);

// TODO: Replace with `components/GenericConfirmationModal`?
function WinnersSubmmitedModal() {
  return (
    <div
      className="modal fade bd-example-modal-sm"
      id="winnersSubmmitedModal"
      tabindex="-1"
      role="dialog"
      aria-labelledby="mySmallModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-sm modal-dialog-centered">
        <div className="modal-content" style={{ border: "0px solid" }}>
          <div className="modal-header" style={{ border: "0px solid" }}>
            <button
              type="button"
              class="close"
              data-dismiss="modal"
              aria-label="Close"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div
            className="modal-body"
            style={{
              color: "white",
              textAlign: "center",
              marginTop: "-40px",
            }}
          >
            <svg
              class="checkmark"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 52 52"
            >
              <circle
                class="checkmark__circle"
                cx="26"
                cy="26"
                r="25"
                fill="none"
              />
              <path
                class="checkmark__check"
                fill="none"
                d="M14.1 27.2l7.1 7.2 16.7-16.8"
              />
            </svg>
            <h3 style={{ padding: "0px 10px" }}>
              Thanks for submitting your winners!
            </h3>
          </div>
          <div
            class="modal-footer"
            style={{ border: "0px solid", paddingTop: "0px" }}
          >
            <button className="button button-primary" data-dismiss="modal">
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SubmitModal(props) {
  let vote_limit = props.vote_limit;
  let votes = [];
  props.votes.forEach((project) => {
    votes.push(<li>{project}</li>);
  });
  let modal = {
    error: {
      icon: faTimesCircle,
      iconstyle: "fa-times-circle",
      message: (
        <Fragment>
          Oops! Too many projects are selected to win this challenge.&nbsp; Our
          records show that you only intended to provide prizes for {vote_limit}{" "}
          project{vote_limit > 1 ? "s" : ""}.&nbsp; Come chat with someone on
          the {customize.hackathon_name} team if you want to select more!
        </Fragment>
      ),
    },
    warning: {
      icon: faExclamationTriangle,
      iconstyle: "fa-exclamation-triangle",
      message: (
        <Fragment>
          Just a heads up! Our records show that you originally intended to
          provide prizes to {vote_limit} project{vote_limit > 1 ? "s" : ""} for
          this challenge, but
          {votes.length === 0 ? " none " : ` only ${votes.length} `}
          {votes.length === 1 ? " was " : " were "} selected.
        </Fragment>
      ),
    },
  };

  return (
    <Fragment>
      <div
        class="modal fade"
        id="submitModal"
        tabindex="-1"
        role="dialog"
        aria-labelledby="exampleModalCenterTitle"
        aria-hidden="true"
      >
        <div class="modal-dialog modal-dialog-centered" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="exampleModalCenterTitle">
                Confirm Winner Selection
              </h5>
              <button
                type="button"
                class="close"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
              {votes.length !== vote_limit ? (
                votes.length > vote_limit ? (
                  <Error
                    icon={modal.error.icon}
                    iconstyle={modal.error.iconstyle}
                  >
                    {modal.error.message}
                  </Error>
                ) : (
                  <Error
                    icon={modal.warning.icon}
                    iconstyle={modal.warning.iconstyle}
                  >
                    {modal.warning.message}
                  </Error>
                )
              ) : null}
              <Error
                icon={modal.warning.icon}
                iconstyle={modal.warning.iconstyle}
                text="All submitted selections are final."
              />
              <h5 className="modal-challenge">
                {props.value + " Winner" + (votes.length > 1 ? "s" : "")}
              </h5>
              <ul className="selection-list">
                {votes.length > 0 ? votes : <li>No Projects Selected</li>}
              </ul>
            </div>
            <div class="modal-footer">
              <button className="button button-secondary" data-dismiss="modal">
                Cancel
              </button>
              {votes.length > vote_limit ? (
                <button className="button button-primary" disabled>
                  Submit
                </button>
              ) : (
                <button
                  className="button button-primary"
                  data-toggle="modal"
                  data-target="#winnersSubmmitedModal"
                  data-dismiss="modal"
                  onClick={() => {
                    props.submit_handler(
                      props.company_id,
                      props.challenge_id,
                      props.value,
                      props.after_submission_handler
                    );
                  }}
                >
                  Submit
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <WinnersSubmmitedModal />
    </Fragment>
  );
}

function Task(props) {
  let winners = [];
  if (props.winners.length > 0) {
    props.winners.forEach((project_id) => {
      winners.push(<li>{props.project_hash[project_id]}</li>);
    });
  }
  let circle = props.submitted ? faCheck : faClipboardList;

  return (
    <Fragment>
      <div className="btn-group task" role="group">
        <button className="task-icon">
          <FontAwesomeIcon icon={circle} className="fa-circle" />
        </button>
        {props.submitted ? (
          <button className="task-title">{props.challenge}</button>
        ) : (
          <button className="task-title">
            Select your winner{props.winners > 1 ? "s" : ""} for{" "}
            {props.challenge}
          </button>
        )}
      </div>
      {winners.length > 0 ? (
        <ul
          className="selection-list"
          style={{ marginLeft: "50px", marginBottom: "0px" }}
        >
          {winners}
        </ul>
      ) : null}
    </Fragment>
  );
}

/* this.props.voting_data =
   { PROJECT_ID:
    checked: {
      CHALLENGE_NAME_1 : false,
      CHALLENGE_NAME_2 : false,
      ...
    },
    project_name: PROJECT_NAME
    ...
  }
*/

export function VotingTable(props) {
  const [checked, setChecked] = useState({});
  const [challenges, setChallenges] = useState({});

  useEffect(() => {
    if (Object.keys(checked).length === 0) {
      /* Updates voting data for challenges where votes have been submitted */
      let challenge_data = challenges;
      let updated_voting_data = props.voting_data;
      if (Object.keys(updated_voting_data).length > 0) {
        Object.keys(challenge_data).forEach((challenge) => {
          let winners = challenge_data[challenge].winners;
          if (winners.length > 0) {
            winners.forEach((project_id) => {
              updated_voting_data[project_id].checked[challenge] = true;
            });
          }
        });
      }
      /* Force state to update once GET calls and login goes through */
      setChecked(updated_voting_data);
      setChallenges(props.sponsor_data);
    }
  }, [props.voting_data, challenges, checked, props.sponsor_data]);

  function handleSubmitEvent(company_id, challenge_id, challenge_name, update) {
    const checkboxes = document.getElementsByClassName("voting-checkbox");
    let winners = [];
    for (let i = 0; i < checkboxes.length; i++) {
      let ckbx = checkboxes[i];
      if (ckbx.checked) {
        winners.push(ckbx.value);
        let params = {
          company_id: company_id,
          challenge_id: challenge_id,
        };
        let route = "api/projects/id/" + ckbx.value + "/makeWinner";
        axiosRequest
          .post(route, params)
          .then((response) => {
            update(challenge_name, winners);
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      }
    }
  }

  function handleClearEvent() {
    let cleared = checked;
    Object.keys(checked).forEach((key) => {
      cleared[key].checked[props.value] = false;
    });
    setChecked(cleared);
  }

  function handleVoteEvent(project_id) {
    let new_checked = checked;
    new_checked[project_id].checked[props.value] = !new_checked[project_id]
      .checked[props.value];
    setChecked(new_checked);
  }

  return (
    <div style={{ marginTop: "20px" }} id="Sponsor">
      <Table
        headers={["Select", "Table", "Challenges Won", "Project"]}
        company_id={props.company_id}
        isLoadingData={props.isLoadingData}
        projects={props.projects}
        value={props.value}
        checked={checked}
        sponsor_data={challenges}
        vote_handler={handleVoteEvent}
        origin={props.origin}
        clear={handleClearEvent}
        submit={handleSubmitEvent}
        after_submission_handler={props.after_submission_handler}
        expoIsPublished={props.expoIsPublished}
      />
    </div>
  );
}

export function WelcomeHeader(props) {
  let tasks = [];
  let openTasksStillWaiting = false;
  Object.keys(props.sponsor_data).forEach((challenge) => {
    openTasksStillWaiting =
      openTasksStillWaiting || !props.sponsor_data[challenge].votes_submitted;
    tasks.push(
      <Task
        challenge={challenge}
        submitted={props.sponsor_data[challenge].votes_submitted}
        winners={props.sponsor_data[challenge].winners}
        project_hash={props.project_hash}
      />
    );
  });

  return (
    <div className="card">
      <div className="card-header">
        <div className="d-flex">
          <div>
            <h5>Welcome {props.company}!</h5>
          </div>
          <div class="ml-auto">
            <button
              type="button"
              className="link-button"
              onClick={props.logout}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
      <div className="card-body">
        <Fragment>
          <div className="task-header">
            {openTasksStillWaiting ? (
              <p>
                You still have{" "}
                {tasks.length === 1
                  ? "a challenge to select your winner"
                  : "challenges to select winners"}{" "}
                for! Use the challenge selection menu to filter by projects that
                submitted to your specific challenge.
                <br />
                If you want to select a project which did not submit to your
                specific challenge, come chat with someone on the{" "}
                {customize.hackathon_name} team and we'll get that updated for
                you!
              </p>
            ) : (
              <p>
                You've finalized the winners for your{" "}
                {tasks.length === 1 ? "challenge" : "challenges"}. Thanks!
              </p>
            )}
          </div>
          {tasks}
        </Fragment>
      </div>
    </div>
  );
}

export default class Sponsor extends Component {
  constructor(props) {
    super(props);
    this.handleAfterSubmission = this.handleAfterSubmission.bind(this);
    this.state = {
      loggedIn: false,
      loggedInAs: null,
      company_id: null,
      sponsor_data: null,
    };
    axiosRequest
      .get("api/whoami")
      .then((credentials) => {
        if (credentials !== undefined && credentials.user_type === "sponsor") {
          this.setState({
            loggedIn: true,
            loggedInAs: credentials.name,
            company_id: credentials.id,
            sponsor_data: {},
          });
          axiosRequest
            .get("api/v2/companies/current_sponsor")
            .then((company) => {
              let sponsor_challenges = {};
              if (company.company_name === this.state.loggedInAs) {
                Object.keys(company.challenges).forEach((challenge) => {
                  let challenge_obj = company.challenges[challenge];
                  sponsor_challenges[challenge_obj.challenge_name] = {
                    challenge_id: challenge,
                    vote_limit: challenge_obj.num_winners,
                    votes_submitted:
                      challenge_obj.winners.length > 0 ? true : false,
                    winners: challenge_obj.winners,
                  };
                });
                this.setState({
                  sponsor_data: sponsor_challenges,
                });
              }
            });
        } else {
          this.props.history.push({
            pathname: "/sponsorlogin",
          });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  handleAfterSubmission(challenge, winners) {
    if (
      this.state.sponsor_data !== undefined &&
      Object.keys(this.state.sponsor_data).length > 0
    ) {
      let updated_sponsor_data = this.state.sponsor_data;
      updated_sponsor_data[challenge].votes_submitted = true;
      updated_sponsor_data[challenge].winners = winners;
      this.setState({
        sponsor_data: updated_sponsor_data,
      });
    }
  }

  onLogout() {
    axiosRequest
      .post("api/logout")
      .then((data) => {
        this.props.history.push({
          pathname: "/sponsorlogin",
        });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  render() {
    if (this.state.loggedIn) {
      return SiteWrapper(
        <div id="Sponsor">
          <div class="row">
            <div class="col">
              <SearchandFilter
                origin="sponsor"
                loggedIn={this.state.loggedInAs}
                company_id={this.state.company_id}
                after_submission_handler={this.handleAfterSubmission}
                sponsor_data={this.state.sponsor_data}
                logout={this.onLogout.bind(this)}
              />
            </div>
          </div>
        </div>
      );
    } else {
      return SiteWrapper();
    }
  }
}
