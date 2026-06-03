import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Heart, User, Menu } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const { cartCount, setIsCartOpen } = useCart();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container nav-container">
        
        {/* Left Links */}
        <div className="nav-links">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'nav-link-active' : ''}`}>Home</Link>
          <Link to="/collections" className={`nav-link ${location.pathname === '/collections' ? 'nav-link-active' : ''}`}>Collections</Link>
          <Link to="/heritage" className={`nav-link ${location.pathname === '/heritage' ? 'nav-link-active' : ''}`}>Heritage</Link>
        </div>

        {/* Center Brand */}
        <Link to="/" className="nav-brand">
          <div className="brand-diamond"></div>
          <h1>Etilekha</h1>
        </Link>

        {/* Right Actions */}
        <div className="nav-actions">
          <button className="btn-icon" aria-label="Search">
            <Search size={20} />
          </button>
          
          <button className="btn-icon cart-icon-wrapper" aria-label="Cart" onClick={() => setIsCartOpen(true)}>
            <Heart size={20} />
            {cartCount > 0 && (
              <span className="cart-badge">{cartCount}</span>
            )}
          </button>

          <Link to="/admin" className="btn-icon" aria-label="Account">
            <User size={20} />
          </Link>

          <button className="btn-icon mobile-menu-btn" aria-label="Menu">
            <Menu size={24} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
