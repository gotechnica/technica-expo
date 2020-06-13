import React, { useState } from "react";

/**
 * Calculates average time per table for judges
 * @param {Object} props
 * @param {number} props.time Total time
 * @param {number} props.count Number of tables
 */
export default function JudgingTimes(props) {
  const [judges, setJudges] = useState(1);
  const [endTime, setEndTime] = useState(10);

  if (props.count === 0) {
    return "You have no projects to judge.";
  }

  const plural = judges === 1 ? "judge" : "judges";
  const time = ((props.time - endTime) / props.count) * judges;

  return (
    <div className="card">
      You have {props.count} projects to judge in {props.time} minutes. <br />
      <div className="nowrap">
        Given
        <input
          className="inline-numinput"
          type="number"
          id="numJudges"
          name="judges"
          min="1"
          value={judges}
          onChange={(e) => {
            setJudges(parseInt(e.target.value));
          }}
        />{" "}
        {plural}, and
        <input
          className="inline-numinput"
          type="number"
          id="endTime"
          name="selectionTime"
          min="1"
          value={endTime}
          onChange={(e) => {
            setEndTime(parseInt(e.target.value));
          }}
        />{" "}
        minutes of buffer time, <br />
        each judge can spend about {time.toFixed(1)} minutes per hack.
      </div>
    </div>
  );
}
