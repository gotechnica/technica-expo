import React, { Component } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'components/Card.css';

/**
 * @props
 * title - Title that goes in card header
 */
class Card extends Component {
  render() {
    return (
      <div class="card">
        <div class="card-header">
          <h5>{this.props.title}</h5>
        </div>
        <div class="card-body">
          {this.props.children}
        </div>
      </div>
    );
  }
}

export default Card;
