import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { api, formatCurrency } from '../lib/api';
import type { Product, ProductVariation } from '../lib/api';
import './ProductDetailPage.css';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, ProductVariation | null>>({});
  const [activeImage, setActiveImage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    api.getProduct(id)
      .then((data) => {
        if (!isMounted) return;
        setProduct(data);
        setActiveImage(data.mainImage);

        // Initialize selected options: pick first option per variation name
        const map: Record<string, ProductVariation | null> = {};
        (data.variations ?? []).forEach((v) => {
          if (!map[v.name]) map[v.name] = v;
        });
        setSelectedOptions(map);
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
  }, [id]);

  useEffect(() => {
    if (!product) return;
    const firstOpt = Object.values(selectedOptions).find(Boolean);
    if (firstOpt?.imageUrl) setActiveImage(firstOpt.imageUrl);
    else setActiveImage(product.mainImage);
  }, [product, selectedOptions]);

  const variationGroups = useMemo(() => {
    if (!product) return [] as Array<{ name: string; options: ProductVariation[] }>;
    const groups: Record<string, ProductVariation[]> = {};
    (product.variations ?? []).forEach((v) => {
      groups[v.name] = groups[v.name] ?? [];
      groups[v.name].push(v);
    });
    return Object.keys(groups).map((name) => ({ name, options: groups[name] }));
  }, [product]);

  const galleryImages = useMemo(() => {
    if (!product) return [];
    return [product.mainImage, ...product.images.map((image) => image.url)];
  }, [product]);

  const finalPrice = product
    ? product.price + Object.values(selectedOptions).reduce((sum, opt) => sum + (opt?.priceAdded ?? 0), 0)
    : 0;
  const cartName = product
    ? `${product.name}${Object.values(selectedOptions).filter(Boolean).map((opt) => ` - ${opt!.name}: ${opt!.value}`).join('')}`
    : '';

  const addCurrentProductToCart = () => {
    if (!product) return;
    // choose a primary variation id (first selected option) to store as variationId for compatibility
    const primaryOpt = Object.values(selectedOptions).find(Boolean) ?? null;
    addToCart({
      productId: product.id,
      variationId: primaryOpt?.id,
      variationName: Object.values(selectedOptions).filter(Boolean).map((opt) => `${opt!.name}: ${opt!.value}`).join(', '),
      name: cartName,
      price: finalPrice,
      quantity: 1,
      image: primaryOpt?.imageUrl ?? product.mainImage,
    });
  };

  const handleBuyNow = () => {
    addCurrentProductToCart();
    navigate('/checkout');
  };

  if (isLoading) {
    return <div className="container page-state">Loading product...</div>;
  }

  if (error || !product) {
    return (
      <div className="container page-state">
        <h2>Product not found</h2>
        <p>{error || 'This product is not available.'}</p>
        <button className="btn-primary" onClick={() => navigate('/')} type="button">Return to Shop</button>
      </div>
    );
  }

  return (
    <motion.div
      className="product-detail-page container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="product-detail-container">
        <div className="product-gallery">
          <div className="gallery-thumbnails">
            {galleryImages.map((img, idx) => (
              <img
                key={`${product.id}-thumb-${idx}`}
                src={img}
                alt={product.name}
                className={`thumbnail ${activeImage === img ? 'active' : ''}`}
                onMouseEnter={() => setActiveImage(img)}
                onClick={() => setActiveImage(img)}
              />
            ))}
          </div>

          <div className="gallery-main">
            <motion.img
              key={activeImage}
              src={activeImage}
              alt={product.name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
            
          </div>
        </div>

        <div className="product-info-section">
          <span className="product-collection">{product.category?.name ?? 'Etilekha Collection'}</span>

          <h1 className="product-title-large">
            {product.name}
            <span className="title-light">Handcrafted</span>
          </h1>

          <p className="product-desc-large">{product.description || product.shortDescription}</p>

          <div className="price-section">
            <span className="current-price">{formatCurrency(finalPrice)}</span>
          </div>

          {variationGroups.length > 0 && (
            <div className="variation-selector">
              <span className="var-label">Variation</span>
              <div className="variation-groups">
                {variationGroups.map((group) => (
                  <div key={group.name} className="variation-group-block">
                    <div className="variation-group-label">{group.name}</div>
                    <div className="variation-options">
                      {group.options.map((opt) => (
                        <button
                          key={opt.id}
                          className={`variation-choice ${selectedOptions[opt.name]?.id === opt.id ? 'active' : ''}`}
                          onClick={() => {
                            setSelectedOptions((curr) => ({ ...curr, [opt.name]: opt }));
                            if (opt.imageUrl) setActiveImage(opt.imageUrl);
                          }}
                          type="button"
                        >
                          {opt.value}
                          {opt.priceAdded > 0 ? ` +${formatCurrency(opt.priceAdded)}` : ''}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="actions-row">
            <button className="btn-primary btn-large" onClick={handleBuyNow} type="button">
              Buy Now
            </button>
            <button className="btn-secondary btn-large" onClick={addCurrentProductToCart} type="button">
              Add to Cart
            </button>
          </div>

          
        </div>
      </div>
    </motion.div>
  );
};

export default ProductDetailPage;
