import React, { Component } from "react";
import axiosRequest from "Backend.js";

import Error from "Error.js";
import ConfirmationButton from "admin/ConfirmationButton";

import "App.css";

const InvalidAccessErr = (
  <Error
    text="Invalid access code!
  This access code is already in use. Please enter a different code."
  />
);

const MissingFieldErr = (
  <Error
    text="Invalid form!
  Please fill out all form fields."
  />
);

class EditSponsorModal extends Component {
  constructor(props) {
    super(props);

    // TODO filter challenges against initial access code given as prop

    this.state = {
      access_code: this.props.sponsorCode,
      invalid_access: false,
      company_name: this.props.sponsorName,
      missing_access: false,
      missing_company: false,
      showConfirmation: false,
    };
  }

  toggleConfirmation = () => {
    this.setState({ showConfirmation: !this.state.showConfirmation });
  };

  saveSponsor = () => {
    axiosRequest.get("api/companies").then((sponsors) => {
      let validAccess = true;
      for (let i = 0; i < sponsors.length; i++) {
        // Validate that code does not exist
        // With the exception of the original code saved to self being overriden
        // If existing code matches state code and exsiting code is not the code given as a prop
        if (
          sponsors[i].access_code === this.state.access_code &&
          sponsors[i].access_code !== this.props.sponsorCode
        ) {
          validAccess = false;
        }
      }

      let missingAccess =
        this.state.access_code === "" || this.state.access_code === undefined;

      let missingCompany =
        this.state.company_name === "" || this.state.company_name === undefined;

      let valid = validAccess && !missingAccess && !missingCompany;

      let sponsor_id = this.props.sponsorID;

      if (valid) {
        axiosRequest
          .post(`api/companies/id/${sponsor_id}`, {
            company_name: this.state.company_name,
            access_code: this.state.access_code,
          })
          .then(this.props.onEdit);

        // Reset state and close modal
        this.setState({
          missing_company: false,
          invalid_access: false,
          missing_access: false,
        });
        document
          .getElementById("btnCancelEditSponsorModal" + this.props.id)
          .click();
      } else {
        this.setState({
          invalid_access: !validAccess,
          missing_company: missingCompany,
          missing_access: missingAccess,
        });
      }
    });
  };

  deleteSponsor = () => {
    axiosRequest
      .delete(`api/companies/id/${this.props.sponsorID}`)
      .then((data) => {
        this.props.onEdit();
        // Reset state and close modal
        this.setState({
          missing_company: false,
          invalid_access: false,
          missing_access: false,
        });
        document
          .getElementById("btnCloseEditSponsorModal" + this.props.id)
          .click();
      });
  };

  render() {
    return (
      <div className="modal fade" id={this.props.id}>
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Sponsor</h5>
              <button
                type="button"
                className="close"
                id={`btnCloseEditSponsorModal${this.props.id}`}
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Access Code</label>
                <input
                  type="text"
                  className="form-control"
                  id="lblAccessCode"
                  value={this.state.access_code.toString()}
                  onChange={(event) =>
                    this.setState({ access_code: event.target.value })
                  }
                />
                {this.state.invalid_access ? InvalidAccessErr : ""}
                {this.state.missing_access ? MissingFieldErr : ""}
              </div>
              <div className="form-group">
                <label>Sponsor Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="lblSponsorName"
                  value={this.state.company_name.toString()}
                  onChange={(event) =>
                    this.setState({ company_name: event.target.value })
                  }
                />
                {this.state.missing_company ? MissingFieldErr : ""}
              </div>
            </div>

            {this.state.showConfirmation ? (
              <ConfirmationButton
                elementToDelete={this.state.company_name}
                deleteElement={this.deleteSponsor}
                toggleConfirmation={this.toggleConfirmation}
              />
            ) : (
              <div className="modal-footer flex justify-space-between">
                <div>
                  <button
                    type="button"
                    className="button button-warning float-left"
                    onClick={this.toggleConfirmation}
                  >
                    Delete
                  </button>
                </div>
                <div>
                  <button
                    type="button"
                    className="button button-secondary m-r-s"
                    id={"btnCancelEditSponsorModal" + this.props.id}
                    data-dismiss="modal"
                    onClick={() => {
                      this.setState({
                        access_code: this.props.sponsorCode,
                        invalid_access: false,
                        company_name: this.props.sponsorName,
                        missing_access: false,
                        missing_company: false,
                        showConfirmation: false,
                      });
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="button button-primary"
                    onClick={this.saveSponsor}
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default EditSponsorModal;
