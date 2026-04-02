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