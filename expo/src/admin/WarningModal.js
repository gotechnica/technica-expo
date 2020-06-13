import React from "react";

import "App.css";
import GenericConfirmationModal from "components/GenericConfirmationModal";

/**
 * Modal to confirm on deletion
 * @param {Object} props
 * @param {String} props.id HTML Id
 * @param {String} props.collection Items to delete
 * @param {String} props.onDelete Deletion callback
 */
export default function WarningModal(props) {
  return (
    <GenericConfirmationModal
      id={props.modalId}
      modalTitle={"Delete All" + props.collection + "?"}
      bodyText={
        "Are you sure you want to delete all " +
        props.collection.toLowerCase() +
        "?"
      }
      completeAction={props.onDelete}
    />
  );
}
