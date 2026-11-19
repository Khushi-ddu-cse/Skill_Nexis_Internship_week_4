import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, MapPin, PackageCheck } from "lucide-react";
import { api } from "../api";
import { useStore } from "../context/StoreContext";

const money = n => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const initial = { fullName: "", phone: "", addressLine: "", city: "", state: "", postalCode: "" };

export default function Checkout() {
  const { cart, subtotal, clearCart } = useStore();
  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [placed, setPlaced] = useState(null);
  const navigate = useNavigate();
  const shippingFee = subtotal >= 999 ? 0 : 49;

  async function submit(e) {
    e.preventDefault(); setError("");
    if (!cart.length) return setError("Your cart is empty.");
    if (cart.some(item => item.quantity > item.stock)) return setError("A product's available stock has changed. Please review your cart.");
    if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\s|-/g,""))) return setError("Enter a valid 10-digit Indian mobile number.");
    if (!/^[1-9]\d{5}$/.test(form.postalCode)) return setError("Enter a valid 6-digit PIN code.");
    setLoading(true);
    try {
      const data = await api("/orders", { method: "POST", body: JSON.stringify({
        items: cart.map(item=>({ productId: item._id, quantity: item.quantity })),
        shippingAddress: form
      })});
      clearCart(); setPlaced(data.order);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  if (placed) return <div className="success-page"><div className="success-icon"><CheckCircle2/></div><span className="eyebrow">ORDER CONFIRMED</span><h1>Thank you for your order!</h1><p>Your order has been placed successfully. You can follow its progress from your orders page.</p><div className="success-order-number">Order ID <b>{placed._id}</b></div><Link className="button button-orange" to="/orders">View your orders</Link></div>;
  if (!cart.length) return <div className="empty-cart-page"><PackageCheck/><h1>Nothing to checkout</h1><p>Add products to your cart first.</p><Link className="button button-orange" to="/">Continue shopping</Link></div>;

  const update = e => setForm(v=>({...v,[e.target.name]:e.target.value}));
  return <div className="page-wrap checkout-page">
    <div className="page-title-row"><div><span className="eyebrow">ALMOST YOURS</span><h1>Checkout</h1><p>Complete your delivery details below.</p></div><div className="checkout-step"><span className="done">1</span><span className="done">2</span><span>3</span></div></div>
    <div className="checkout-layout">
      <form className="checkout-form" onSubmit={submit}>
        <div className="form-section-title"><MapPin/><div><h2>Delivery address</h2><p>Where should we send your order?</p></div></div>
        {error && <div className="alert alert-error">{error}</div>}
        <div className="form-grid">
          <label className="span-2">Full name<input name="fullName" value={form.fullName} onChange={update} required maxLength="80" autoComplete="name"/></label>
          <label>Mobile number<input name="phone" value={form.phone} onChange={update} required inputMode="numeric" maxLength="10" placeholder="10-digit number" autoComplete="tel"/></label>
          <label>PIN code<input name="postalCode" value={form.postalCode} onChange={update} required inputMode="numeric" maxLength="6" placeholder="6-digit PIN" autoComplete="postal-code"/></label>
          <label className="span-2">House no., street and area<textarea name="addressLine" value={form.addressLine} onChange={update} required rows="3" maxLength="250" autoComplete="street-address"/></label>
          <label>City<input name="city" value={form.city} onChange={update} required autoComplete="address-level2"/></label>
          <label>State<input name="state" value={form.state} onChange={update} required autoComplete="address-level1"/></label>
        </div>
        <div className="payment-method"><span className="payment-radio"/> <div><b>Cash on Delivery</b><small>Pay when your order arrives.</small></div><span className="cod-label">AVAILABLE</span></div>
        <button className="button button-orange full-width" disabled={loading}>{loading ? "Placing order…" : "Place your order"}</button>
      </form>
      <aside className="summary-card"><span className="eyebrow">YOUR ORDER</span><h2>Order summary</h2>{cart.map(item=><div className="checkout-summary-item" key={item._id}><img src={item.image} alt=""/><span>{item.name}<small>Qty: {item.quantity}</small></span><b>{money(item.price*item.quantity)}</b></div>)}<div className="summary-line"><span>Subtotal</span><b>{money(subtotal)}</b></div><div className="summary-line"><span>Delivery</span><b>{shippingFee ? money(shippingFee) : "FREE"}</b></div><div className="summary-total"><span>Total</span><strong>{money(subtotal+shippingFee)}</strong></div><p className="summary-note">By placing your order, you agree to our shopping terms.</p></aside>
    </div>
  </div>;
}
