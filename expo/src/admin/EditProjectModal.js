import React, { Component } from "react";
import axiosRequest from "Backend.js";

import Error from "Error";
import Modal from "components/Modal";
import Checkbox from "admin/Checkbox";
import ConfirmationButton from "admin/ConfirmationButton";

import "App.css";

let challengeStore = [];

class EditProjectModal extends Component {
  // Expect the project ID from this.props as projectID
  constructor(props) {
    super(props);
    this.state = {
      project_id: this.props.projectID,
      project_name: this.props.project_name,
      table_number: this.props.project_table,
      project_url: this.props.url,
      challenges: this.props.challenges,
      allChallenges: this.props.allChallenges,
      error: false,
      company_map: this.props.company_map,
      editable: true,
      showConfirmation: false,
    };
  }

  toggleConfirmation = () => {
    this.setState({ showConfirmation: !this.state.showConfirmation });
  };

  saveProject = () => {
    //create challenges to POST
    let challenges = [];
    this.state.challenges.forEach((item) => {
      let object = {};
      if (this.state.company_map[item]) {
        object = {
          challenge_name: item,
          company: this.state.company_map[item],
          won: false,
        };
        challenges.push(object);
      }
    });

    let checks = document.querySelector(".black");
    let missing =
      this.state.project_name === "" ||
      this.state.table_number === "" ||
      this.state.project_url === "";
    // Note: removed requirement to have at least one checked challenge
    // for (let i = 0; i < this.state.challenges.length; i++) {
    //   if (this.state.challenges[i])
    //     check++;
    // }

    this.setState({
      error: missing,
    });

    if (!missing) {
      // TODO: Send access code and company name to db if valid access code
      // TODO: Update state against db change
      // Close modal
      axiosRequest
        .post(`api/projects/id/${this.state.project_id}`, {
          project_name: this.state.project_name,
          project_url: this.state.project_url,
          table_number: this.state.table_number,
          challenges: challenges,
        })
        .then(this.props.onEdit);
      if (checks) {
        this.setState({
          challenges: challengeStore,
        });
      }
      document
        .getElementById("btnCancelEditProjectModal" + this.props.id)
        .click();
    }
  };

  handleChange = (color, index, e) => {
    let lol = index;
    challengeStore = this.state.challenges;

    if (color) {
      let label = document.getElementById(`${lol}label`);
      let word = label.textContent;
      word = word.trim();
      let ind = this.state.challenges.indexOf(word);
      challengeStore.splice(ind, 1);
    } else if (!color) {
      let label = document.getElementById(`${lol}label`);
      let word = label.textContent;
      word = word.trim();
      if (!challengeStore.includes(word) && word.length > 0)
        challengeStore.push(word);
    }
    return challengeStore;
  };

  deleteProject = () => {
    axiosRequest
      .delete(`api/projects/id/${this.state.project_id}`)
      .then((data) => {
        this.props.onEdit();
        // Reset state and close modal
        document
          .getElementById("btnCloseEditProjectModal" + this.props.id)
          .click();
      });
  };

  render = () => {
    return (
      <Modal id={this.props.id}>
        <div className="modal-header">
          <h5 className="modal-title"> Edit Project </h5>
          <button
            type="button"
            className="close"
            id={`btnCloseEditProjectModal${this.props.id}`}
            data-dismiss="modal"
            aria-label="Close"
          >
            <span aria-hidden="true"> &times;</span>
          </button>
        </div>
        <div className="modal-body">
          <form>
            <div className="form-group">
              <label> Project Name </label>
              <input
                className="form-control input"
                type="text"
                value={this.state.project_name.toString()}
                onChange={(event) =>
                  this.setState({
                    project_name: event.target.value,
                  })
                }
              />
            </div>
            <div className="form-group">
              <label> Table Number </label>
              <input
                className="form-control"
                type="text"
                value={this.state.table_number.toString()}
                onChange={(event) =>
                  this.setState({
                    table_number: event.target.value,
                  })
                }
              />
            </div>
            <div className="form-group">
              <label> Project URL </label>
              <input
                className="form-control"
                type="text"
                value={this.state.project_url.toString()}
                onChange={(event) =>
                  this.setState({
                    project_url: event.target.value,
                  })
                }
              />
            </div>
            {this.state.error && (
              <Error text="One or more fields are empty!"></Error>
            )}
            <div className="form-group" id={this.state.project_id}>
              <label> Attempted Challenges </label>
              <br />

              {this.state.allChallenges.map((challenge, index) => {
                if (challenge !== undefined) {
                  return (
                    <Checkbox
                      handleChange={this.handleChange}
                      value={challenge}
                      check={this.state.challenges.indexOf(challenge) >= 0}
                      id={index}
                      project_id={this.state.project_id}
                      edit={this.state.editable}
                    />
                  );
                }
                // do we ever actually hit this?
                return null;
              })}
            </div>
            <br />
          </form>
        </div>
        {this.state.showConfirmation ? (
          <ConfirmationButton
            elementToDelete={this.state.project_name}
            deleteElement={this.deleteProject}
            toggleConfirmation={this.toggleConfirmation}
          />
        ) : (
          <div className="modal-footer flex justify-space-between">
            <div>
              <button
                type="button"
                className="button button-warning float-left"
                onClick={this.toggleConfirmation}
              >
                Delete
              </button>
            </div>
            <div>
              <button
                type="button"
                className="button button-secondary m-r-s"
                onClick={this.props.closeModal}
                id={"btnCancelEditProjectModal" + this.props.id}
                data-dismiss="modal"
              >
                Cancel
              </button>

              <button
                type="button"
                className="button button-primary"
                onClick={(event) => {
                  this.saveProject(event);
                }}
              >
                Save
              </button>
            </div>
          </div>
        )}
      </Modal>
    );
  };
}

export default EditProjectModal;
