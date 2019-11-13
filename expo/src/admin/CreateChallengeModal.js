import React, { Component } from "react";
import axiosRequest from "Backend.js";

import Error from "Error.js";

const InvalidWinnerErr = (
  <Error
    text="Invalid number of winners!
  A challenge must have one or more winner(s)."
  />
);

const MissingFieldsErr = (
  <Error
    text="Invalid form!
  Please fill out all form fields."
  />
);

class CreateChallengeModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      winner_error: false,
      missing_fields: false,
      challenge_title: "",
      num_winners: 1
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      winner_error: false,
      missing_fields: false,
      challenge_title: "",
      num_winners: 1
    });
  }

  saveChallenge(e) {
    let winnerLessZero = Number(this.state.num_winners) <= 0;
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
        .post(`api/companies/id/${this.props.sponsorID}/challenges/add`, {
          challenge_name: this.state.challenge_title,
          num_winners: this.state.num_winners
        })
        .then(this.props.onCreate);

      // Reset state and close modal
      this.setState({
        challenge_title: "",
        num_winners: 1,
        winner_error: false,
        missing_fields: false
      });

      document
        .getElementById("btnHideCreateChallengeModal" + this.props.createID)
        .click();
    }

    // Show errors
    if (missingFields) {
      this.setState({ missing_fields: true });
    } else {
      this.setState({ missing_fields: false });
    }

    if (winnerLessZero) {
      this.setState({ winner_error: true });
    } else {
      this.setState({ winner_error: false });
    }
  }

  render() {
    return (
      <div className="modal fade" id={this.props.createID}>
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                Create Challenge for {this.props.company}
              </h5>
              <button
                type="button"
                className="close"
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
                  placeholder="Enter a challenge title"
                  onChange={event =>
                    this.setState({ challenge_title: event.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Number of Winners</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Enter a number of winners"
                  min="1"
                  onChange={event =>
                    this.setState({ num_winners: event.target.value })
                  }
                />
                <br />
                {this.state.winner_error ? InvalidWinnerErr : ""}
                {this.state.missing_fields ? MissingFieldsErr : ""}
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="button button-secondary"
                id={"btnHideCreateChallengeModal" + this.props.createID}
                data-dismiss="modal"
              >
                Cancel
              </button>

              <button
                type="button"
                className="button button-primary"
                onClick={event => {
                  this.saveChallenge(event);
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default CreateChallengeModal;
