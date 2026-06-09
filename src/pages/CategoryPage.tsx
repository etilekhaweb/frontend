import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import type { Product, Category } from '../lib/api';
import ProductCard from '../components/ProductCard';
import './HomePage.css';

const CategoryPage = () => {
  const { id } = useParams();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    if (!id) {
      setError('Category not specified');
      setIsLoading(false);
      return;
    }

    Promise.all([api.getCategories(), api.getProducts({ categoryId: id })])
      .then(([cats, prods]) => {
        if (!mounted) return;
        setCategory(cats.find((c) => c.id === id) ?? null);
        setProducts(prods);
      })
      .catch((err: Error) => {
        if (mounted) setError(err.message);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  return (
    <motion.div
      className="category-detail-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <section className="signature-section" style={{ padding: '4rem 0' }}>
        <div className="container">
          <span className="section-subtitle">Category</span>
          <h2 className="section-title">{category?.name ?? 'Category'}</h2>
          <div className="section-divider" />

          {isLoading && <p className="state-message">Loading products...</p>}
          {!isLoading && error && <p className="state-message">{error}</p>}

          <div className="signature-grid">
            {products.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.06 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>

          {!isLoading && products.length === 0 && !error && (
            <p className="state-message">No products found in this category.</p>
          )}
        </div>
      </section>
    </motion.div>
  );
};

export default CategoryPage;
