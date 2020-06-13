import React from "react";

import "bootstrap/dist/css/bootstrap.min.css";
import "components/Card.css";

/**
 * Wrapper for Bootstrap Card
 * @param {Object} props
 * @param {String} props.title Card title
 * @param {String=} props.action Callback on card action
 * @param {String=} props.actionName Name of the action in the card header
 */
export default function Card(props) {
  return (
    <div className="card">
      <div className="card-header">
        <div className="d-flex">
          <div>
            <h4>{props.title}</h4>
          </div>
          <div className="ml-auto">
            <button
              type="button"
              className="link-button"
              onClick={props.action}
            >
              {props.actionName}
            </button>
          </div>
        </div>
      </div>
      <div className="card-body">{props.children}</div>
    </div>
  );
}
