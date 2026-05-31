import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import type { CartItem, Parfum } from '../types';

interface ToastMsg {
  id: number;
  text: string;
  parfumName: string;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  total: number;
  loading: boolean;
  addingId: string | null;          // parfum_id care se încarcă momentan
  toast: ToastMsg | null;           // mesaj toast activ
  addItem: (parfum: Parfum, quantity?: number) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refetch: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastMsg | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchCart = useCallback(async () => {
    if (!user) { setItems([]); return; }
    setLoading(true);
    const { data } = await supabase
      .from('cart_items')
      .select('*, parfum:parfumuri(*)')
      .eq('user_id', user.id)
      .order('added_at', { ascending: true });
    setItems((data as CartItem[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  function showToast(parfumName: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), text: 'Adăugat în coș!', parfumName });
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }

  async function addItem(parfum: Parfum, quantity = 1) {
    if (!user) return;
    setAddingId(parfum.id);
    const existing = items.find(i => i.parfum_id === parfum.id);
    if (existing) {
      await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('cart_items')
        .insert({ user_id: user.id, parfum_id: parfum.id, quantity });
    }
    await fetchCart();
    setAddingId(null);
    showToast(parfum.nume_parfum);
  }

  async function removeItem(cartItemId: string) {
    await supabase.from('cart_items').delete().eq('id', cartItemId);
    fetchCart();
  }

  async function updateQuantity(cartItemId: string, quantity: number) {
    if (quantity <= 0) { await removeItem(cartItemId); return; }
    await supabase.from('cart_items').update({ quantity }).eq('id', cartItemId);
    fetchCart();
  }

  async function clearCart() {
    if (!user) return;
    await supabase.from('cart_items').delete().eq('user_id', user.id);
    setItems([]);
  }

  const itemCount = items.reduce((s, i) => s + i.quantity, 0);
  const total     = items.reduce((s, i) => s + (i.parfum?.pret ?? 0) * i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items, itemCount, total, loading,
      addingId, toast,
      addItem, removeItem, updateQuantity, clearCart, refetch: fetchCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart trebuie folosit în CartProvider');
  return ctx;
}
