import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Loader } from 'lucide-react';
import { api, formatCurrency } from '../lib/api';
import type { Product } from '../lib/api';
import './SearchModal.css';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const SearchModal = ({ isOpen, onClose }: Props) => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Load all products once on mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        setError('');
        const products = await api.getProducts();
        setAllProducts(products);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load products');
        console.error('Search: failed to load products', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      loadProducts();
    }
  }, [isOpen]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Search results - filter by query
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    return allProducts.filter((product) => {
      const name = product.name.toLowerCase();
      const description = (product.description || '').toLowerCase();
      const shortDesc = product.shortDescription.toLowerCase();
      const categoryName = (product.category?.name || '').toLowerCase();

      return (
        name.includes(query) ||
        description.includes(query) ||
        shortDesc.includes(query) ||
        categoryName.includes(query)
      );
    });
  }, [searchQuery, allProducts]);

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
    onClose();
    setSearchQuery('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="search-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="search-modal"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, type: 'spring', damping: 25 }}
          >
            {/* Header */}
            <div className="search-header">
              <h2 className="search-title">Search Products</h2>
              <button
                className="btn-icon search-close"
                onClick={onClose}
                aria-label="Close search"
                type="button"
              >
                <X size={24} />
              </button>
            </div>

            {/* Search Input */}
            <div className="search-input-wrapper">
              <Search className="search-input-icon" size={20} />
              <input
                ref={inputRef}
                type="text"
                className="search-input"
                placeholder="Search products, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search products"
              />
              {searchQuery && (
                <button
                  className="btn-clear-search"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  type="button"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Results Container */}
            <div className="search-results-container">
              {/* Loading State */}
              {isLoading && !searchQuery && (
                <div className="search-state">
                  <Loader className="spinner" size={32} />
                  <p>Loading products...</p>
                </div>
              )}

              {/* Error State */}
              {error && !searchQuery && (
                <div className="search-state">
                  <p className="error-message">⚠️ {error}</p>
                  <button
                    className="btn-retry"
                    onClick={() => window.location.reload()}
                    type="button"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {/* No Query */}
              {!searchQuery && !isLoading && !error && (
                <div className="search-state">
                  <p className="hint-text">Start typing to search products...</p>
                </div>
              )}

              {/* Search Results */}
              {searchQuery && searchResults.length > 0 && (
                <motion.div
                  className="search-results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="results-count">
                    {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                  </p>
                  <div className="results-list">
                    {searchResults.map((product, idx) => (
                      <motion.button
                        key={product.id}
                        className="search-result-item"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: idx * 0.03 }}
                        onClick={() => handleProductClick(product.id)}
                        type="button"
                      >
                        <div className="result-image-wrapper">
                          <img
                            src={product.mainImage}
                            alt={product.name}
                            className="result-image"
                          />
                        </div>
                        <div className="result-info">
                          <h4 className="result-name">{product.name}</h4>
                          <p className="result-desc">{product.shortDescription}</p>
                          <div className="result-meta">
                            <span className="result-price">
                              {formatCurrency(product.price)}
                            </span>
                            {product.category && (
                              <span className="result-category">
                                {product.category.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* No Results */}
              {searchQuery && searchResults.length === 0 && !isLoading && (
                <div className="search-state">
                  <p className="no-results-text">
                    No products found for "{searchQuery}"
                  </p>
                  <p className="no-results-hint">
                    Try different keywords or browse our collections
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SearchModal;
