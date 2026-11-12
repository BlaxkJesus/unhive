import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product } from '../types';

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedCombo?: string;
}

export type DeliveryMode = 'pickup' | 'batch_evening' | 'express';

export interface VendorPackage {
  vendorId: string;
  vendorName: string;
  packageLetter: string;
  items: CartItem[];
  subtotal: number;
  runnerFee: number;
}

interface CartContextType {
  cartItems: CartItem[];
  totalCount: number;
  subtotal: number;
  platformTechFee: number;
  courierDeliveryFee: number;
  totalAmount: number;
  vendorPackages: VendorPackage[];
  deliveryMode: DeliveryMode;
  setDeliveryMode: (mode: DeliveryMode) => void;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (
    product: Product,
    quantity?: number,
    options?: { size?: string; combo?: string }
  ) => { success: boolean; message?: string };
  updateQuantity: (
    productId: string,
    quantity: number,
    options?: { size?: string; combo?: string }
  ) => void;
  removeFromCart: (
    productId: string,
    options?: { size?: string; combo?: string }
  ) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'unihive_cart_items';
const PLATFORM_TECH_FEE = 100;

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load cart from storage', e);
    }
    return [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (e) {
      console.warn('Failed to save cart to storage', e);
    }
  }, [cartItems]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addToCart = (
    product: Product,
    quantity = 1,
    options?: { size?: string; combo?: string }
  ): { success: boolean; message?: string } => {
    if (product.stockQuantity <= 0 || !product.isActive) {
      return {
        success: false,
        message: 'This item is currently out of stock and cannot be added to cart.',
      };
    }

    let addedOrUpdated = false;
    let limitReached = false;

    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedSize === options?.size &&
          item.selectedCombo === options?.combo
      );

      if (existingIndex > -1) {
        const existing = prev[existingIndex];
        const newQty = existing.quantity + quantity;
        const clampedQty = Math.min(newQty, product.stockQuantity);
        if (newQty > product.stockQuantity) {
          limitReached = true;
        }
        addedOrUpdated = true;
        const updated = [...prev];
        updated[existingIndex] = {
          ...existing,
          quantity: clampedQty,
          // Keep product metadata fresh
          product,
        };
        return updated;
      }

      const initialQty = Math.min(Math.max(1, quantity), product.stockQuantity);
      addedOrUpdated = true;
      return [
        ...prev,
        {
          product,
          quantity: initialQty,
          selectedSize: options?.size,
          selectedCombo: options?.combo,
        },
      ];
    });

    if (limitReached) {
      return {
        success: true,
        message: `Added to cart (clamped to max available stock of ${product.stockQuantity}).`,
      };
    }

    return {
      success: addedOrUpdated,
      message: `${product.title} added to your Hive Cart!`,
    };
  };

  const updateQuantity = (
    productId: string,
    quantity: number,
    options?: { size?: string; combo?: string }
  ) => {
    setCartItems((prev) => {
      if (quantity <= 0) {
        return prev.filter(
          (item) =>
            !(
              item.product.id === productId &&
              item.selectedSize === options?.size &&
              item.selectedCombo === options?.combo
            )
        );
      }

      return prev.map((item) => {
        if (
          item.product.id === productId &&
          item.selectedSize === options?.size &&
          item.selectedCombo === options?.combo
        ) {
          const maxStock = item.product.stockQuantity || 1;
          return {
            ...item,
            quantity: Math.min(quantity, maxStock),
          };
        }
        return item;
      });
    });
  };

  const removeFromCart = (
    productId: string,
    options?: { size?: string; combo?: string }
  ) => {
    setCartItems((prev) =>
      prev.filter(
        (item) =>
          !(
            item.product.id === productId &&
            item.selectedSize === options?.size &&
            item.selectedCombo === options?.combo
          )
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear cart storage', e);
    }
  };

  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('batch_evening');

  // Group items by vendor
  const packageLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const vendorPackagesMap = cartItems.reduce<Record<string, VendorPackage>>((acc, item) => {
    const vendorId = item.product.vendorId || 'unknown-vendor';
    const vendorName = item.product.vendor?.businessName || 'Campus Vendor Hive';

    if (!acc[vendorId]) {
      const existingVendorIndex = Object.keys(acc).length;
      acc[vendorId] = {
        vendorId,
        vendorName,
        packageLetter: packageLetters[existingVendorIndex] || `Pkg-${existingVendorIndex + 1}`,
        items: [],
        subtotal: 0,
        runnerFee: 0,
      };
    }

    acc[vendorId].items.push(item);
    acc[vendorId].subtotal += item.product.price * item.quantity;
    return acc;
  }, {});

  const vendorPackages = Object.values(vendorPackagesMap);
  const vendorCount = vendorPackages.length;

  // Dynamic courier delivery fee based on mode (Pickup: ₦0, Batch: ₦500, Express: ₦1,500)
  let courierDeliveryFee = 0;
  if (vendorCount > 0) {
    if (deliveryMode === 'pickup') {
      courierDeliveryFee = 0;
    } else if (deliveryMode === 'batch_evening') {
      courierDeliveryFee = 500;
    } else {
      courierDeliveryFee = 1500;
    }
  }

  // Allocate courier fee across packages for display
  const feePerPackage = vendorCount > 0 ? Math.round(courierDeliveryFee / vendorCount) : 0;
  vendorPackages.forEach((pkg) => {
    pkg.runnerFee = feePerPackage;
  });

  const totalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const platformTechFee = cartItems.length > 0 ? PLATFORM_TECH_FEE : 0;
  const totalAmount = subtotal + platformTechFee + courierDeliveryFee;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalCount,
        subtotal,
        platformTechFee,
        courierDeliveryFee,
        totalAmount,
        vendorPackages,
        deliveryMode,
        setDeliveryMode,
        isCartOpen,
        openCart,
        closeCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
