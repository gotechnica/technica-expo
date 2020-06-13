import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { library } from "@fortawesome/fontawesome-svg-core";
library.add(faExclamationTriangle);

export default function Error(props) {
  let font_awesome_icon =
    props.icon === undefined ? faExclamationTriangle : props.icon;
  let className =
    props.iconstyle === undefined ? "fa-exclamation-triangle" : props.iconstyle;
  return (
    <div className="btn-group error-group" role="group">
      <span className="error-icon">
        <FontAwesomeIcon icon={font_awesome_icon} className={className} />
      </span>
      <span className="error-text">
        {props.children === undefined ? props.text : props.children}
      </span>
    </div>
  );
}
