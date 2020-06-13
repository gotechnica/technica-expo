import React, { Component, Fragment } from "react";
import axiosRequest from "Backend.js";

import { VotingTable, WelcomeHeader } from "Sponsor.js";
import Table from "Table.js";
import SmallerParentheses from "components/SmallerParentheses.js";

import "components/Card.css";
import "SliderOption.css";
import { useWindowWidth, sortByTableNumber } from "./helpers";

// This is a wrapper for the old SearchandFilter component. It's a beast that should be broken up and done with hooks.
// Doing that all at once is hard, hence this wrapper.
export default function SearchandFilter(props) {
  const width = useWindowWidth();

  return <SearchandFilterInner {...props} width={width} />;
}

class SearchandFilterInner extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoadingData: true,
      data: [],
      value: "",
      textSearch: "",
      toggle_off: true,
      challenges: {},
      workingdata: [],
      winnersRevealed: false,
      expoIsPublished: false,
      expoLength: 0,
      totalCount: 0,
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
    this.setSponsorWorkingData = this.setSponsorWorkingData.bind(this);
    this.makeVotingData = this.makeVotingData.bind(this);
  }

  componentDidMount() {
    let getAllProjectsUrl = "api/projects";
    if (this.props.origin !== "home") {
      // If not on public page
      getAllProjectsUrl = "api/projects_and_winners";
    }

    axiosRequest.get(getAllProjectsUrl).then((project_data) => {
      axiosRequest.get("api/challenges").then((challenge_data) => {
        // Check first project element and see if table numbers consist of both alpha and numeric portions
        const tableNumbersAreOnlyNumeric =
          project_data["projects"].length > 0 &&
          /^[0-9]+$/.test(project_data["projects"][0]["table_number"]);
        this.setState(
          {
            data: sortByTableNumber(
              project_data["projects"],
              !tableNumbersAreOnlyNumeric
            ),
            challenges: challenge_data,
            workingdata: this.setSponsorWorkingData(
              project_data["projects"],
              challenge_data
            ),
            isLoadingData: false,
          },
          () => {
            this.setState({
              totalCount: this.state.workingdata.length,
            });
          }
        );
      });
      this.setState({
        winnersRevealed: project_data["publish_winners"],
        expoIsPublished: project_data["is_published"],
      });
    });

    axiosRequest.get("api/expo_length").then((length) => {
      this.setState({
        expoLength: parseInt(length),
      });
    });
  }

  applyFilters() {
    let updatedList = this.state.data;
    updatedList = updatedList.filter((item) => {
      // Check text filter
      let matchesTextFilter =
        this.state.textSearch === undefined ||
        this.state.textSearch === "" ||
        item.project_name
          .toUpperCase()
          .includes(this.state.textSearch.toUpperCase());

      // Check challenge filter
      let matchesChallengeFilter =
        this.state.value === undefined ||
        this.state.value === "" ||
        this.state.value === "All Challenges" ||
        item.challenges.reduce((acc, chal) => {
          if (chal.challenge_name === this.state.value) {
            return true;
          } else {
            return acc;
          }
        }, false);

      return matchesTextFilter && matchesChallengeFilter;
    });
    this.setState({
      workingdata: updatedList,
    });
  }

  handleChange(e) {
    if (e.target.name === "input") {
      let searchVal = e.target.value;
      this.setState(
        {
          textSearch: searchVal,
        },
        () => this.applyFilters()
      );
    } else if (e.target.name === "selectChallenges") {
      let val = e.target.value.split(" - ")[0];
      this.setState(
        {
          value: val,
        },
        () => this.applyFilters()
      );
    }
  }

  createChallengeArray() {
    let challenges = [];
    Object.keys(this.state.challenges).forEach((company) => {
      this.state.challenges[company].forEach((challenge) => {
        if (challenges.indexOf(challenge) === -1) {
          challenges.push(challenge + " - " + company);
        }
      });
    });
    challenges = challenges.sort(function (a, b) {
      if (a < b) return -1;
      else if (a > b) return 1;
      return 0;
    });
    return challenges;
  }

  createChallengeSponsorArray(challenge_data) {
    let challenges = [];
    if (this.props.loggedIn !== undefined) {
      if (challenge_data[this.props.loggedIn] !== undefined) {
        challenges = challenge_data[this.props.loggedIn];
        challenges = challenges.sort(function (a, b) {
          if (a < b) return -1;
          else if (a > b) return 1;
          return 0;
        });
      }
    }
    return challenges;
  }

  setSponsorWorkingData(projects, challenges) {
    if (this.props.origin === "sponsor") {
      let firstChallenge = this.createChallengeSponsorArray(challenges)[0];
      let initialData = [];

      projects.forEach((obj) => {
        obj.challenges.forEach((item) => {
          if (
            item.company === this.props.loggedIn &&
            item.challenge_name === firstChallenge
          ) {
            initialData.push(obj);
          }
        });
      });
      this.setState({ value: firstChallenge });
      return initialData;
    } else {
      return projects;
    }
  }

  makeVotingData(challenges) {
    if (this.props.origin === "sponsor") {
      let voting_data = {};
      this.state.data.forEach((obj) => {
        let temp = {};
        obj.challenges.forEach((item) => {
          if (item.company === this.props.loggedIn) {
            if (challenges.indexOf(item.challenge_name) !== -1) {
              temp[item.challenge_name] = false;
            }
          }
        });
        if (Object.keys(temp).length !== 0) {
          voting_data[obj.project_id] = {
            checked: temp,
            project_name: obj.project_name,
          };
        }
      });
      return voting_data;
    }
  }

  handleToggle() {
    this.setState({
      toggle_off: !this.state.toggle_off,
    });
  }

  render() {
    let challenge_array = this.createChallengeArray().map((obj, index) => {
      return <option key={index}>{obj}</option>;
    });
    let challenge_sponsor_array = this.createChallengeSponsorArray(
      this.state.challenges
    ).map((obj, index) => {
      return <option key={index}>{obj}</option>;
    });

    let select = (
      <select
        className="form-control"
        id="challenges"
        onChange={this.handleChange}
        name="selectChallenges"
      >
        {this.props.origin === "home" ? (
          <Fragment>
            <option>All Challenges</option>
            {challenge_array}
          </Fragment>
        ) : (
          challenge_sponsor_array
        )}
      </select>
    );

    let sponsor_challenges = this.createChallengeSponsorArray(
      this.state.challenges
    );
    let voting_data = {};
    let project_hash = {};
    if (this.props.origin === "sponsor") {
      voting_data = this.makeVotingData(sponsor_challenges);
      Object.keys(voting_data).forEach((project_id) => {
        project_hash[project_id] = voting_data[project_id].project_name;
      });
    }

    let table =
      this.props.origin === "home" ? (
        <div id="Home">
          <Table
            isLoadingData={this.state.isLoadingData}
            projects={this.state.workingdata}
            value={this.state.value}
            show_attempted_challenges={this.state.toggle_off}
            headers={["Project Information"]}
            origin={this.props.origin}
            winnersRevealed={this.state.winnersRevealed}
            expoIsPublished={this.state.expoIsPublished}
          />
        </div>
      ) : (
        <VotingTable
          company={this.props.loggedIn}
          company_id={this.props.company_id}
          isLoadingData={this.state.isLoadingData}
          projects={this.state.workingdata}
          voting_data={voting_data}
          sponsor_data={this.props.sponsor_data}
          value={this.state.value}
          origin={this.props.origin}
          after_submission_handler={this.props.after_submission_handler}
          expoIsPublished={this.state.expoIsPublished}
        />
      );
    let welcome_header =
      this.props.origin === "sponsor" ? (
        <WelcomeHeader
          company={this.props.loggedIn}
          sponsor_data={this.props.sponsor_data}
          project_hash={project_hash}
          logout={this.props.logout}
        />
      ) : null;

    // This should optimally be in there, but the component had some bugs. Uncomment when it's usable again
    /*let judging_times = (this.props.origin === "sponsor" ?
      <div className="row">
        <div className="col">
          <JudgingTimes count={this.state.totalCount} time={this.state.expoLength} />
        </div>
      </div> : null);*/
    let judging_times = null;

    let toggle_style =
      this.props.origin === "home"
        ? {
            display: "inline-block",
            textAlign: "left",
            marginTop: "10px",
            border: "0px solid",
            height: "30px",
            outline: "none",
          }
        : {
            display: "none",
          };
    let style = this.props.width < 460 ? "center" : "left";

    return (
      <div>
        {welcome_header}
        {judging_times}
        <div className="card">
          {this.props.origin === "sponsor" ? (
            <div className="card-header">
              <h5>
                Select Your Challenge Winner
                <SmallerParentheses fontSize="15px">s</SmallerParentheses>
              </h5>
            </div>
          ) : (
            <div style={{ marginTop: "15px" }}></div>
          )}
          <div className="card-body">
            <form>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Filter projects by name"
                  className="form-control"
                  onChange={(event) => {
                    this.setState({
                      textSearch: event.target.value,
                    });
                    this.handleChange(event);
                  }}
                  name="input"
                />
              </div>
              <div className="form-row">
                <div style={{ margin: "0px 5px", width: "100%" }}>
                  <div style={{ marginBottom: "5px" }}>Filter by challenge</div>
                  {select}
                </div>
              </div>
              {/* Show Attempted Challenge Toggle */}
              {this.props.origin === "sponsor" ? null : (
                <Fragment>
                  <div style={{ textAlign: style }}>
                    <div className="btn-group">
                      <button
                        className="toggle-btn"
                        style={toggle_style}
                        disabled
                      >
                        <div className="toggle" onChange={this.handleToggle}>
                          <label className="switch">
                            {this.state.toggle_off ? (
                              <input type="checkbox" />
                            ) : (
                              <input type="checkbox" checked />
                            )}
                            <div className="slider round"></div>
                          </label>
                        </div>
                      </button>
                      {this.props.width >= 427 ? (
                        <button
                          disabled
                          className="toggle-label"
                          style={{
                            textAlign: "left",
                            border: "0px solid",
                            outline: "none",
                            color: "white",
                            marginTop: "10px",
                            marginLeft: "-7px",
                          }}
                        >
                          Show Attempted Challenges
                        </button>
                      ) : null}
                    </div>
                  </div>

                  {this.props.width < 427 ? (
                    <div style={{ textAlign: "center" }}>
                      <button
                        className="toggle-label"
                        style={{
                          textAlign: "center",
                          border: "0px solid",
                          outline: "none",
                          color: "white",
                          marginTop: "0px",
                        }}
                        disabled
                      >
                        Show Attempted Challenges
                      </button>
                    </div>
                  ) : null}
                </Fragment>
              )}
            </form>
            {this.props.origin === "sponsor" ? table : null}
          </div>
        </div>
        {this.props.origin === "home" ? (
          <div className="row">
            <div className="col">
              <div className="card">
                <div className="card-body">{table}</div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
  }
}
