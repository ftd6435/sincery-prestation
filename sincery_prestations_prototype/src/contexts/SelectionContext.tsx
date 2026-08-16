import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState } from
'react';
import type { Product, SelectionItem } from '../types/catalog';
import { getProductById } from '../data/products';

interface SelectionLine extends SelectionItem {
  product: Product;
}

interface SelectionContextValue {
  items: SelectionItem[];
  lines: SelectionLine[];
  count: number;
  add: (productId: string, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  has: (productId: string) => boolean;
}

const STORAGE_KEY = 'sincery.selection';

const SelectionContext = createContext<SelectionContextValue | null>(null);

export function SelectionProvider({
  children


}: {children: React.ReactNode;}): JSX.Element {
  const [items, setItems] = useState<SelectionItem[]>(() => {
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) as SelectionItem[] : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {

      /* session storage unavailable — selection stays in memory */}
  }, [items]);

  const add = useCallback((productId: string, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === productId);
      if (existing) {
        return prev.map((i) =>
        i.productId === productId ?
        { ...i, quantity: i.quantity + quantity } :
        i
        );
      }
      return [...prev, { productId, quantity }];
    });
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prev) =>
    prev.
    map((i) =>
    i.productId === productId ?
    { ...i, quantity: Math.max(1, quantity) } :
    i
    ).
    filter((i) => i.quantity > 0)
    );
  }, []);

  const remove = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<SelectionContextValue>(() => {
    const lines = items.
    map((item) => {
      const product = getProductById(item.productId);
      return product ? { ...item, product } : null;
    }).
    filter((l): l is SelectionLine => l !== null);

    return {
      items,
      lines,
      count: items.reduce((sum, i) => sum + i.quantity, 0),
      add,
      setQuantity,
      remove,
      clear,
      has: (productId: string) => items.some((i) => i.productId === productId)
    };
  }, [items, add, setQuantity, remove, clear]);

  return (
    <SelectionContext.Provider value={value}>
      {children}
    </SelectionContext.Provider>);

}

export function useSelection(): SelectionContextValue {
  const ctx = useContext(SelectionContext);
  if (!ctx) {
    throw new Error('useSelection must be used within a SelectionProvider');
  }
  return ctx;
}