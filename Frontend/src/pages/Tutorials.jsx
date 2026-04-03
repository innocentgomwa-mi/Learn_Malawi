import React, { useState } from "react";
import { tutorials } from "../Data/tutorials";
import "../styles/tutorials.css";

const Tutorials = () => {
  const [level, setLevel] = useState("primary");
  const [subjectFilter, setSubjectFilter] = useState("all");

  const filteredByLevel = tutorials.filter((tut) => tut.level === level);

  const allSubjects = ["all", ...new Set(filteredByLevel.map((tut) => tut.subject))];

  const filtered =
    subjectFilter === "all"
      ? filteredByLevel
      : filteredByLevel.filter((tut) => tut.subject === subjectFilter);

  return (
    <div className="tutorials-wrapper">
      <h1 className="tutorials-title">Educational Tutorials</h1>

      <div className="level-tabs">
        <button
          className={level === "primary" ? "active" : ""}
          onClick={() => {
            setLevel("primary");
            setSubjectFilter("all");
          }}
        >
          Primary
        </button>
        <button
          className={level === "secondary" ? "active" : ""}
          onClick={() => {
            setLevel("secondary");
            setSubjectFilter("all");
          }}
        >
          Secondary
        </button>
      </div>

     
      <div className="tutorials-filter">
        <select
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          className="subject-select"
        >
          {allSubjects.map((subject) => (
            <option key={subject} value={subject}>
              {subject === "all" ? "All Subjects" : subject}
            </option>
          ))}
        </select>
      </div>

      <div className="tutorials-grid">
        {filtered.length > 0 ? (
          filtered.map((tut) => (
            <div className="tutorial-card" key={tut.id}>
              <h3>{tut.title}</h3>
              <p className="tutorial-subject">{tut.subject}</p>
              <p className="tutorial-description">{tut.description}</p>

              <div className="video-wrapper">
                <iframe
                  src={tut.videoUrl}
                  title={tut.title}
                  allowFullScreen
                  frameBorder="0"
                ></iframe>
              </div>

              {tut.attachments && tut.attachments.length > 0 && (
                <div className="attachments">
                  <h4>Attachments:</h4>
                  <ul>
                    {tut.attachments.map((file, idx) => (
                      <li key={idx}>
                        <a
                          href={file.url}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="attachment-link"
                        >
                          {file.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="no-results">No tutorials available for this selection.</p>
        )}
      </div>
    </div>
  );
};

export default Tutorials;
