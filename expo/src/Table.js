import React, { Fragment } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import WinnerBadge from "customize/imgs/winner_ribbon.png";
import SmallerParentheses from "components/SmallerParentheses.js";
import { SubmitModal } from "Sponsor.js";

import "bootstrap/dist/css/bootstrap.min.css";
import "App.css";
import "Table.css";

import "customize/customize";
import { faSquare } from "@fortawesome/free-regular-svg-icons";
import { faCheckSquare } from "@fortawesome/free-solid-svg-icons";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import customize from "customize/customize";
import { useWindowWidth } from "./helpers";
library.add(faCheckSquare);
library.add(faSquare);

function DiversifyWinnersModal() {
  return (
    <div
      className="modal fade bd-example-modal-sm"
      id="diversifyWinnersModal"
      tabindex="-1"
      role="dialog"
      aria-labelledby="mySmallModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-sm modal-dialog-centered">
        <div className="modal-content" style={{ border: "0px solid" }}>
          <div className="modal-header" style={{ border: "0px solid" }}>
            <button
              type="button"
              class="close"
              data-dismiss="modal"
              aria-label="Close"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div
            className="modal-body"
            style={{ color: "white", textAlign: "center" }}
          >
            <FontAwesomeIcon
              icon={faExclamationCircle}
              size="5x"
              className="warning"
            />
            <div className="diversity-modal">
              Our current numbers indicate that this project will win 2 + prizes
              this weekend. We recommend considering alternative projects to
              allow for more diversity in winners.
            </div>
          </div>
          <div
            className="modal-footer"
            style={{ border: "0px solid", paddingTop: "0px" }}
          >
            <button className="button button-primary" data-dismiss="modal">
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CheckBoxColumn(props) {
  let checkbox = props.checked ? faCheckSquare : faSquare;
  let input = (
    <input
      type="checkbox"
      className="voting-checkbox"
      value={props.project_id}
      checked={props.checked}
      disabled={props.disabled}
    />
  );
  let checkboxStyle = props.checked
    ? props.disabled
      ? "fa-check-square disabled"
      : "fa-check-square"
    : props.disabled
    ? "fa-square"
    : "fa-square hoverable";
  let CustomCheckbox = props.disabled ? (
    <FontAwesomeIcon icon={checkbox} className={checkboxStyle} />
  ) : (
    <FontAwesomeIcon
      icon={checkbox}
      className={checkboxStyle}
      onClick={() => {
        props.vote_handler(props.project_id);
      }}
    />
  );
  return (
    <td>
      {!props.checked && props.num_challenges_won >= 2 && !props.disabled ? (
        <label data-toggle="modal" data-target="#diversifyWinnersModal">
          {CustomCheckbox}
        </label>
      ) : (
        <label>{CustomCheckbox}</label>
      )}
      {input}
      {!props.checked && props.num_challenges_won >= 2 ? (
        <DiversifyWinnersModal />
      ) : null}
    </td>
  );
}

function ProjectColumn(props) {
  let attempted_challenges = props.attempted_challenges;
  let challenges_won = props.challenges_won;
  let colors = customize.table_color;
  let index = props.counter % colors.length;
  return (
    <td>
      <div className="Project header-font">
        <a href={props.project_url} target="_tab" className="link">
          {props.project_name}
        </a>
        {props.width < 460 ? (
          props.table_number !== "" ? (
            props.origin === "home" ? (
              <div>
                <button
                  className="Table"
                  style={{ backgroundColor: colors[index] }}
                >
                  <div className="Table header-font">Table</div>
                  <div className="Table-Number header-font">
                    {props.table_number}
                  </div>
                </button>
              </div>
            ) : (
              <div className="Sponsor-Table">Table: {props.table_number}</div>
            )
          ) : null
        ) : null}
        {props.width < 460 &&
        props.num_challenges_won > 0 &&
        props.origin === "sponsor" ? (
          <div className="Sponsor-Table">
            <img
              src={WinnerBadge}
              alt="Winner Badge"
              style={{ height: "20px", marginRight: "5px" }}
            />
            Challenges Won: {props.num_challenges_won}
          </div>
        ) : null}
      </div>
      {props.origin === "home" ? (
        <Fragment>
          {challenges_won.length > 0 ? (
            <div className="challenges-won">{challenges_won}</div>
          ) : null}
          {attempted_challenges.length > 0 ? (
            <Fragment>
              {props.width < 460 && !props.show_attempted_challenges ? (
                <hr className="attempted-challenges" />
              ) : null}
              <div className="attempted-challenges">
                {props.show_attempted_challenges ? (
                  <b>
                    Attempted Challenge
                    <SmallerParentheses fontSize="12px">
                      s
                    </SmallerParentheses>: {attempted_challenges.length}
                  </b>
                ) : (
                  attempted_challenges
                )}
              </div>
            </Fragment>
          ) : null}
        </Fragment>
      ) : null}
    </td>
  );
}

function ChallengeCard(props) {
  let text =
    props.width >= 460 ? (
      " | " + props.company
    ) : (
      <Fragment>
        <br />
        {props.company}
      </Fragment>
    );
  return props.won && props.winnersRevealed ? (
    props.width >= 460 ? (
      <div className="btn-group">
        <button className="btn" disabled>
          <img src={WinnerBadge} alt="Winner Badge" className="Ribbon" />
        </button>
        <button className="btn btn-block" disabled>
          <b>{props.challenge_name}</b>
          {text}
        </button>
      </div>
    ) : (
      <div>
        <b>{props.challenge_name}</b>
        {text} <img src={WinnerBadge} alt="Winner Badge" className="Ribbon" />
      </div>
    )
  ) : (
    <div>
      <button className="btn btn-block" disabled>
        <b>{props.challenge_name}</b>
        {text}
      </button>
    </div>
  );
}

export function Row(props) {
  let attempted_challenges = [];
  let challenges_won = [];
  let winner_count = 0;
  if (props.challenges !== undefined) {
    props.challenges.forEach((challenge) => {
      let challenge_card = (
        <ChallengeCard
          company={challenge.company}
          challenge_name={challenge.challenge_name}
          won={challenge.won}
          width={props.width}
          winnersRevealed={props.winnersRevealed}
        />
      );
      if (challenge.won) {
        if (props.winnersRevealed) {
          challenges_won.push(challenge_card);
        } else {
          attempted_challenges.push(challenge_card);
        }
        winner_count += 1;
      } else {
        attempted_challenges.push(challenge_card);
      }
    });
  }
  let table =
    props.width >= 460 ? (
      <td className="Table-Number header-font">
        {props.table_number === "" ? "-" : props.table_number}
      </td>
    ) : null;
  return (
    <tr className="voting-row">
      {props.origin === "sponsor" ? (
        <CheckBoxColumn
          vote_handler={props.vote_handler}
          project_id={props.project_id}
          checked={props.checked}
          disabled={props.disabled}
          num_challenges_won={winner_count}
        />
      ) : null}
      {table}
      <ProjectColumn
        project_name={props.project_name}
        project_url={props.project_url}
        challenges={props.origin === "home" ? props.challenges : undefined}
        table_number={props.table_number}
        width={props.width}
        origin={props.origin}
        counter={props.counter}
        show_attempted_challenges={props.show_attempted_challenges}
        attempted_challenges={attempted_challenges}
        challenges_won={challenges_won}
        num_challenges_won={winner_count}
      />
      {props.origin === "sponsor" ? (
        props.width >= 460 ? (
          <td
            className="Trophy-Case"
            style={{
              fontSize: "35px",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            {winner_count > 0 ? (
              <Fragment>
                <img
                  src={WinnerBadge}
                  alt="Winner Badge"
                  style={{ height: "40px", marginRight: "10px" }}
                />
                {winner_count}
              </Fragment>
            ) : null}
          </td>
        ) : null
      ) : null}
    </tr>
  );
}

export function Table(props) {
  const width = useWindowWidth();

  let rows = [];
  let counter = 0;
  let table = width >= 460 ? <th className="header-font">Table</th> : null;
  let trophy_header = width >= 460 ? <th>Challenges Won</th> : null;
  props.projects.forEach((project) => {
    rows.push(
      props.origin === "sponsor" ? (
        <Row
          project_id={project.project_id}
          table_number={project.table_number}
          project_name={project.project_name}
          project_url={project.project_url}
          vote_handler={props.vote_handler}
          checked={
            props.checked[project.project_id] === undefined
              ? false
              : props.checked[project.project_id].checked[props.value]
          }
          disabled={props.sponsor_data[props.value].votes_submitted}
          origin={props.origin}
          width={width}
          challenges={project.challenges}
          winnersRevealed={props.winnersRevealed}
        />
      ) : (
        <Row
          project_id={project.project_id}
          table_number={project.table_number}
          project_name={project.project_name}
          project_url={project.project_url}
          challenges={project.challenges}
          origin={props.origin}
          width={width}
          counter={counter}
          show_attempted_challenges={props.show_attempted_challenges}
          winnersRevealed={props.winnersRevealed}
        />
      )
    );
    counter += 1;
  });
  let selections = [];
  if (props.origin === "sponsor") {
    Object.keys(props.checked).forEach((project_id) => {
      let challenges = props.checked[project_id];
      Object.keys(challenges.checked).forEach((challenge) => {
        if (
          challenge === props.value &&
          challenges.checked[challenge] === true
        ) {
          selections.push(challenges.project_name);
        }
      });
    });
  }

  if (!props.expoIsPublished) {
    return (
      <div className="card no-submissions">
        <h3>We're currently working on loading in the projects.</h3>
        <h3>Expo will begin shortly!</h3>
      </div>
    );
  }

  return rows.length > 0 ? (
    <Fragment>
      <table>
        {props.origin === "home" ? (
          <thead>
            <tr>
              {table}
              <th className="header-font">Project Information</th>
            </tr>
          </thead>
        ) : width >= 460 ? (
          <thead>
            <tr>
              <th>Select</th>
              {table}
              <th>Project</th>
              {trophy_header}
            </tr>
          </thead>
        ) : null}
        <tbody>{rows}</tbody>
      </table>
      {props.origin === "sponsor" ? (
        props.sponsor_data[props.value].votes_submitted ? (
          <div className="float-right-desktop">
            <button className="button button-secondary clear m-r-m" disabled>
              Clear
            </button>
            <button className="button button-primary submit" disabled>
              Submit
            </button>
          </div>
        ) : (
          <div className="float-right-desktop">
            <button
              className="button button-secondary clear m-r-m"
              onClick={props.clear}
            >
              Clear
            </button>
            <button
              className="button button-primary submit"
              data-toggle="modal"
              data-target="#submitModal"
            >
              Submit
            </button>
            <SubmitModal
              value={props.value}
              votes={selections}
              vote_limit={props.sponsor_data[props.value].vote_limit}
              submit_handler={props.submit}
              company_id={props.company_id}
              challenge_id={props.sponsor_data[props.value].challenge_id}
              after_submission_handler={props.after_submission_handler}
            />
          </div>
        )
      ) : null}
    </Fragment>
  ) : (
    <div className="card no-submissions">
      {props.isLoadingData ? (
        <h2>Loading projects...</h2>
      ) : (
        <h2>No Submissions</h2>
      )}
    </div>
  );
}

export default Table;
