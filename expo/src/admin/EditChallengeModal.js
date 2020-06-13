import React, { Component } from "react";
import axiosRequest from "Backend.js";
import Modal from "components/Modal";

import Error from "Error.js";
import ConfirmationButton from "admin/ConfirmationButton";

import "App.css";

let InvalidWinnerErr = (
  <Error
    text="Invalid number of winners!
  This challenge must have one or more winner(s)."
  />
);

const MissingFieldsErr = (
  <Error
    text="Invalid form!
  Please fill out all form fields."
  />
);

class EditChallengeModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      winner_error: false,
      missing_fields: false,
      challenge_title: this.props.challengeTitle,
      num_winners: this.props.numWinners,
      showConfirmation: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      winner_error: false,
      missing_fields: false,
      challenge_title: nextProps.challengeTitle,
      num_winners: nextProps.numWinners,
      showConfirmation: false,
    });
  }

  toggleConfirmation = () => {
    this.setState({ showConfirmation: !this.state.showConfirmation });
  };

  resetWinners = () => {
    if (
      window.confirm(
        `Are you sure you want to reset the winners for ${this.state.challenge_title}?`
      )
    ) {
      axiosRequest
        .put(
          `api/companies/id/${this.props.sponsorID}/challenges/${this.props.challengeID}/resetWinners`
        )
        .then((data) => {
          this.props.onEdit();
          document
            .getElementById(
              `btnCloseEditChallengeModal${this.props.challengeID}`
            )
            .click();
        });
    }
  };

  saveChallenge(e) {
    axiosRequest
      .get(`api/companies/id/${this.props.sponsorID}`)
      .then((challenges) => {
        let winners = [];
        for (let i = 0; i < challenges.length; i++) {
          if (challenges[i].challenge_id === this.props.challengeID) {
            winners = challenges[i].winners;
          }
        }
        let minWinners =
          winners === undefined || winners.length === 0 ? 1 : winners.length;

        // Block set fewer winners if winners have been selected
        let winnerLessZero = Number(this.state.num_winners) < minWinners;

        let missingFields =
          this.state.challenge_title === "" ||
          this.state.challenge_title === undefined ||
          this.state.num_winners === "" ||
          this.state.num_winners === undefined;

        let valid = !winnerLessZero && !missingFields;

        if (valid) {
          // Send challenge name and num challenges to db if validates
          // Update state against db change
          axiosRequest
            .post(
              `api/companies/id/${this.props.sponsorID}/challenges/${this.props.challengeID}`,
              {
                challenge_name: this.state.challenge_title,
                num_winners: this.state.num_winners,
              }
            )
            .then(this.props.onEdit);

          // Reset state and close modal
          this.setState({
            challenge_title: this.props.challengeTitle,
            num_winners: this.props.numWinners,
            winner_error: false,
            missing_fields: false,
          });

          document
            .getElementById("btnHideCreateChallengeModal" + this.props.id)
            .click();
        }

        // Show errors
        if (missingFields) {
          this.setState({ missing_fields: true });
        } else {
          this.setState({ missing_fields: false });
        }

        if (winnerLessZero) {
          let invalidText =
            "Invalid number of winners!" +
            " This challenge must have " +
            minWinners +
            " or more winner(s).";
          InvalidWinnerErr = <Error text={invalidText} />;
          this.setState({ winner_error: true });
        } else {
          this.setState({ winner_error: false });
        }
      });
  }

  deleteChallenge = () => {
    axiosRequest
      .delete(
        `api/companies/id/${this.props.sponsorID}/challenges/${this.props.challengeID}`
      )
      .then(() => {
        this.props.onEdit();
        document
          .getElementById(`btnCloseEditChallengeModal${this.props.challengeID}`)
          .click();
      });
  };

  render() {
    return (
      <Modal id={this.props.id}>
        <div className="modal-header">
          <h5 className="modal-title">Edit Challenge</h5>
          <button
            type="button"
            className="close"
            id={`btnCloseEditChallengeModal${this.props.challengeID}`}
            data-dismiss="modal"
            aria-label="Close"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>Challenge Title</label>
            <input
              type="text"
              className="form-control"
              value={this.state.challenge_title}
              onChange={(event) =>
                this.setState({ challenge_title: event.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label>Number of Winners</label>
            <input
              type="number"
              className="form-control"
              value={this.state.num_winners}
              min="1"
              onChange={(event) =>
                this.setState({ num_winners: event.target.value })
              }
            />
            <br />
            {this.state.winner_error ? InvalidWinnerErr : ""}
            {this.state.missing_fields ? MissingFieldsErr : ""}
          </div>
        </div>

        {this.state.showConfirmation ? (
          <ConfirmationButton
            elementToDelete={this.state.challenge_title}
            deleteElement={this.deleteChallenge}
            toggleConfirmation={this.toggleConfirmation}
          />
        ) : (
          <div className="modal-footer flex justify-space-between">
            <div>
              <button
                type="button"
                className="button button-warning float-left m-r-s"
                onClick={this.toggleConfirmation}
              >
                Delete
              </button>
              <button
                type="button"
                className="button button-warning float-left"
                onClick={this.resetWinners}
              >
                Reset Winners
              </button>
            </div>
            <div>
              <button
                type="button"
                className="button button-secondary m-r-s"
                id={"btnHideCreateChallengeModal" + this.props.id}
                data-dismiss="modal"
                onClick={() => {
                  this.setState({
                    winner_error: false,
                    missing_fields: false,
                    challenge_title: this.props.challengeTitle,
                    num_winners: this.props.numWinners,
                    showConfirmation: false,
                  });
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                className="button button-primary"
                onClick={(event) => {
                  this.saveChallenge(event);
                }}
              >
                Save
              </button>
            </div>
          </div>
        )}
      </Modal>
    );
  }
}

export default EditChallengeModal;
