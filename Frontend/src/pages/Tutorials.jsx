<<<<<<< HEAD
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
=======
import React, { useState, useEffect } from "react";
import { useTutorials } from "../contexts/TutorialsContext";
import "../styles/tutorials.css";
import Footer from "../components/Footer.jsx";
import Header from "../components/Header";
import PageHeader from "../components/page-header";
import Pagination from "../components/Pagination";

const Tutorials = () => {
const [level, setLevel] = useState("secondary");
const [subjectFilter, setSubjectFilter] = useState("all");
const [classFilter, setClassFilter] = useState("all");
const [currentPage, setCurrentPage] = useState(1);
const [totalItems, setTotalItems] = useState(0);
const itemsPerPage = 12;
const [videoErrors, setVideoErrors] = useState({});

const {
tutorials,
subjects,
classes,
loading,
error,
fetchTutorials,
fetchSubjects,
fetchClasses,
clearError,
} = useTutorials();

useEffect(() => {
window.scrollTo(0, 0);
}, []);

useEffect(() => {
const loadData = async () => {
const filters = {
level,
...(subjectFilter !== "all" && { subject: subjectFilter }),
...(classFilter !== "all" && { class: classFilter }),
};

  const result = await fetchTutorials(currentPage, itemsPerPage, filters);

  if (result?.total) {
    setTotalItems(result.total);
  }

  await Promise.all([fetchSubjects(level), fetchClasses(level)]);
};

loadData();

}, [level, subjectFilter, classFilter, currentPage]);

useEffect(() => {
setSubjectFilter("all");
setClassFilter("all");
setCurrentPage(1);
}, [level]);

const handleVideoError = (tutorialId) => {
setVideoErrors((prev) => ({
...prev,
[tutorialId]: true,
}));
};

const extractYouTubeId = (url) => {
if (!url) return null;
const patterns = [
  /youtu\.be\/([a-zA-Z0-9_-]{11})(?:\?.*)?/,
  /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
  /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
];
for (const pattern of patterns) {
const match = url.match(pattern);
if (match && match[1]) return match[1];
}
return null;
};

const getYouTubeEmbedUrl = (url) => {
const videoId = extractYouTubeId(url);
return videoId ? "https://www.youtube.com/embed/${videoId}" : url;
};

const isYouTubeUrl = (url) => {
return url?.includes("youtube.com") || url?.includes("youtu.be");
};

const getSortedClasses = () => {
if (!classes || !Array.isArray(classes)) return [];
return [...classes].sort((a, b) => {
const aNum = parseInt(a.replace(/\D/g, ""));
const bNum = parseInt(b.replace(/\D/g, ""));
return aNum - bNum;
});
};

if (loading && tutorials.length === 0) {
return (
<>
<Header />
<main className="tutorials-page">
<PageHeader
title="Educational Tutorials"
description="Access comprehensive video tutorials covering various subjects for both Primary and Secondary levels."
/>
<div className="state-box">
<span className="spinner" />
<p>Loading tutorials...</p>
</div>
</main>
<Footer />
</>
);
}

if (error && tutorials.length === 0) {
return (
<>
<Header />
<main className="tutorials-page">
<div className="state-box">
<h3>Error Loading Tutorials</h3>
<p>{error}</p>
<button
onClick={() => {
clearError();
fetchTutorials(currentPage, itemsPerPage, { level });
}}
>
Retry
</button>
</div>
</main>
<Footer />
</>
);
}

return (
<>
<Header />
<main className="tutorials-page">
<PageHeader
title="Educational Tutorials"
description="Access comprehensive video tutorials covering various subjects for both Primary and Secondary levels."
/>

    <div className="level-switch">
      <button
        className={level === "primary" ? "active" : ""}
        onClick={() => setLevel("primary")}
      >
        Primary Level
      </button>
      <button
        className={level === "secondary" ? "active" : ""}
        onClick={() => setLevel("secondary")}
      >
        Secondary Level
      </button>
    </div>

    <div className="filters">
      <select
        value={subjectFilter}
        onChange={(e) => {
          setSubjectFilter(e.target.value);
          setCurrentPage(1);
        }}
      >
        <option value="all">All Subjects</option>
        {(subjects || []).map((subject, i) => (
          <option key={i} value={subject}>
            {subject}
          </option>
        ))}
      </select>

      <select
        value={classFilter}
        onChange={(e) => {
          setClassFilter(e.target.value);
          setCurrentPage(1);
        }}
      >
        <option value="all">All Classes</option>
        {getSortedClasses().map((cls, i) => (
          <option key={i} value={cls}>
            {cls}
          </option>
        ))}
      </select>
    </div>

    <section className="materials">
      {tutorials.length > 0 ? (
        <div className="materials-grid">
          {tutorials.map((tut) => {
            const isYouTube = isYouTubeUrl(tut.videoUrl);
            const embedUrl = getYouTubeEmbedUrl(tut.videoUrl);
            const thumbnail = isYouTube
              ? `https://img.youtube.com/vi/${extractYouTubeId(
                  tut.videoUrl
                )}/hqdefault.jpg`
              : "/images/video-placeholder.jpg";

            return (
              <div className="tutorial-card" key={tut.id}>
                <div className="card-media">
                  {videoErrors[tut.id] ? (
                    <div className="media-error">
                      <span>Video unavailable</span>
                    </div>
                  ) : isYouTube ? (
                    <>
                      <img
                        src={thumbnail}
                        alt={tut.title}
                        className="card-thumbnail"
                        loading="lazy"
                      />
                      <iframe
                        src={embedUrl}
                        title={tut.title}
                        allowFullScreen
                        frameBorder="0"
                        className="video-iframe"
                        onError={() => handleVideoError(tut.id)}
                      ></iframe>
                    </>
                  ) : tut.videoUrl?.endsWith(".mp4") ? (
                    <video controls className="video-player">
                      <source src={tut.videoUrl} type="video/mp4" />
                    </video>
                  ) : (
                    <div className="media-error">
                      <span>Format not supported</span>
                    </div>
                  )}
                </div>

                <div className="card-content">
                  <h3 className="card-title">{tut.title}</h3>
                  <div className="card-meta">
                    <span className="badge subject">{tut.subject}</span>
                    <span className="badge class">
                      Class {tut.class}
                    </span>
                  </div>
                  {tut.description && (
                    <p className="card-description">
                      {tut.description}
                    </p>
                  )}
                </div>

                <div className="card-footer">
                  <a
                    href={tut.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="action-link primary"
                  >
                    Open Video
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty">
          <h3>No Tutorials Available</h3>
          <p>
            No tutorials found for the selected filters. Please try
            different subject or class selection.
          </p>
        </div>
      )}
    </section>

    {totalItems > 0 && (
      <Pagination
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
      />
    )}

    <div className="status">
      Showing {tutorials.length}{" "}
      {tutorials.length === 1 ? "tutorial" : "tutorials"}
      {loading && " · loading"}
    </div>
  </main>
  <Footer />
</>

);
};

export default Tutorials;
>>>>>>> 8e873ea79fbc5315d326d9a388dcf797b3f4a90a
