import { NavLink } from "react-router-dom";
import { useState, useContext } from "react";
import logo from "../images/Logo.png";
import "../styles/header.css";
import { FaBars, FaTimes, FaSearch } from "react-icons/fa";
import { SearchContext } from "../components/SearchContext";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const { query, setQuery, setShowResults } = useContext(SearchContext);

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setShowResults(true);
    }
  };

  return (
    <header className="HeaderWrapper">
      {/* Logo */}
      <div className="LogoWrapper">
        <img src={logo} alt="Learn Malawi logo" id="Logo" />
      </div>

      {/* Menu Items */}
      <div className={`Menu ${isOpen ? "open" : ""}`}>
        <NavLink
          to="/"
          onClick={closeMenu}
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
          end
        >
          Home
        </NavLink>
        <NavLink
          to="/study-notes"
          onClick={closeMenu}
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          Study Notes
        </NavLink>
        <NavLink
          to="/past-papers"
          onClick={closeMenu}
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          Past Papers
        </NavLink>
        <NavLink
          to="/tutorials"
          onClick={closeMenu}
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          Tutorials
        </NavLink>
        <NavLink
          to="/quizes"
          onClick={closeMenu}
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          Quizes
        </NavLink>
        <NavLink
          to="/career-resources"
          onClick={closeMenu}
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          Career Resources
        </NavLink>
        <NavLink
          to="/abouts"
          onClick={closeMenu}
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          Abouts
        </NavLink>
      </div>

      {/* Search Bar */}
      <div className={`SearchIconWrapper ${showSearch ? "active" : ""}`}>
        {showSearch && (
          <input
            type="text"
            placeholder="Search..."
            className="search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSearch}
          />
        )}
        <FaSearch
          className="search-icon"
          onClick={() => setShowSearch((prev) => !prev)}
        />
      </div>

      {/* Hamburger Menu */}
      <div className="hamburger" onClick={toggleMenu}>
        {isOpen ? <FaTimes /> : <FaBars />}
      </div>
    </header>
  );
};

export default Header;
