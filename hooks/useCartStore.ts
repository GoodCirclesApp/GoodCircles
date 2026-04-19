
import { useState } from 'react';
import { Product, CartItem } from '../types';
import { showToast } from './toast';

export function useCartStore() {
  const [cart, setCart] = useState<CartItem[]>([]);
  // Updated state type to include 'BALANCE' to resolve overlap comparison errors in views
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'BALANCE'>('CARD');
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (product: Product, quantity: number = 1) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        showToast(`${product.name} quantity updated`, 'success');
        return prev.map(i => i.product.id === product.id
          ? { ...i, quantity: i.quantity + quantity }
          : i
        );
      }
      showToast(`${product.name} added to basket`, 'success');
      return [...prev, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const item = prev.find(i => i.product.id === productId);
      if (item) showToast(`${item.product.name} removed from basket`, 'info');
      return prev.filter(i => i.product.id !== productId);
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(i => i.product.id === productId ? { ...i, quantity } : i));
  };

  return {
    cart,
    setCart,
    paymentMethod,
    setPaymentMethod,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    removeFromCart,
    updateQuantity
  };
}
