import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Heart, User, Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import SearchModal from './SearchModal';
import './Navbar.css';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { cartCount, setIsCartOpen } = useCart();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState<'home' | 'category' | 'collection'>(() => {
    if (location.pathname === '/collections') return 'collection';
    if (location.pathname === '/') return 'home';
    return 'home';
  });

  const scrollOrNavigate = (target: 'top' | 'category' | 'collection') => {
    const doScroll = () => {
      if (target === 'top') return window.scrollTo({ top: 0, behavior: 'smooth' });
      const id = target === 'category' ? 'category-section' : 'signature-creations';
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // mark selected immediately so underline updates on click
    if (target === 'top') setActiveNav('home');
    if (target === 'category') setActiveNav('category');
    if (target === 'collection') setActiveNav('collection');

    setMobileMenuOpen(false);

    if (location.pathname === '/') {
      doScroll();
    } else {
      navigate('/', { state: { scrollTo: target } });
    }
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container nav-container">
        
        {/* Left Links (desktop only) */}
        <div className="nav-links">
          <button type="button" className={`nav-link ${activeNav === 'home' ? 'nav-link-active' : ''}`} onClick={() => scrollOrNavigate('top')}>Home</button>
          <button type="button" className={`nav-link ${activeNav === 'category' ? 'nav-link-active' : ''}`} onClick={() => scrollOrNavigate('category')}>Category</button>
          <button type="button" className={`nav-link ${activeNav === 'collection' ? 'nav-link-active' : ''}`} onClick={() => scrollOrNavigate('collection')}>Collection</button>
        </div>

        {/* Center Brand */}
        <Link to="/" className="nav-brand">
          <div className="brand-diamond"></div>
          <h1>Etilekha</h1>
        </Link>

        {/* Right Actions */}
        <div className="nav-actions">
          <button 
            className="btn-icon" 
            aria-label="Search"
            onClick={() => setIsSearchOpen(true)}
            type="button"
          >
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

          <button
            className="btn-icon mobile-menu-btn"
            aria-label="Menu"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* ===== Mobile Menu ===== */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              className="mobile-menu-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              className="mobile-menu"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            >
              <div className="mobile-menu-header">
                <h3>Etilekha</h3>
                <button
                  className="btn-icon mobile-menu-close"
                  onClick={() => setMobileMenuOpen(false)}
                  type="button"
                  aria-label="Close menu"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="mobile-menu-links">
                <button
                  type="button"
                  className={`mobile-nav-link ${activeNav === 'home' ? 'active' : ''}`}
                  onClick={() => scrollOrNavigate('top')}
                >
                  Home
                </button>
                <button
                  type="button"
                  className={`mobile-nav-link ${activeNav === 'category' ? 'active' : ''}`}
                  onClick={() => scrollOrNavigate('category')}
                >
                  Category
                </button>
                <button
                  type="button"
                  className={`mobile-nav-link ${activeNav === 'collection' ? 'active' : ''}`}
                  onClick={() => scrollOrNavigate('collection')}
                >
                  Collection
                </button>
                <Link
                  to="/admin"
                  className="mobile-nav-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin Dashboard
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </nav>
  );
};

export default Navbar;
