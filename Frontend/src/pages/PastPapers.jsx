import React, { useState } from "react";
import studyResources from "../Data/studyResources";
import ResourceCard from "./ResourceCard";
import "../styles/pastPapers.css";

const PastPapers = () => {
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
      ...studyResources[level].books.map(b => b.category),
      ...studyResources[level].pastPapers.map(p => p.category)
    ])
  ];

  
  const closeViewer = () => setViewingResource(null);

  return (
    <div className="pastpapers-wrapper">
      <h1>Past Papers And Reviews</h1>
      <p className="description-text">
        Access a curated collection of past papers and reviews to support your primary and secondary school studies. Use the search and filters below to quickly find the resources you need.
         <br/>
         <br/>
      </p>

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
          {allCategories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <section>
        <h2>Past Papers</h2>
        <div className="grid-container">
          {filteredBooks.length > 0 ? (
            filteredBooks.map(resource => (
              <ResourceCard
                key={resource.id}
                {...resource}
                onView={() => setViewingResource(resource)}
              />
            ))
          ) : (
            <p className="no-results">No past papers found.</p>
          )}
        </div>
      </section>

      <section>
        <h2>Paper Reviews</h2>
        <div className="grid-container">
          {filteredPastPapers.length > 0 ? (
            filteredPastPapers.map(resource => (
              <ResourceCard
                key={resource.id}
                {...resource}
                onView={() => setViewingResource(resource)}
              />
            ))
          ) : (
            <p className="no-results">No reviews found.</p>
          )}
        </div>
      </section>

     {viewingResource && (
  <div className="modal-overlay" onClick={closeViewer}>
    <div className="modal-content" onClick={e => e.stopPropagation()}>
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

export default PastPapers;
