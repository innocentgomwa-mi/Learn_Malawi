import { NavLink, Link } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import { FaBars, FaTimes, FaSearch } from "react-icons/fa";
import { SearchContext } from "./SearchContext";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const { query, setQuery, setShowResults } = useContext(SearchContext);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.classList.add("menu-open");
    } else {
      document.body.classList.remove("menu-open");
    }

    return () => {
      document.body.classList.remove("menu-open");
    };
  }, [isOpen, isMobile]);

  const toggleMenu = () => setIsOpen((prev) => !prev);
  const closeMenu = () => setIsOpen(false);

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setShowResults(true);
      if (isMobile) {
        setShowSearch(false);
      }
    }
  };

  const toggleSearch = () => {
    setShowSearch((prev) => !prev);
    if (isMobile && !showSearch) {
      setIsOpen(false);
    }
  };

  return (
    <header className="HeaderWrapper w-full flex items-center justify-between px-4 md:px-8">
      {!isMobile && (
        <div className="LogoWrapper flex-shrink-0">
          <Link to="/" onClick={closeMenu}>
            <img src="/Logo.png" alt="Learn Malawi logo" id="Logo" />
          </Link>
        </div>
      )}

      <div className="mobile-top-bar">
        <div className="LogoWrapper">
          <Link to="/" onClick={closeMenu}>
            <img src="/Logo.png" alt="Learn Malawi logo" id="Logo" />
          </Link>
        </div>

        <div className="mobile-actions">
          <div className="hamburger" onClick={toggleMenu}>
            {isOpen ? <FaTimes /> : <FaBars />}
          </div>
        </div>
      </div>

      <div className={`Menu w-full flex flex-1 items-center justify-between px-4 ${isOpen ? "open" : ""}`}>
        <NavLink to="/" onClick={closeMenu} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} end>
          Home
        </NavLink>
        <NavLink to="/study-notes" onClick={closeMenu} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          Study Notes
        </NavLink>
        <NavLink to="/past-papers" onClick={closeMenu} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          Past Papers
        </NavLink>
        <NavLink to="/tutorials" onClick={closeMenu} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          Tutorials
        </NavLink>
        <NavLink to="/quizes" onClick={closeMenu} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          Quizzes
        </NavLink>
        <NavLink to="/career-resources" onClick={closeMenu} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          Career Resources
        </NavLink>
        <NavLink to="/abouts" onClick={closeMenu} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          About
        </NavLink>
        <NavLink to="/contact" onClick={closeMenu} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          Contact
        </NavLink>
      </div>

      {!isMobile && (
        <div className={`SearchIconWrapper flex-shrink-0 ${showSearch ? "active" : ""}`}>
          {showSearch && (
            <input
              type="text"
              placeholder="Search resources..."
              className="search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleSearch}
            />
          )}
          <FaSearch className="search-icon" onClick={() => setShowSearch((prev) => !prev)} />
        </div>
      )}

      {isOpen && isMobile && <div className="backdrop" onClick={closeMenu}></div>}
    </header>
  );
};

export default Header;
