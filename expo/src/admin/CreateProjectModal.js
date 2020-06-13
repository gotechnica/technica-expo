import React, { Component } from "react";
import axiosRequest from "Backend.js";

import Error from "Error";
import Modal from "components/Modal";

class CreateProjectModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: false,
      project_name: "",
      project_url: "",
      table_number: "",
    };
  }

  createProject = () => {
    axiosRequest
      .post("api/projects/add", {
        project_name: this.state.project_name,
        project_url: this.state.project_url,
        table_number: this.state.table_number,
      })
      .then((data) => {
        this.props.onCreate();
        document.getElementById("btnCancelCreateProjectModal").click();
      });
  };

  handleChange = (e) => {
    let change = {};
    change[e.target.name] = e.target.value;
    this.setState(change);
  };

  render = () => (
    <Modal id={this.props.id}>
      <div className="modal-header">
        <h5 className="modal-title">Create New Project</h5>
        <button
          type="button"
          className="close"
          data-dismiss="modal"
          aria-label="Close"
        >
          <span aria-hidden="true"> &times;</span>
        </button>
      </div>

      <div className="modal-body">
        <form>
          <div className="form-group">
            <label>Project Name</label>
            <input
              className="form-control input"
              name="project_name"
              type="text"
              value={this.state.project_name}
              onChange={(e) => this.handleChange(e)}
              required
            />
          </div>
          <div className="form-group">
            <label>Table Number</label>
            <input
              className="form-control"
              name="table_number"
              type="text"
              value={this.state.table_number}
              onChange={(e) => this.handleChange(e)}
            />
          </div>
          <div className="form-group">
            <label>Project URL</label>
            <input
              className="form-control"
              name="project_url"
              type="text"
              value={this.state.project_url}
              onChange={(e) => this.handleChange(e)}
            />
          </div>

          {this.state.error ? (
            <Error text="One or more fields are empty!"></Error>
          ) : (
            ""
          )}
        </form>
      </div>

      <div className="modal-footer">
        <button
          type="button"
          className="button button-secondary"
          id="btnCancelCreateProjectModal"
          data-dismiss="modal"
        >
          Cancel
        </button>

        <button
          type="button"
          className="button button-primary"
          onClick={this.createProject}
        >
          Create
        </button>
      </div>
    </Modal>
  );
}

export default CreateProjectModal;
