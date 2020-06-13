import React, { useState } from "react";
import axiosRequest from "Backend.js";

import Error from "Error.js";
import Modal from "components/Modal";
import SmallerParentheses from "components/SmallerParentheses.js";

const InvalidAccessErr = (
  <Error
    text="Invalid access code!
  This access code is already in use. Please enter a different code."
  />
);

const MissingFieldErr = <Error text="Please fill out this field!" />;

export default function CreateSponsorModal(props) {
  const [accessCode, setAccessCode] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [accessError, setAccessError] = useState(false);
  const [companyError, setCompanyError] = useState(false);

  const saveSponsor = () => {
    axiosRequest.get("api/companies").then((sponsors) => {
      let validAccess = true;
      for (let i = 0; i < sponsors.length; i++) {
        if (sponsors[i].access_code === accessCode) {
          validAccess = false;
        }
      }

      let missingCompany = companyName === "" || companyName === undefined;

      let valid = validAccess && !missingCompany;

      if (valid) {
        axiosRequest
          .post("api/companies/add", {
            company_name: companyName,
            access_code: accessCode,
          })
          .then(props.onCreate);

        // Reset state and close modal
        setAccessCode("");
        setCompanyName("");
        setAccessError(false);
        setCompanyError(false);

        document.getElementById("btnHideCreateSponsorModal" + props.id).click();
      } else {
        setAccessError(!validAccess);
        setCompanyError(missingCompany);
      }
    });
  };

  return (
    <Modal id={props.id}>
      <div className="modal-header">
        <h5 className="modal-title">Create New Sponsor</h5>
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
          <label>Sponsor Name</label>
          <input
            type="text"
            className="form-control"
            id="lblSponsorName"
            placeholder="Enter the sponsor or company name"
            value={companyName}
            onChange={(event) => setCompanyName(event.target.value)}
          />
          {companyError ? MissingFieldErr : ""}
        </div>
        <div className="form-group">
          <label>
            Access Code{" "}
            <SmallerParentheses fontSize="15px">
              leave blank to auto generate
            </SmallerParentheses>
          </label>
          <input
            type="text"
            className="form-control"
            id="lblAccessCode"
            value={accessCode}
            placeholder="Enter an access code"
            onChange={(event) => setAccessCode(event.target.value)}
          />
          {accessError ? InvalidAccessErr : ""}
        </div>
      </div>
      <div className="modal-footer">
        <button
          type="button"
          className="button button-secondary"
          id={"btnHideCreateSponsorModal" + props.id}
          data-dismiss="modal"
        >
          Cancel
        </button>
        <button
          type="button"
          className="button button-primary"
          onClick={saveSponsor}
        >
          Save
        </button>
      </div>
    </Modal>
  );
}
