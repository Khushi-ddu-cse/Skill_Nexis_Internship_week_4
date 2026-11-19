import { Link } from "react-router-dom";
import { ArrowUp } from "lucide-react";

export default function Footer() {
  return <footer className="footer">
    <button className="back-top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Back to top <ArrowUp size={15}/></button>
    <div className="footer-main">
      <div><Link to="/" className="brand footer-brand"><span className="brand-mark">M</span><span>Market<span>Hub</span></span></Link><p>Everyday discoveries, useful essentials and great value — all in one place.</p></div>
      <div><h4>Get to know us</h4><a href="/#about">About MarketHub</a><a href="/#categories">Explore categories</a></div>
      <div><h4>Let us help</h4><Link to="/orders">Your orders</Link><Link to="/cart">Your cart</Link><Link to="/login">Your account</Link></div>
      <div><h4>Shop with confidence</h4><span>Secure account access</span><span>Cash on Delivery</span><span>Order status updates</span></div>
    </div>
    <div className="footer-bottom">© {new Date().getFullYear()} MarketHub. All rights reserved.</div>
  </footer>;
}
