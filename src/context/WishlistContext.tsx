import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

interface WishlistContextType {
  wishlistIds: Set<string>;
  loading: boolean;
  toggle: (parfumId: string) => Promise<void>;
  isWishlisted: (parfumId: string) => boolean;
  count: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!user) { setWishlistIds(new Set()); return; }
    setLoading(true);
    const { data } = await supabase
      .from('wishlist_items')
      .select('parfum_id')
      .eq('user_id', user.id);
    setWishlistIds(new Set((data ?? []).map((r: { parfum_id: string }) => r.parfum_id)));
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchWishlist(); }, [fetchWishlist]);

  async function toggle(parfumId: string) {
    if (!user) return;
    if (wishlistIds.has(parfumId)) {
      await supabase.from('wishlist_items')
        .delete().eq('user_id', user.id).eq('parfum_id', parfumId);
      setWishlistIds(prev => { const s = new Set(prev); s.delete(parfumId); return s; });
    } else {
      await supabase.from('wishlist_items')
        .insert({ user_id: user.id, parfum_id: parfumId });
      setWishlistIds(prev => new Set([...prev, parfumId]));
    }
  }

  return (
    <WishlistContext.Provider value={{
      wishlistIds, loading,
      toggle,
      isWishlisted: (id) => wishlistIds.has(id),
      count: wishlistIds.size,
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist trebuie folosit în WishlistProvider');
  return ctx;
}
