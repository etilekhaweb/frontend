import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { api, formatCurrency } from '../lib/api';
import './CheckoutPage.css';

const getGuestDeviceId = () => {
  const key = 'etilekha_guest_device_id';
  const saved = localStorage.getItem(key);
  if (saved) return saved;

  const id = crypto.randomUUID();
  localStorage.setItem(key, id);
  return id;
};

const CheckoutPage = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
  });

  const shippingAddress = useMemo(
    () => [formData.address, formData.city, formData.postalCode].filter(Boolean).join(', '),
    [formData.address, formData.city, formData.postalCode],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await api.createOrder({
        guestDeviceId: getGuestDeviceId(),
        customerName: `${formData.firstName} ${formData.lastName}`.trim(),
        customerEmail: formData.email,
        customerPhone: formData.phone,
        shippingAddress,
        items: cart.map((item) => ({
          productId: item.productId,
          variationId: item.variationId,
          quantity: item.quantity,
          priceAtOrder: item.price,
        })),
      });

      clearCart();
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not place order');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container" style={{ padding: '10rem 0', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--color-accent)' }}>Your cart is empty</h2>
        <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)' }}>Browse our collections to find your perfect piece.</p>
        <button className="btn-primary" style={{ marginTop: '2rem' }} onClick={() => navigate('/')} type="button">Return to Shop</button>
      </div>
    );
  }

  return (
    <motion.div
      className="checkout-page container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="checkout-container">
        <div className="checkout-summary">
          <h2 className="summary-title">Order Summary</h2>
          <div className="summary-items">
            {cart.map((item) => (
              <div key={`${item.productId}-${item.variationId || 'base'}`} className="summary-item">
                <img src={item.image} alt={item.name} className="summary-img" />
                <div className="summary-details">
                  <h4 className="summary-item-name">{item.name}</h4>
                  {item.variationName && <p className="summary-item-var">{item.variationName}</p>}
                  <p className="summary-item-var">Qty: {item.quantity}</p>
                </div>
                <div className="summary-item-price">
                  {formatCurrency(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          <div className="summary-totals">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{formatCurrency(cartTotal)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>Complimentary</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>{formatCurrency(cartTotal)}</span>
            </div>
          </div>
        </div>

        <div className="checkout-form-section">
          <h2>Customer Details</h2>
          <form onSubmit={handleConfirm}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input required type="text" name="firstName" className="form-input" value={formData.firstName} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input required type="text" name="lastName" className="form-input" value={formData.lastName} onChange={handleChange} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input required type="email" name="email" className="form-input" value={formData.email} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input required type="tel" name="phone" className="form-input" value={formData.phone} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label className="form-label">Shipping Address</label>
              <input required type="text" name="address" className="form-input" value={formData.address} onChange={handleChange} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">City / State</label>
                <input required type="text" name="city" className="form-input" value={formData.city} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Postal Code</label>
                <input required type="text" name="postalCode" className="form-input" value={formData.postalCode} onChange={handleChange} />
              </div>
            </div>

            {error && <p className="form-error">{error}</p>}

            <div className="checkout-action">
              <button type="submit" className="btn-confirm" disabled={isSubmitting}>
                {isSubmitting ? 'Placing Order...' : 'Confirm & Place Order'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default CheckoutPage;
