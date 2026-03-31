import React from "react";
import { careerResources } from "../Data/careerResources";
import "../styles/careerResources.css";

const CareerResources = () => {
  return (
    <div className="career-resources-wrapper">
      <h1 className="career-resources-title">Career Resources</h1>
      <p className="career-resources-intro">
        Explore these valuable resources to guide and motivate your career journey.
      </p>

      <div className="career-resources-list">
        {careerResources.map(({ id, title, description, link, icon: Icon }) => (
          <div key={id} className="career-resource-card">
            <div className="resource-icon-wrapper">
              <Icon className="resource-icon" />
            </div>
            <h3 className="resource-title">{title}</h3>
            <p className="resource-description">{description}</p>
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="resource-link"
            >
              Learn More
            </a>
          </div>
        ))}
      </div>

      <div className="motivational-figures-section">
        <h2 className="motivational-figures-title">Motivational Figures</h2>
        <p className="motivational-figures-intro">
          Get inspired by the stories of some of the most successful individuals in the world.
        </p>

        <div className="motivational-figures-list">
          <div className="figure-card">
            <h3>Oprah Winfrey</h3>
            <p>
              From a troubled childhood to becoming a media mogul and philanthropist, Oprah's journey is a testament to resilience and self-belief.
            </p>
          </div>
          <div className="figure-card">
            <h3>Elon Musk</h3>
            <p>
              Founder of Tesla and SpaceX, Elon Musk continues to push the boundaries of technology and innovation despite numerous setbacks.
            </p>
          </div>
          <div className="figure-card">
            <h3>Malala Yousafzai</h3>
            <p>
              A Nobel Peace Prize winner and advocate for girls' education, Malala's courage and determination have inspired millions around the world.
            </p>
          </div>
          <div className="figure-card">
            <h3>Steve Jobs</h3>
            <p>
              Co-founder of Apple Inc., Steve Jobs revolutionized personal technology through innovation and relentless pursuit of excellence.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerResources;
