<<<<<<< HEAD
import { NavLink } from "react-router-dom";
import { useState, useContext } from "react";
=======
import { NavLink, Link } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
>>>>>>> 8e873ea79fbc5315d326d9a388dcf797b3f4a90a
import logo from "../images/Logo.png";
import "../styles/header.css";
import { FaBars, FaTimes, FaSearch } from "react-icons/fa";
import { SearchContext } from "../components/SearchContext";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
<<<<<<< HEAD

  const { query, setQuery, setShowResults } = useContext(SearchContext);

=======
  const [isMobile, setIsMobile] = useState(false);

  const { query, setQuery, setShowResults } = useContext(SearchContext);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
    
    return () => {
      document.body.classList.remove('menu-open');
    };
  }, [isOpen, isMobile]);

>>>>>>> 8e873ea79fbc5315d326d9a388dcf797b3f4a90a
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
<<<<<<< HEAD
=======
      if (isMobile) {
        setShowSearch(false);
      }
    }
  };

  const toggleSearch = () => {
    setShowSearch((prev) => !prev);
    if (isMobile && !showSearch) {
      setIsOpen(false);
>>>>>>> 8e873ea79fbc5315d326d9a388dcf797b3f4a90a
    }
  };

  return (
    <header className="HeaderWrapper">
<<<<<<< HEAD
      {/* Logo */}
      <div className="LogoWrapper">
        <img src={logo} alt="Learn Malawi logo" id="Logo" />
=======
      {/* Desktop Logo - Clickable */}
      {!isMobile && (
        <div className="LogoWrapper">
          <Link to="/" onClick={closeMenu}>
            <img src={logo} alt="Learn Malawi logo" id="Logo" />
          </Link>
        </div>
      )}

      {/* Mobile Top Bar */}
      <div className="mobile-top-bar">
        {/* Mobile Logo - Clickable */}
        <div className="LogoWrapper">
          <Link to="/" onClick={closeMenu}>
            <img src={logo} alt="Learn Malawi logo" id="Logo" />
          </Link>
        </div>

        <div className="mobile-actions">
          <div className={`SearchIconWrapper ${showSearch ? "active" : ""}`}>
            {showSearch && (
              <input
                type="text"
                placeholder="Search resources..."
                className="search-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleSearch}
                autoFocus
              />
            )}
            <FaSearch
              className="search-icon"
              onClick={toggleSearch}
            />
          </div>

          <div className="hamburger" onClick={toggleMenu}>
            {isOpen ? <FaTimes /> : <FaBars />}
          </div>
        </div>
>>>>>>> 8e873ea79fbc5315d326d9a388dcf797b3f4a90a
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
<<<<<<< HEAD
=======
          to="/news"
          onClick={closeMenu}
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          News
        </NavLink>
        <NavLink
>>>>>>> 8e873ea79fbc5315d326d9a388dcf797b3f4a90a
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
<<<<<<< HEAD
          Quizes
=======
          Quizzes
>>>>>>> 8e873ea79fbc5315d326d9a388dcf797b3f4a90a
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
<<<<<<< HEAD
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
=======
          About
        </NavLink>
        <NavLink
          to="/contact"
          onClick={closeMenu}
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          Contact
        </NavLink>
      </div>

      {/* Desktop Search */}
      {!isMobile && (
        <div className={`SearchIconWrapper ${showSearch ? "active" : ""}`}>
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
          <FaSearch
            className="search-icon"
            onClick={() => setShowSearch((prev) => !prev)}
          />
        </div>
      )}

      {/* Backdrop for mobile menu */}
      {isOpen && isMobile && (
        <div className="backdrop" onClick={closeMenu}></div>
      )}
>>>>>>> 8e873ea79fbc5315d326d9a388dcf797b3f4a90a
    </header>
  );
};

<<<<<<< HEAD
export default Header;
=======
export default Header;
>>>>>>> 8e873ea79fbc5315d326d9a388dcf797b3f4a90a
