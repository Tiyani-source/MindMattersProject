import React from "react";

export const SelectItem = ({ value, children }) => {
  return (
    <option value={value}>
      {children}
    </option>
  );
};
