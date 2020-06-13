import React, { useState } from "react";
import axiosRequest from "Backend.js";

import Error from "Error.js";
import Modal from "components/Modal";

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

export default function CreateChallengeModal(props) {
  const [numWinners, setNumWinners] = useState(1);
  const [challengeTitle, setChallengeTitle] = useState("");
  const [winnerError, setWinnerError] = useState(false);
  const [missingFieldsError, setMissingFields] = useState(false);

  const saveChallenge = () => {
    let winnerLessZero = Number(numWinners) <= 0;
    let missingFields =
      challengeTitle === "" ||
      challengeTitle === undefined ||
      numWinners === "" ||
      numWinners === undefined;

    let valid = !winnerLessZero && !missingFields;

    if (valid) {
      // Send challenge name and num challenges to db if validates
      // Update state against db change
      axiosRequest
        .post(`api/companies/id/${props.sponsorID}/challenges/add`, {
          challenge_name: challengeTitle,
          num_winners: numWinners,
        })
        .then(props.onCreate);

      document.getElementById("btnHideCreateChallengeModal" + props.id).click();
    } else {
      setMissingFields(missingFields);
      setWinnerError(winnerLessZero);
    }
  };

  return (
    <Modal id={props.id}>
      <div className="modal-header">
        <h5 className="modal-title">Create Challenge for {props.company}</h5>
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
            onChange={(event) => setChallengeTitle(event.target.value)}
            value={challengeTitle}
          />
        </div>
        <div className="form-group">
          <label>Number of Winners</label>
          <input
            type="number"
            className="form-control"
            placeholder="Enter a number of winners"
            min="1"
            onChange={(event) => setNumWinners(event.target.value)}
            value={numWinners}
          />
          <br />
          {winnerError ? InvalidWinnerErr : ""}
          {missingFieldsError ? MissingFieldsErr : ""}
        </div>
      </div>
      <div className="modal-footer">
        <button
          type="button"
          className="button button-secondary"
          id={"btnHideCreateChallengeModal" + props.id}
          data-dismiss="modal"
        >
          Cancel
        </button>

        <button
          type="button"
          className="button button-primary"
          onClick={saveChallenge}
        >
          Save
        </button>
      </div>
    </Modal>
  );
}
