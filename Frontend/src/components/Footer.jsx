import Logo from "../images/Logo.png";
import { Link } from "react-router-dom";
import "../styles/footer.css";
import {
  FaBook,
  FaFileAlt,
  FaVideo,
  FaQuestionCircle,
  FaEnvelope,
  FaWhatsapp,
  FaMapMarkerAlt,
  FaFacebook,
  FaYoutube,
  FaInstagram,
} from "react-icons/fa";

const Footer = () => {
  const contactDetails = {
    email: "info@learnmalawi.org",
    whatsapp: "+265 997 674 758",
    office: "Area 8, Biwi, Lilongwe",
  };

  const links = [
    { name: "Study Notes", link: "/study-notes", icon: <FaBook className="footer-icon" /> },
    { name: "Past Papers", link: "/past-papers", icon: <FaFileAlt className="footer-icon" /> },
    { name: "Video Tutorials", link: "/tutorials", icon: <FaVideo className="footer-icon" /> },
    { name: "Practice Quizzes", link: "/quizzes", icon: <FaQuestionCircle className="footer-icon" /> },
  ];

  return (
    <footer className="FooterWrapper">
      <div className="footer-content">
        
       
        <div className="footer-section footer-logo">
          <Link to="/" aria-label="Go to homepage">
            <img src={Logo} alt="Learn Malawi Logo" />
          </Link>
        </div>

        
        <div className="footer-section footer-box quick-links">
          <h3>Quick Links</h3>
          <ul>
            {links.map((item, index) => (
              <li key={index}>
                <Link to={item.link}>
                  {item.icon} <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

       
        <address className="footer-section footer-box contact">
          <h3>Contact Us</h3>
          <p>
            <FaEnvelope className="footer-icon" /> 
            <a href={`mailto:${contactDetails.email}`}>{contactDetails.email}</a>
          </p>
          <p>
            <FaWhatsapp className="footer-icon" /> 
            <a href={`https://wa.me/${contactDetails.whatsapp.replace(/\s/g, "")}`} target="_blank" rel="noopener noreferrer">
              {contactDetails.whatsapp}
            </a>
          </p>
          <p>
            <FaMapMarkerAlt className="footer-icon" /> {contactDetails.office}
          </p>
        </address>
      </div>
        
      
      <div className="social-icons">
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Visit our Facebook">
          <FaFacebook />
        </a>
        <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="Visit our YouTube channel">
          <FaYoutube />
        </a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Visit our Instagram">
          <FaInstagram />
        </a>
      </div>

      <hr />

      
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Learn Malawi. All Rights Reserved.</p>
        <div className="legal-links">
          <Link to="/privacy-policy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
          <Link to="/support">Support</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
