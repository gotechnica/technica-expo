import { useState, useEffect } from "react";

/**
 * Sorts projects array by a table number.
 * @param {array} array List of project objects to sort
 * @param {bool} sortWithAlphaNumeric If table numbers have an alpha and numeric component
 */
export function sortByTableNumber(array, sortWithAlphaNumeric) {
  const key = "table_number";
  if (sortWithAlphaNumeric) {
    // Sort based on alpha portion first, and then numeric as tie-breaker
    return array.sort(function (a, b) {
      const x = a[key].toLowerCase().split(/([0-9]+)/);
      const y = b[key].toLowerCase().split(/([0-9]+)/);
      const xLetter = x[0];
      const yLetter = y[0];

      if (xLetter < yLetter || yLetter === "") {
        return -1;
      } else if (xLetter > yLetter || xLetter === "") {
        return 1;
      } else {
        // break tie using numeric portion
        const xNum = parseInt(x[1], 10);
        const yNum = parseInt(y[1], 10);
        return xNum < yNum ? -1 : xNum > yNum ? 1 : 0;
      }
    });
  } else {
    // Normal numeric-only straightforward sorting
    return array.sort(function (a, b) {
      let x = a[key];
      let y = b[key];

      // Can't assume table_number is string
      if (typeof x === "string") {
        x = ("" + x).toLowerCase();
      }
      if (typeof y === "string") {
        y = ("" + y).toLowerCase();
      }

      return x < y || y === "" ? -1 : x > y || x === "" ? 1 : 0;
    });
  }
}

export function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  });

  return width;
}
