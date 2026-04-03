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
  FaTwitter,
} from "react-icons/fa";

const Footer = () => {
  const contactDetails = {
    email: "learnmalaw@gmail.com",
    whatsapp: "+265 997 674 758",
    office: "Area 8, Biwi, Lilongwe",
  };

  const links = [
    { name: "Study Notes", link: "/study-notes", icon: <FaBook /> },
    { name: "Past Papers", link: "/past-papers", icon: <FaFileAlt /> },
    { name: "Video Tutorials", link: "/tutorials", icon: <FaVideo /> },
    { name: "Practice Quizzes", link: "/quizes", icon: <FaQuestionCircle /> },
  ];

  return (
    <footer className="FooterWrapper">
      <div className="footer-content">
        {/* Logo */}
        <div className="footer-section footer-logo">
          <Link to="/" aria-label="Go to homepage">
            <img src={Logo} alt="Learn Malawi Logo" />
          </Link>
        </div>

        {/* Quick Links */}
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

        {/* Contact Info */}
        <div className="footer-section footer-box contact">
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
        </div>
      </div>

<div className="social-icons">
  <a 
    href="https://x.com/LearnMalawi/" 
    target="_blank" 
    rel="noopener noreferrer" 
    aria-label="Twitter"
    className="twitter"
  >
    <FaTwitter />
  </a>
  <a 
    href="https://www.instagram.com/LearnMalawi" 
    target="_blank" 
    rel="noopener noreferrer" 
    aria-label="Instagram"
    className="instagram"
  >
    <FaInstagram />
  </a>
  <a 
    href="https://www.facebook.com/LearnMalawi" 
    target="_blank" 
    rel="noopener noreferrer" 
    aria-label="Facebook"
    className="facebook"
  >
    <FaFacebook />
  </a>
</div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Learn Malawi. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;