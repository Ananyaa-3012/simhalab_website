import { Link } from 'react-router-dom'
import SimhaLogo from './SimhaLogo'
import iitmLogo from '../assets/iitm_logo.png'
import wsaiLogo from '../assets/wsai_logo.png'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-col">
          <div className="footer-brand">
            <SimhaLogo variant="full" alwaysDark style={{ height: '50px', width: 'auto', maxWidth: '100%' }} />
          </div>
          <div className="footer-logos">
            <img src={iitmLogo} alt="IIT Madras" className="footer-logo" />
            <img src={wsaiLogo} alt="WSAI" className="footer-logo" />
          </div>
          <div className="footer-socials">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">GitHub</a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">LinkedIn</a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter/X">X</a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">YouTube</a>
          </div>
        </div>

        <div className="footer-col">
          <h4>Quick Links</h4>
          <Link to="/people">People</Link>
          <Link to="/research">Research</Link>
          <Link to="/blog">Blog</Link>
          <Link to="/resources">Resources</Link>
          <Link to="/gallery">Gallery</Link>
          <Link to="/contact">Contact</Link>
        </div>

        <div className="footer-col">
          <h4>Contact</h4>
          <p>SIMHA Lab</p>
          <p>Wadhwani School of Data Science and AI</p>
          <p>IIT Madras, Chennai - 600036</p>
          <p>Tamil Nadu, India</p>
          <br />
          <p>Phone: +91-44-2257-XXXX</p>
          <p>Email: simha@iitm.ac.in</p>
          <br />
          <div className="footer-map">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3890.0461599898027!2d80.2270!3d12.9916!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a52677f8b8c8b1d%3A0x9e58b3c7e0508f3b!2sIIT%20Madras!5e0!3m2!1sen!2sin"
              width="100%"
              height="150"
              style={{ border: 0, borderRadius: '8px' }}
              allowFullScreen=""
              loading="lazy"
              title="SIMHA Lab Location"
            ></iframe>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>SIMHA Lab | Wadhwani School of Data Science and AI | IIT Madras &copy; {new Date().getFullYear()}</p>
      </div>
    </footer>
  )
}
