import React, { Component } from "react";

export default class Checkbox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      color: this.props.check
    };
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(e, id) {
    if (this.state.color !== false) {
      this.setState({
        color: !this.state.color
      });
    }
    this.props.handleChange(this.state.color, id, e);
  }

  render() {
    let id = `defaultChecked${this.props.id}${this.props.project_id}`;
    let label = `defaultChecked${this.props.id}${this.props.project_id}label`;
    return (
      <div
        class="custom-control custom-checkbox"
        onChange={e => {
          this.handleClick(e, id);
        }}
      >
        {this.state.color ? (
          <input
            type="checkbox"
            class="custom-control-input"
            id={id}
            checked
            disabled
          />
        ) : (
          <input type="checkbox" class="custom-control-input" id={id} />
        )}
        <label class="custom-control-label" for={id} id={label}>
          {this.props.value}
        </label>
      </div>
    );
  }
}
