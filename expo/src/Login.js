import React, { useState } from "react";
import Card from "components/Card.js";

/**
 * Login field
 * @param {Object} props React props
 * @param {string} props.title Field title
 * @param {any} props.onLogin Callback for after submit
 * @param {any} props.error Element to show on error
 */
export default function Login(props) {
  const [accessCode, setAccessCode] = useState("");

  return (
    <div className="row">
      <div className="col-md-8 offset-md-2">
        <Card title={props.title}>
          <div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                props.onLogin(accessCode);
              }}
            >
              <div className="form-group">
                <label htmlFor="txtAccessCode">Access Code</label>
                <input
                  type="text"
                  id="txtAccessCode"
                  className="form-control"
                  onChange={(event) => setAccessCode(event.target.value)}
                />
              </div>
              <button className="button button-primary" type="submit">
                Login
              </button>
              <br />
              <br />
              {props.error}
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
