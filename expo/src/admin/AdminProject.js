import React, { Component } from "react";
import axiosRequest from "Backend.js";

import CreateProjectModal from "admin/CreateProjectModal";
import EditProjectModal from "admin/EditProjectModal";
import WarningModal from "admin/WarningModal";
import Card from "components/Card";

import "Admin.css";
import "App.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SmallerParentheses from "components/SmallerParentheses.js";

import { library } from "@fortawesome/fontawesome-svg-core";
import { faSquare } from "@fortawesome/free-regular-svg-icons";
import {
  faCaretDown,
  faCaretUp,
  faCheckSquare,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";
library.add(faUpload);
library.add(faCaretDown);
library.add(faCaretUp);
library.add(faCheckSquare);
library.add(faSquare);

/* Project panel of admin page */
class ProjectModule extends Component {
  constructor(props) {
    super(props);
    this.state = {
      textSearch: "",
      projectIndexToEdit: -1,
      uploadStatus: "",
      projectsCSV: "",
      tableAssignmentStatus: "",
      tableAssignmentSchema: "",
      tableStartLetter: "",
      tableStartNumber: 0,
      tableEndLetter: "",
      tableEndNumber: 0,
      skipEveryOtherTable: true,
      viewable: true,
    };
  }

  createChallengesToCompanyMap(challenges_obj) {
    const allChallengesMapping = {};
    for (let company in challenges_obj) {
      challenges_obj[company].forEach((challenge) => {
        allChallengesMapping[challenge] = company;
      });
    }
    return allChallengesMapping;
  }

  createAllChallenges(obj) {
    let allChallenges = [];
    for (let key in obj) {
      obj[key].forEach((item) => {
        if (allChallenges.indexOf(item) === -1) {
          allChallenges.push(item);
        }
      });
    }
    allChallenges.sort();
    return allChallenges;
  }

  sortData() {
    let data = this.props.projects;
    let finalProjectsData = [];

    data.forEach((obj) => {
      let challenge = [];
      obj.challenges.forEach((item) => {
        challenge.push(item.challenge_name);
      });
      finalProjectsData.push({
        project_id: obj.project_id,
        project_name: obj.project_name,
        table_number: obj.table_number,
        url: obj.project_url,
        challenges: challenge,
        company_challenge: obj.challenges,
      });
    });
    return finalProjectsData;
  }

  onUploadCSVSubmitForm(e) {
    e.preventDefault();

    const data = new FormData();
    data.append("projects_csv", this.state.projects_csv.files[0]);

    if (this.projects_csv.files[0] === null) {
      this.setState({
        uploadStatus: "Please select a file before hitting upload!",
      });
    } else {
      axiosRequest
        .post("parse_csv", data)
        .then((response) => {
          this.setState({
            // Flash success message and clear input display
            uploadStatus: response.data,
            projectsCSV: "",
          });
          this.props.loadProjects();
        })
        .catch((error) => {
          this.setState({
            // Flash error message
            uploadStatus: "Oops! Something went wrong...",
          });
        });
    }
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value,
    });
  }

  onAutoAssignTableNumbers(e) {
    e.preventDefault();
    if (this.state.tableAssignmentSchema === "") {
      this.setState({
        tableAssignmentStatus:
          "Please first select a schema for assigning table numbers.",
      });
      return;
    }
    this.setState({
      tableAssignmentStatus:
        "Processing your request to assign table numbers...",
    });
    axiosRequest
      .post("api/projects/assign_tables", {
        table_assignment_schema: this.state.tableAssignmentSchema,
        table_start_letter: this.state.tableStartLetter,
        table_start_number: parseInt(this.state.tableStartNumber, 10),
        table_end_letter: this.state.tableEndLetter,
        table_end_number: parseInt(this.state.tableEndNumber, 10),
        skip_every_other_table: this.state.skipEveryOtherTable,
      })
      .then((data) => {
        this.setState({
          // Flash success message
          tableAssignmentStatus: data,
          tableAssignmentSchema: "",
          tableStartLetter: "",
          tableStartNumber: 0,
          tableEndLetter: "",
          tableEndNumber: 0,
          skipEveryOtherTable: true,
        });
        this.props.loadProjects();
      })
      .catch((error) => {
        this.setState({
          // Flash error message
          tableAssignmentStatus: "Oops! Something went wrong...",
        });
      });
  }

  onRemoveAllTableAssignments(e) {
    e.preventDefault();
    if (
      window.confirm(
        "Are you sure you want to remove ALL table assignments from your database?"
      )
    ) {
      this.setState({
        tableAssignmentStatus:
          "Processing your request to remove table assignments...",
      });
      axiosRequest
        .post("api/projects/clear_table_assignments")
        .then((data) => {
          this.setState({
            // Flash success message
            tableAssignmentStatus: data,
          });
          this.props.loadProjects();
        })
        .catch((error) => {
          this.setState({
            // Flash error message
            tableAssignmentStatus: "Oops! Something went wrong...",
          });
        });
    }
  }

  deleteAllProjects() {
    if (
      window.confirm(
        "Are you sure you want to remove ALL projects from your database?"
      )
    ) {
      if (window.confirm("This action is not reversable.")) {
        axiosRequest.delete("api/projects/deleteAll").then(() => {
          this.props.loadProjects();
        });
      }
    }
  }

  toggleView() {
    if (this.state.viewable) {
      this.setState({
        viewable: false,
      });
      document.getElementById("project-content").style.display = "none";
    } else {
      this.setState({
        viewable: true,
      });
      document.getElementById("project-content").style.display = "block";
    }
  }

  render() {
    let filteredProjects = this.sortData();
    let allChallenges = this.createAllChallenges(this.props.challenges);
    let challengesToCompanyMap = this.createChallengesToCompanyMap(
      this.props.challenges
    );
    if (this.state.textSearch !== "" && this.state.textSearch !== undefined) {
      filteredProjects = filteredProjects.filter((elt) => {
        const upperCaseTextSearch = this.state.textSearch.toUpperCase();
        return (
          elt.project_name.toUpperCase().includes(upperCaseTextSearch) ||
          elt.table_number.toUpperCase().includes(upperCaseTextSearch)
        );
      });
    }
    let editProjectModal;

    if (this.state.projectIndexToEdit >= 0) {
      const index = this.state.projectIndexToEdit;
      const elt = filteredProjects[index];

      editProjectModal = (
        <EditProjectModal
          index={index}
          key={"editProjectModal" + index}
          id={"modalEditProject" + index.toString()}
          projectID={elt.project_id}
          project_name={elt.project_name}
          project_table={elt.table_number}
          url={elt.url}
          challenges={elt.challenges}
          toggle={elt.checkVal}
          allChallenges={allChallenges}
          company_map={challengesToCompanyMap}
          onEdit={this.props.loadProjects}
        />
      );
    }

    return (
      <Card
        title="Projects"
        action={() => {
          this.toggleView();
        }}
        actionName={!this.state.viewable ? "Show" : "Hide"}
      >
        <div className="card-body" id="project-content">
          <h5>Seed Database</h5>
          <form
            method="post"
            encType="multipart/form-data"
            onSubmit={this.onUploadCSVSubmitForm.bind(this)}
          >
            <div className="form-group">
              <label>Upload Devpost CSV for parsing</label>
              <br />
              <div className="upload-btn-wrapper">
                <button className="button button-primary font-weight-normal m-r-m">
                  <FontAwesomeIcon
                    icon="upload"
                    className="upload_icon"
                  ></FontAwesomeIcon>
                  Choose a file
                </button>
                <input
                  type="file"
                  id="file"
                  name="projectsCSV"
                  onChange={this.handleInputChange.bind(this)}
                  ref={(ref) => {
                    this.projects_csv = ref;
                  }}
                />
                {this.state.projectsCSV.replace("C:\\fakepath\\", "")}
              </div>
            </div>
            <button className="button button-primary" type="submit">
              Upload
            </button>
            {this.state.uploadStatus !== "" && (
              <div className="row col" style={{ "padding-top": "1rem" }}>
                <i>{this.state.uploadStatus}</i>
              </div>
            )}
          </form>

          <br />
          <br />

          <h5>Auto Assign Table Numbers</h5>
          <form
            method="post"
            onSubmit={this.onAutoAssignTableNumbers.bind(this)}
          >
            <div onChange={this.handleInputChange.bind(this)} className="m-b-m">
              <div>
                <input
                  type="radio"
                  name="tableAssignmentSchema"
                  value="numeric"
                  checked={this.state.tableAssignmentSchema === "numeric"}
                />{" "}
                Numeric (1, 2, 3...)
              </div>
              <div>
                <input
                  type="radio"
                  name="tableAssignmentSchema"
                  value="odds"
                  checked={this.state.tableAssignmentSchema === "odds"}
                />{" "}
                Odds (1, 3, 5...)
              </div>
              <div>
                <input
                  type="radio"
                  name="tableAssignmentSchema"
                  value="evens"
                  checked={this.state.tableAssignmentSchema === "evens"}
                />{" "}
                Evens (2, 4, 6...)
              </div>
              <div>
                <input
                  type="radio"
                  name="tableAssignmentSchema"
                  value="custom"
                  checked={this.state.tableAssignmentSchema === "custom"}
                />{" "}
                Custom
              </div>
            </div>
            {this.state.tableAssignmentSchema === "custom" && (
              <div className="m-b-m">
                <p>
                  Enter the starting and ending/maximum alphanumeric
                  combinations (e.g. A1 to Z15).
                </p>
                <div className="form-group custom-table-assignment-container">
                  <input
                    type="text"
                    name="tableStartLetter"
                    className="form-control custom-table-assignment-child"
                    placeholder="ex: A"
                    onChange={this.handleInputChange.bind(this)}
                  />
                  <input
                    type="number"
                    name="tableStartNumber"
                    className="form-control custom-table-assignment-child"
                    placeholder="ex: 1"
                    onChange={this.handleInputChange.bind(this)}
                  />
                  to
                  <input
                    type="text"
                    name="tableEndLetter"
                    className="form-control custom-table-assignment-child"
                    placeholder="ex: Z"
                    onChange={this.handleInputChange.bind(this)}
                  />
                  <input
                    type="number"
                    name="tableEndNumber"
                    className="form-control custom-table-assignment-child"
                    placeholder="ex: 15"
                    onChange={this.handleInputChange.bind(this)}
                  />
                </div>
                <input
                  name="skipEveryOtherTable"
                  type="checkbox"
                  checked={this.state.skipEveryOtherTable}
                  onChange={this.handleInputChange.bind(this)}
                />{" "}
                Skip every other table? (Provides more spacious expo)
              </div>
            )}
            <button
              type="submit"
              className="button button-primary m-r-m assign_button1"
            >
              Assign Tables
            </button>
            <button
              className="button button-warning assign_button2"
              onClick={this.onRemoveAllTableAssignments.bind(this)}
            >
              Remove All Table Assignments
            </button>
            {this.state.tableAssignmentStatus !== "" && (
              <div className="row col" style={{ "padding-top": "1rem" }}>
                <i>{this.state.tableAssignmentStatus}</i>
              </div>
            )}
          </form>

          <br />
          <br />

          <h5>
            Projects{" "}
            <SmallerParentheses fontSize="15px">
              {filteredProjects.length}
            </SmallerParentheses>
          </h5>
          <CreateProjectModal
            id="modalCreateProject"
            onCreate={this.props.loadProjects}
            allChallenges={allChallenges}
            company_map={challengesToCompanyMap}
          />
          <button
            className="button button-primary m-r-m m-b-m"
            type="button"
            data-toggle="modal"
            data-target="#modalCreateProject"
          >
            Create New Project
          </button>
          <button
            className="button button-warning m-b-m"
            type="button"
            data-toggle="modal"
            data-target="#projectWipeWarningModal"
          >
            Delete ALL Projects
          </button>
          <WarningModal
            modalId="projectWipeWarningModal"
            collection="Projects"
            onDelete={this.deleteAllProjects.bind(this)}
          />
          <div className="form-group">
            <input
              type="text"
              id="txtProjectSearch"
              className="form-control"
              placeholder="Search for a project name..."
              onChange={(event) =>
                this.setState({ textSearch: event.target.value })
              }
            />
          </div>
          <div className="row m-b-m">
            <h6 className="col grow-5">Project</h6>
            <h6 className="col">Table</h6>
            <div className="col" />
          </div>
          {filteredProjects.map((elt, index) => {
            return (
              <div
                className="row m-b-m"
                key={index}
                id={`project-${elt.project_id}`}
              >
                <div className="col grow-5 break-word">{elt.project_name}</div>
                <div className="col">{elt.table_number}</div>
                <div className="col">
                  <button
                    className="link-button"
                    id={`editProject${index.toString()}Btn`}
                    type="button"
                    data-toggle="modal"
                    data-target={"#modalEditProject" + index.toString()}
                    onMouseOver={() => {
                      this.setState({
                        projectIndexToEdit: index,
                      });
                    }}
                  >
                    Edit
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        {editProjectModal}
      </Card>
    );
  }
}

export default ProjectModule;
