import React from "react";
import Modal from "components/Modal";

import "App.css";

/**
 * Wrapper for a modal with "Yes" and "No" options
 * @param {Object} props
 * @param {String} props.id Unique HTML id
 * @param {String} props.modalTitle Modal header title
 * @param {String} props.bodyText Main body text for modal
 * @param {*} props.completeAction Callback
 */
export default function GenericConfirmationModal(props) {
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
        <p className="modal-text">{props.bodyText}</p>
      </div>
      <div className="modal-footer">
        <button
          type="button"
          className="button button-secondary no"
          data-dismiss="modal"
        >
          No
        </button>
        <button
          type="button"
          className="button button-primary yes"
          data-dismiss="modal"
          onClick={props.completeAction}
        >
          Yes
        </button>
      </div>
    </Modal>
  );
}
