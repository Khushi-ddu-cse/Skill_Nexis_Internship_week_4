import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api";

const StoreContext = createContext(null);
const readJSON = (key, fallback) => {
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; }
  catch { return fallback; }
};

export function StoreProvider({ children }) {
  const [user, setUser] = useState(() => readJSON("markethub_user", null));
  const [cart, setCart] = useState(() => readJSON("markethub_cart", []));

  useEffect(() => { localStorage.setItem("markethub_cart", JSON.stringify(cart)); }, [cart]);
  useEffect(() => {
    if (user) localStorage.setItem("markethub_user", JSON.stringify(user));
    else localStorage.removeItem("markethub_user");
  }, [user]);

  const authenticate = useCallback(async (endpoint, payload) => {
    const data = await api(endpoint, { method: "POST", body: JSON.stringify(payload) });
    if (!data?.token || !data?.user) throw new Error("Unexpected authentication response from server.");
    localStorage.setItem("markethub_token", data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const login = useCallback(payload => authenticate("/auth/login", payload), [authenticate]);
  const register = useCallback(payload => authenticate("/auth/register", payload), [authenticate]);
  const logout = useCallback(() => {
    localStorage.removeItem("markethub_token");
    localStorage.removeItem("markethub_user");
    setUser(null);
  }, []);

  const addToCart = useCallback(product => {
    if (!product?._id || product.stock < 1) return;
    setCart(current => {
      const found = current.find(item => item._id === product._id);
      if (found) return current.map(item => item._id === product._id
        ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) } : item);
      return [...current, { ...product, quantity: 1 }];
    });
  }, []);
  const updateQuantity = useCallback((id, quantity) => {
    const next = Math.floor(Number(quantity));
    if (!Number.isFinite(next) || next < 1) return;
    setCart(current => current.map(item => item._id === id
      ? { ...item, quantity: Math.min(next, Math.max(1, item.stock)) } : item));
  }, []);
  const removeFromCart = useCallback(id => setCart(current => current.filter(item => item._id !== id)), []);
  const clearCart = useCallback(() => setCart([]), []);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const value = useMemo(() => ({
    user, cart, cartCount, subtotal, login, register, logout,
    addToCart, updateQuantity, removeFromCart, clearCart
  }), [user, cart, cartCount, subtotal, login, register, logout, addToCart, updateQuantity, removeFromCart, clearCart]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used inside StoreProvider.");
  return context;
}
