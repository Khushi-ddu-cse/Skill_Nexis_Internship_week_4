import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { MapPin, Search, ShoppingCart, UserRound, Menu, X, Package, LogOut } from "lucide-react";
import { useStore } from "../context/StoreContext";

export default function Header() {
  const { user, logout, cartCount } = useStore();
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  function search(e) {
    e.preventDefault();
    navigate(`/?q=${encodeURIComponent(query.trim())}#products`);
    setMobileOpen(false);
  }

  return (
    <>
      <div className="top-strip"><span>Welcome to MarketHub</span><span>Great finds. Everyday value. Delivered to your door.</span><span>Customer support</span></div>
      <header className="main-header">
        <button className="icon-button mobile-menu-button" onClick={() => setMobileOpen(v => !v)} aria-label="Toggle menu">{mobileOpen ? <X /> : <Menu />}</button>
        <Link to="/" className="brand"><span className="brand-mark">M</span><span>Market<span>Hub</span></span></Link>
        <div className="deliver-location"><MapPin size={17}/><span><small>Deliver to</small><b>India</b></span></div>
        <form className="header-search" onSubmit={search}>
          <select aria-label="Search category" onChange={e => { if (e.target.value !== "All") setQuery(`${query} ${e.target.value}`.trim()); }}><option>All</option><option>Electronics</option><option>Fashion</option><option>Home & Kitchen</option></select>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search products, brands and more..." />
          <button aria-label="Search"><Search size={20}/></button>
        </form>
        <div className="header-actions">
          <Link to={user ? "/account" : "/login"} className="header-account"><UserRound size={19}/><span><small>{user ? `Hello, ${user.name.split(" ")[0]}` : "Hello, sign in"}</small><b>{user ? "Your account" : "Account & Lists"}</b></span></Link>
          <Link to="/orders" className="header-orders"><Package size={19}/><span><small>Returns</small><b>& Orders</b></span></Link>
          <Link to="/cart" className="header-cart"><span className="cart-count">{cartCount}</span><ShoppingCart size={25}/><b>Cart</b></Link>
          {user && <button className="icon-button logout-icon" title="Sign out" onClick={logout}><LogOut size={18}/></button>}
        </div>
      </header>
      <nav className={`category-nav ${mobileOpen ? "category-nav-open" : ""}`}>
        <NavLink to="/">All</NavLink><a href="/#products">Today's deals</a><a href="/#categories">Categories</a><a href="/#featured">Featured</a>
        {user?.role === "admin" && <NavLink to="/admin">Admin dashboard</NavLink>}
        {user && <NavLink to="/orders">My orders</NavLink>}
        {!user && <NavLink to="/register">Create account</NavLink>}
      </nav>
    </>
  );
}
