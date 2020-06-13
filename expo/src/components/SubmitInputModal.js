import React, { useState } from "react";
import Modal from "components/Modal";

import "App.css";

/**
 * Modal that requests text input
 * @param {Object} props
 * @param {String} props.id - HTML id
 * @param {String} props.modalTitle Modal title
 * @param {String} props.bodyText Additional modal body text
 * @param {String} props.inputLabel Label for main input
 * @param {String} props.inputPlaceholder Placeholder for main input
 * @param {boolean} props.isInputRequired Is the input required?
 * @param {*} props.completeAction Callback that takes the user input
 * @param {String} props.submitText Text for the submit button
 */
export default function SubmitInputModal(props) {
  const [inputValue, setInput] = useState("");

  return (
    <Modal id={props.id}>
      <div className="modal-header">
        <h5 className="modal-title">{props.modalTitle}</h5>
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
        {props.bodyText != null ? (
          <p className="modal-text">{props.bodyText}</p>
        ) : null}
        <div className="form-group">
          <label>
            {props.inputLabel}
            {props.isInputRequired ? "*" : null}
          </label>
          <input
            type="text"
            className="form-control"
            placeholder={props.inputPlaceholder}
            onChange={(e) => setInput(e.target.value)}
            required={props.isInputRequired || false}
          />
        </div>
      </div>
      <div className="modal-footer">
        <button
          type="button"
          className="button button-secondary"
          data-dismiss="modal"
        >
          Cancel
        </button>
        <button
          type="button"
          className="button button-primary"
          data-dismiss="modal"
          onClick={() => props.completeAction(inputValue)}
          disabled={props.isInputRequired && inputValue === ""}
        >
          {props.submitText}
        </button>
      </div>
    </Modal>
  );
}
