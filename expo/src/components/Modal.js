import React from "react";

/**
 * Wrapper for bootstrap modal
 * @param {Object} props
 * @param {String} props.id HTML id
 * @param {String} props.children Modal content to wrap
 */
export default function Modal(props) {
  return (
    <div className="modal fade" id={props.id}>
      <div className="modal-dialog" role="document">
        <div className="modal-content">{props.children}</div>
      </div>
    </div>
  );
}
