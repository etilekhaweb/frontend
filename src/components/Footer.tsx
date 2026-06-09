import { Link } from 'react-router-dom';
import { Mail, MapPin } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <Link to="/" className="nav-brand">
              <div className="brand-diamond"></div>
              <h2>Etilekha</h2>
            </Link>
            <p>
              Every piece is a testament to our commitment to excellence and heritage.
            </p>
          </div>

          <div className="footer-section">
            <h4>Collections</h4>
            <ul>
              <li><Link to="/collections/royal-nizam">The Royal Nizam</Link></li>
              <li><Link to="/collections/temple-heritage">Temple Heritage</Link></li>
              <li><Link to="/collections/modern-filigree">Modern Filigree</Link></li>
              <li><Link to="/collections/bridal-chooda">Bridal Chooda</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Customer Care</h4>
            <ul>
              <li><Link to="/sizing-guide">Sizing Guide</Link></li>
              <li><Link to="/shipping-returns">Shipping & Returns</Link></li>
              <li><Link to="/track-order">Track Your Order</Link></li>
              <li><Link to="/authenticity">Authenticity Check</Link></li>
            </ul>
          </div>

          <div className="footer-section footer-contact">
            <h4>Contact</h4>
            <ul>
              <li>
                <Mail size={16} color="var(--color-accent)" />
                <span>concierge@etilekha.com</span>
              </li>
              <li>
                <MapPin size={16} color="var(--color-accent)" />
                <span>Head Office: House 40 Road 21 Sector 14,Uttara, Dhaka</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>Copyright 2026 ETILEKHA BANGLES. CRAFTED IN Bangladesh.</p>
          <div className="footer-links">
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms-of-service">Terms of Service</Link>
            <Link to="/cookie-settings">Cookie Settings</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
