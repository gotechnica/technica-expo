import React from "react";

import "App.css";

export default function ConfirmationButton(props) {
  return (
    <div className="p-a-m">
      <p className="warning-text">
        Are you sure you want to delete {props.elementToDelete}?
      </p>
      <div className="float-right">
        <button
          className="button button-secondary m-r-s"
          onClick={props.toggleConfirmation}
        >
          No
        </button>
        <button className="button button-primary" onClick={props.deleteElement}>
          Yes
        </button>
      </div>
    </div>
  );
}
