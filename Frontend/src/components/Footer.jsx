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
<<<<<<< HEAD
=======
  FaTwitter,
>>>>>>> 8e873ea79fbc5315d326d9a388dcf797b3f4a90a
} from "react-icons/fa";

const Footer = () => {
  const contactDetails = {
<<<<<<< HEAD
    email: "info@learnmalawi.org",
=======
    email: "learnmalaw@gmail.com",
>>>>>>> 8e873ea79fbc5315d326d9a388dcf797b3f4a90a
    whatsapp: "+265 997 674 758",
    office: "Area 8, Biwi, Lilongwe",
  };

  const links = [
<<<<<<< HEAD
    { name: "Study Notes", link: "/study-notes", icon: <FaBook className="footer-icon" /> },
    { name: "Past Papers", link: "/past-papers", icon: <FaFileAlt className="footer-icon" /> },
    { name: "Video Tutorials", link: "/tutorials", icon: <FaVideo className="footer-icon" /> },
    { name: "Practice Quizzes", link: "/quizzes", icon: <FaQuestionCircle className="footer-icon" /> },
=======
    { name: "Study Notes", link: "/study-notes", icon: <FaBook /> },
    { name: "Past Papers", link: "/past-papers", icon: <FaFileAlt /> },
    { name: "Video Tutorials", link: "/tutorials", icon: <FaVideo /> },
    { name: "Practice Quizzes", link: "/quizes", icon: <FaQuestionCircle /> },
>>>>>>> 8e873ea79fbc5315d326d9a388dcf797b3f4a90a
  ];

  return (
    <footer className="FooterWrapper">
      <div className="footer-content">
<<<<<<< HEAD
        
       
=======
        {/* Logo */}
>>>>>>> 8e873ea79fbc5315d326d9a388dcf797b3f4a90a
        <div className="footer-section footer-logo">
          <Link to="/" aria-label="Go to homepage">
            <img src={Logo} alt="Learn Malawi Logo" />
          </Link>
        </div>

<<<<<<< HEAD
        
=======
        {/* Quick Links */}
>>>>>>> 8e873ea79fbc5315d326d9a388dcf797b3f4a90a
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

<<<<<<< HEAD
       
        <address className="footer-section footer-box contact">
          <h3>Contact Us</h3>
          <p>
            <FaEnvelope className="footer-icon" /> 
            <a href={`mailto:${contactDetails.email}`}>{contactDetails.email}</a>
          </p>
          <p>
            <FaWhatsapp className="footer-icon" /> 
=======
        {/* Contact Info */}
        <div className="footer-section footer-box contact">
          <h3>Contact Us</h3>
          <p>
            <FaEnvelope className="footer-icon" />
            <a href={`mailto:${contactDetails.email}`}>{contactDetails.email}</a>
          </p>
          <p>
            <FaWhatsapp className="footer-icon" />
>>>>>>> 8e873ea79fbc5315d326d9a388dcf797b3f4a90a
            <a href={`https://wa.me/${contactDetails.whatsapp.replace(/\s/g, "")}`} target="_blank" rel="noopener noreferrer">
              {contactDetails.whatsapp}
            </a>
          </p>
          <p>
            <FaMapMarkerAlt className="footer-icon" /> {contactDetails.office}
          </p>
<<<<<<< HEAD
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
=======
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
>>>>>>> 8e873ea79fbc5315d326d9a388dcf797b3f4a90a
      </div>
    </footer>
  );
};

<<<<<<< HEAD
export default Footer;
=======
export default Footer;
>>>>>>> 8e873ea79fbc5315d326d9a388dcf797b3f4a90a
