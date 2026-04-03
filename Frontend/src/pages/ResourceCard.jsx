import React, { useState } from "react";
import { FaStar, FaBookmark, FaRegBookmark } from "react-icons/fa";

const ResourceCard = ({ title, thumbnail, downloadLink, downloadName, onView }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [rating, setRating] = useState(0);

  const toggleBookmark = () => setIsBookmarked(prev => !prev);
  const handleRating = (value) => setRating(value);

  return (
    <div className="resource-card p-4 bg-white rounded-xl shadow hover:shadow-lg transition">
      
      {/* Bookmark Icon */}
      <div className="card-header flex justify-end">
        <button className="bookmark-btn" onClick={toggleBookmark} aria-label="Bookmark">
          {isBookmarked ? <FaBookmark /> : <FaRegBookmark />}
        </button>
      </div>

      {/* Thumbnail */}
      <img
        src={thumbnail || "https://via.placeholder.com/200x140?text=Book"}
        alt={title}
        className="mb-2 rounded"
      />

      {/* Title */}
      <h3 className="font-semibold text-lg mb-2">{title}</h3>

      {/* Action Buttons */}
      <div className="action-buttons flex justify-center gap-4 mb-2">
        <a
          href={downloadLink}
          download={downloadName}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition"
        >
          Download
        </a>

        {onView && (
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition"
            onClick={onView}
          >
            View
          </button>
        )}
      </div>

      {/* Rating */}
      <div className="rating flex gap-1 justify-center">
        {[1, 2, 3, 4, 5].map((val) => (
          <span
            key={val}
            className={`star ${val <= rating ? "text-yellow-400" : "text-gray-300"} cursor-pointer`}
            onClick={() => handleRating(val)}
            role="button"
            aria-label={`Rate ${val} stars`}
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === "Enter") handleRating(val);
            }}
          >
            <FaStar />
          </span>
        ))}
      </div>
    </div>
  );
};

export default ResourceCard;
