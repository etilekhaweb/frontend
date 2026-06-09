import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, Diamond, Sparkles, Users } from 'lucide-react';
import { api, formatCurrency } from '../lib/api';
import type { Category, Product } from '../lib/api';
import './HomePage.css';
import ProductCard from '../components/ProductCard';

const CATEGORY_ICONS = [Clock, Diamond, Sparkles, Users];

const HomePage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    Promise.all([api.getCategories(), api.getProducts({ isSignature: true })])
      .then(([categoryData, productData]) => {
        if (!isMounted) return;
        setCategories(categoryData);
        setProducts(productData);
      })
      .catch((err: Error) => {
        if (isMounted) setError(err.message);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Scroll when navigated with state.scrollTo (from Navbar)
  useEffect(() => {
    const state: any = (location && (location as any).state) || {};
    const target = state?.scrollTo as string | undefined;
    if (!target) return;
    setTimeout(() => {
      if (target === 'top') return window.scrollTo({ top: 0, behavior: 'smooth' });
      const id = target === 'category' ? 'category-section' : 'signature-creations';
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  }, [location]);

  // product card add-to-cart handled by `ProductCard` component

  return (
    <motion.div
      className="homepage"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <section className="hero-section container">
        <div className="hero-container">
          <motion.div
            className="hero-image-wrapper"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="hero-image-border"></div>
            <img
              src="https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=1200"
              alt="Etilekha Bangles"
              className="hero-image"
            />
          </motion.div>

          <motion.div
            className="hero-content"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <span className="hero-subtitle">Est. 2025 - Handcrafted</span>
            <h1 className="hero-title">
              Legacy in <span className="hero-title-accent">Every Curve.</span>
            </h1>
            <p className="hero-description">
              Discover the Etilekha collection, where ancient Indian heritage meets modern sophistication.
              Hand-forged bangles made to carry tradition with quiet confidence.
            </p>
            <div className="hero-actions">
              <a className="btn-primary" href="#signature-creations">
                View Collection <ArrowRight size={18} />
              </a>

            </div>
          </motion.div>
        </div>
      </section>

      <section className="category-section" id="category-section">
        <div className="container">
          <span className="section-subtitle">Our Legacy</span>
          <h2 className="section-title">Shop by Heritage</h2>
          <p className="section-description">
            Browse curated collections defined by their unique lineage and artistic soul.
          </p>
          <div className="section-divider"></div>

          {isLoading && <p className="state-message">Loading collections...</p>}
          {!isLoading && error && <p className="state-message">{error}</p>}
          {!isLoading && !error && categories.length === 0 && (
            <p className="state-message">No collections have been added yet.</p>
          )}

          <div className="category-grid">
            {categories.map((category, idx) => {
              const Icon = CATEGORY_ICONS[idx % CATEGORY_ICONS.length];
              return (
                <motion.div
                  key={category.id}
                  className="category-card"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  onClick={() => navigate(`/category/${category.id}`)}
                  role="button"
                  tabIndex={0}
                >
                  <img
                    src={category.imageUrl || 'https://images.unsplash.com/photo-1599643478524-fb66f70a00ea?auto=format&fit=crop&q=80&w=800'}
                    alt={category.name}
                    className="category-image"
                  />
                  <div className="category-overlay">
                    <div className="category-icon"><Icon size={24} /></div>
                    <span className="category-count">{category._count?.products ?? 0} PIECES</span>
                    <h3 className="category-name">{category.name}</h3>
                    <ArrowRight size={20} className="category-arrow" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="signature-section" id="signature-creations">
        <div className="container" style={{ textAlign: 'center' }}>
          <span className="section-subtitle">Curated Pieces</span>
          <h2 className="section-title">Signature Creations</h2>
          <p className="section-description">
            From temple-inspired carvings to modern minimal gold work, explore the most coveted designs of the season.
          </p>
          <div className="section-divider"></div>

          {!isLoading && !error && products.length === 0 && (
            <p className="state-message">No signature products have been added yet.</p>
          )}

          <div className="signature-grid">
            {products.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>

          <div className="catalog-action">
            <a className="btn-catalog-outline" href="#signature-creations">
              Explore Full Catalog
            </a>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default HomePage;
