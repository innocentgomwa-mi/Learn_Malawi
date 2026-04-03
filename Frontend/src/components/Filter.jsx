import React from "react";
import "../styles/filter.css";

const Filter = ({
  value = "",
  onChange,
  options = [],
  placeholder = "Select a category",
  showAllOption = true,
  allOptionLabel = "All Categories",
  allOptionValue = "all",
  className = "",
  label = "",
  id = "filter-select"
}) => {
  return (
    <div className={`filter-container ${className}`}>
      {label && <label htmlFor={id} className="filter-label">{label}</label>}
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="filter-select"
      >
        {showAllOption && (
          <option value={allOptionValue}>{allOptionLabel}</option>
        )}
        {options.map((option, index) => {
          // Handle both object and string options
          if (typeof option === 'object') {
            return (
              <option key={option.value || option.id || index} value={option.value}>
                {option.label || option.name || option.value}
              </option>
            );
          }
          return (
            <option key={index} value={option}>
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </option>
          );
        })}
      </select>
    </div>
  );
};

export default Filter;