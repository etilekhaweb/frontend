import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { formatCurrency, type Product } from '../lib/api';
import { useCart } from '../context/CartContext';

type Props = {
  product: Product;
};

export default function ProductCard({ product }: Props) {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.mainImage,
    });
  };

  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`} className="product-image-container">
        <span className="product-badge">{product.isSignature ? 'Signature' : 'New Arrival'}</span>
        <img src={product.mainImage} alt={product.name} className="product-image" />
      </Link>

      <div className="product-info" style={{ textAlign: 'left' }}>
        <div className="product-header">
          <Link to={`/product/${product.id}`}>
            <h3 className="product-title">{product.name}</h3>
          </Link>
          <span className="product-price">{formatCurrency(product.price)}</span>
        </div>
        <p className="product-desc">{product.shortDescription}</p>
        <div className="product-footer">
          <span className="product-auth">Authenticity Guaranteed</span>
          <button
            className="btn-icon btn-add-cart"
            aria-label="Add to cart"
            onClick={handleAddToCart}
            type="button"
          >
            <Heart size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
