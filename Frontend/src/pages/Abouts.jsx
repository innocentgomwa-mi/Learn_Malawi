import React from "react";
import "../styles/abouts.css";
import { FaUsers, FaBullseye, FaLightbulb, FaChalkboardTeacher, FaBookOpen, FaClock, FaProjectDiagram } from "react-icons/fa";
import inno from "../images/inno.jpg";
import willard from "../images/willard.JPG";

const About = () => {
  const teamMembers = [
    { name: "Willard Zimba", role: "Founder", bio: "Passionate about education in Malawi.", image: willard },
    { name: "Willard Zimba", role: "Content Lead", bio: "Ensures quality learning resources.", image: willard },
    { name: "Innocent Frank Gomwa", role: "Developer", bio: "Builds the Learn Malawi platform.", image: inno },
  ];

  const missionVision = [
    {
      title: "Mission",
      description:
        "To transform secondary education in Malawi by providing equitable access to a comprehensive, free digital learning platform that enhances student engagement, improves academic performance, and fosters lifelong learning for all, regardless of geographic or socioeconomic barriers.",
      icon: FaBullseye,
    },
    {
      title: "Vision",
      description:
        "To be the leading catalyst for educational equity in Malawi, where every secondary student has the tools and opportunity to achieve their full academic potential, thereby contributing to an educated, innovative, and prosperous nation as envisioned by Malawi 2063.",
      icon: FaLightbulb,
    },
  ];

  const values = [
    { title: "Equity and Inclusion", description: "We believe every student deserves access to quality education...", icon: FaUsers },
    { title: "Quality and Relevance", description: "We uphold the highest standards of educational content...", icon: FaChalkboardTeacher },
    { title: "Innovation and Adaptability", description: "We embrace technology as a powerful tool for change...", icon: FaProjectDiagram },
    { title: "Collaboration and Partnership", description: "We achieve more together...", icon: FaBookOpen },
  ];

  const philosophyPoints = [
    { text: "Active Recall and Spaced Repetition: Through interactive quizzes and progressive learning paths, we help students strengthen memory retention and master concepts over time.", icon: FaClock },
    { text: "Multimodal Learning: We cater to diverse learning styles by offering content in various formats—text, video, audio, and interactive exercises.", icon: FaLightbulb },
    { text: "Formative Assessment: Our platform provides instant feedback and detailed analytics.", icon: FaChalkboardTeacher },
    { text: "Contextualized Learning: By using local examples and offering content in both English and Chichewa.", icon: FaUsers },
  ];

  return (
    <div className="about-wrapper">
      <section className="story-section">
        <h2>Our Story</h2>
        <p>
          <br />
          Learn Malawi is a free digital education platform dedicated to one
          powerful goal: Free, Quality Education for Every Malawian Student.
          <br /> We provide comprehensive, curriculum-aligned learning resources
          for JCE and MSCE students across Malawi...
        </p>
      </section>

      
      <section className="mission-vision">
        <h2>Mission & Vision</h2>
        <div className="mv-grid">
          {missionVision.map((mv, index) => {
            const Icon = mv.icon;
            return (
              <div key={index} className="mv-card">
                <Icon className="mv-icon" />
                <h3>{mv.title}</h3>
                <p>{mv.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      
      <section className="values-section">
        <h2>Our Values</h2>
        <div className="values-grid">
          {values.map((val, index) => {
            const Icon = val.icon;
            return (
              <div key={index} className="value-card">
                <Icon className="value-icon" />
                <h3>{val.title}</h3>
                <p>{val.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      
      <section className="philosophy-section">
        <h2>Our Educational Philosophy</h2>
        <ul className="philosophy-list">
          {philosophyPoints.map((point, index) => {
            const Icon = point.icon;
            return (
              <li key={index}>
                <Icon className="philosophy-icon" /> {point.text}
              </li>
            );
          })}
        </ul>
      </section>

      
      <section className="team-section">
        <h2>Meet Our Team</h2>
        <div className="team-grid">
          {teamMembers.map((member, index) => (
            <div key={index} className="team-card">
              <img src={member.image} alt={member.name} className="team-image" />
              <h3>{member.name}</h3>
              <p>{member.role}</p>
              <p>{member.bio}</p>
            </div>
          ))}
        </div>
      </section>

      
      <section className="contact-section">
        <h2>Contact Us</h2>
        <p>If you have any questions or suggestions, feel free to reach out to us!</p>
        <p>Mr Willard Zimba on +265 997 67 47 58 OR Mr Innocent Gomwa on +265 883 36 08 44</p>
        <form className="contact-form">
          <input type="text" name="name" placeholder="Your Name" required />
          <input type="email" name="email" placeholder="Your Email" required />
          <textarea name="message" rows="5" placeholder="Your Message" required></textarea>
          <button type="submit">Send Message</button>
        </form>
      </section>
    </div>
  );
};

export default About;
