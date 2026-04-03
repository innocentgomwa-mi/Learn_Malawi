import { createContext, useState } from "react";

export const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  return (
    <SearchContext.Provider
      value={{ query, setQuery, results, setResults, showResults, setShowResults }}
    >
      {children}
    </SearchContext.Provider>
  );
};
