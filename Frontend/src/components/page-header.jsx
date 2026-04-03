import React from 'react';
import '../styles/page-header.css';

const PageHeader = ({ title, description }) => {
  return (
    <header className="page-header">
      <div className="page-header-inner">
        <h1 className="page-title">{title}</h1>
        {description && (
          <p className="page-subtitle">{description}</p>
        )}
      </div>
    </header>
  );
};

export default PageHeader;
