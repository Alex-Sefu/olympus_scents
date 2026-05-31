import { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import './CartToast.css';

export default function CartToast() {
  const { toast } = useCart();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (toast) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [toast]);

  if (!toast) return null;

  return (
    <div className={`cart-toast-popup ${visible ? 'cart-toast-popup--in' : 'cart-toast-popup--out'}`}>
      <span className="cart-toast-icon">✓</span>
      <div className="cart-toast-body">
        <span className="cart-toast-title">Adăugat în coș</span>
        <span className="cart-toast-name">{toast.parfumName}</span>
      </div>
    </div>
  );
}
