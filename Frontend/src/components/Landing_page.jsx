import Header from "./Header";
import "../styles/landing_page.css";
import { 
  FaDownload, FaBook, FaFileAlt, 
  FaCheckCircle, FaBookOpen, FaLock, FaUsers 
} from "react-icons/fa";
import Footer from "./footer";
import studyResources from "../Data/studyResources"; 
import { useNavigate } from "react-router-dom"; 
import Heroslideshow from "./Heroslideshow";
import { useContext, useEffect } from "react";
import { SearchContext } from '../components/SearchContext';

const LandingPage = () => {
  const navigate = useNavigate(); 
  const { query, results, setResults, showResults, setShowResults } = useContext(SearchContext);

  const allResources = [
    ...studyResources.primary.books,
    ...studyResources.primary.pastPapers,
    ...studyResources.secondary.books,
    ...studyResources.secondary.pastPapers,
  ];

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    const filtered = allResources.filter(
      (res) =>
        res.title.toLowerCase().includes(query.toLowerCase()) ||
        res.category.toLowerCase().includes(query.toLowerCase())
    );
    setResults(filtered);
    setShowResults(true);
  }, [query]);

  return (
    <div className="LandingPageWrapper">
      <Header />

      {showResults ? (
        <div className="search-results">
          <h3>Search Results:</h3>
          {results.length > 0 ? (
            <div className="resource-grid">
              {results.map((res) => (
                <div key={res.id} className="resource-card">
                  <img src={res.thumbnail} alt={res.title} />
                  <h4>{res.title}</h4>
                  <p>{res.category}</p>
                  <a
                    href={res.downloadLink}
                    className="download-btn"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaDownload /> Download
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-results">No results found for "{query}"</p>
          )}

          <button
            className="explore-btn"
            onClick={() => setShowResults(false)}
          >
            Back to Home
          </button>
        </div>
      ) : (
        <>
          <div className="main-section fade-in">
            <h1>
              Free, Quality Education <br /> For Every Student In Malawi
            </h1>
            <p>
              Curriculum-aligned learning resources for JCE and MSCE students
              across Malawi
            </p>
          </div>

          <Heroslideshow />

          <h2 id="service-title">Gallery</h2>
          <div className="Services">
            <div className="service-card" onClick={() => navigate("/study-notes")}>
              <div className="icon-wrapper"><FaBook /></div>
              <h2>Notes</h2>
              <p>Curriculum-aligned notes approved by Malawi Institute of Education</p>
            </div>

            <div className="service-card" onClick={() => navigate("/past-papers")}>
              <div className="icon-wrapper"><FaFileAlt /></div>
              <h2>Past Papers</h2>
              <p>Access MSCE & JCE past papers with solutions</p>
            </div>

            <div className="service-card" onClick={() => navigate("/career-resources")}>
              <div className="icon-wrapper"><FaDownload /></div>
              <h2>Resources</h2>
              <p>Study offline with downloadable resources</p>
            </div>
          </div>
        </>
      )}

      <div className="trust-section">
        <h2>Why Trust Learn Malawi?</h2>
        <div className="trust-cards">
          <div className="trust-card">
            <FaCheckCircle className="trust-icon" />
            <h3>Officially Aligned</h3>
            <p>All notes and past papers follow Malawi Institute of Education standards.</p>
          </div>
          <div className="trust-card">
            <FaBookOpen className="trust-icon" />
            <h3>Quality Resources</h3>
            <p>Every resource is carefully reviewed to ensure accuracy and relevance.</p>
          </div>
          <div className="trust-card">
            <FaLock className="trust-icon" />
            <h3>Safe & Free</h3>
            <p>No fees, no hidden costs. Learn Malawi is built for students, by students.</p>
          </div>
          <div className="trust-card">
            <FaUsers className="trust-icon" />
            <h3>Trusted by Many</h3>
            <p>Already supporting learners and teachers across Malawi every day.</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LandingPage;
