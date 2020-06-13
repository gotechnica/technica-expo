import React, { Fragment } from "react";

/**
 * Wrapper for parentheses that are smaller than the text
 * @param {Object} props
 * @param {number} props.fontSize
 * @param {*} props.children HTML Child
 */
export default function SmallerParentheses(props) {
  let reducedFontSize = { fontSize: props.fontSize };
  return (
    <Fragment>
      <span style={reducedFontSize}>(</span>
      {props.children}
      <span style={reducedFontSize}>)</span>
    </Fragment>
  );
}
