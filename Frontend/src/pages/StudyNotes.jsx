import React, { useState } from "react";
import studyResources from "../Data/studyResources";
import ResourceCard from "./ResourceCard";
import "../styles/studyNotes.css";

const StudyNotes = () => {
  const [level, setLevel] = useState("primary");
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [viewingResource, setViewingResource] = useState(null);

  const filterResources = (resources) => {
    return resources.filter(({ title, category: resourceCategory }) => {
      const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = category === "all" || resourceCategory === category;
      return matchesSearch && matchesCategory;
    });
  };

  const filteredBooks = filterResources(studyResources[level].books);
  const filteredPastPapers = filterResources(studyResources[level].pastPapers);

  const allCategories = [
    ...new Set([
      ...studyResources[level].books.map((b) => b.category),
      ...studyResources[level].pastPapers.map((p) => p.category),
    ]),
  ];

  const closeViewer = () => setViewingResource(null);

  return (
    <div className="study-notes-wrapper">
      <h1>Study Notes & References</h1>
      <p className="description-text">
        Access a curated collection of books and past exam papers to support your studies.
      </p>

      {/* Level Tabs */}
      <div className="level-tabs">
        <button
          className={level === "primary" ? "active" : ""}
          onClick={() => setLevel("primary")}
        >
          Primary
        </button>
        <button
          className={level === "secondary" ? "active" : ""}
          onClick={() => setLevel("secondary")}
        >
          Secondary
        </button>
      </div>

      {/* Search & Filter */}
      <div className="search-filter-container">
        <input
          type="text"
          placeholder="Search by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="category-select"
        >
          <option value="all">All Categories</option>
          {allCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Books Section */}
      <section>
        <h2>Books</h2>
        <div className="grid-container">
          {filteredBooks.length > 0 ? (
            filteredBooks.map((resource) => (
              <ResourceCard
                key={resource.id}
                title={resource.title}
                thumbnail={resource.thumbnail}
                downloadLink={resource.downloadLink}
                downloadName={resource.downloadName}
                onView={() => setViewingResource(resource)}
              />
            ))
          ) : (
            <p className="no-results">No books found.</p>
          )}
        </div>
      </section>

      {/* Past Papers Section */}
      <section>
        <h2>Past Papers</h2>
        <div className="grid-container">
          {filteredPastPapers.length > 0 ? (
            filteredPastPapers.map((resource) => (
              <ResourceCard
                key={resource.id}
                title={resource.title}
                thumbnail={resource.thumbnail}
                downloadLink={resource.downloadLink}
                downloadName={resource.downloadName}
                onView={() => setViewingResource(resource)}
              />
            ))
          ) : (
            <p className="no-results">No past papers found.</p>
          )}
        </div>
      </section>

      {/* PDF Modal Viewer */}
      {viewingResource && (
        <div className="modal-overlay" onClick={closeViewer}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={closeViewer}>
              &times;
            </button>
            <h2>{viewingResource.title}</h2>
            <iframe
              src={viewingResource.downloadLink}
              title={viewingResource.title}
              width="100%"
              height="600px"
              style={{ border: "none" }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyNotes;
