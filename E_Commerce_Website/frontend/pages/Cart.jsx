import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useStore } from "../context/StoreContext";

const money = n => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const SHIPPING_THRESHOLD = 999;
const SHIPPING_FEE = 49;

export default function Cart() {
  const { cart, subtotal, updateQuantity, removeFromCart } = useStore();
  const navigate = useNavigate();
  const shipping = subtotal === 0 || subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  if (!cart.length) return <div className="empty-cart-page"><div className="empty-cart-icon"><ShoppingBag/></div><h1>Your cart is waiting</h1><p>Looks like you haven't added anything yet.</p><Link className="button button-orange" to="/">Start exploring</Link></div>;
  return <div className="page-wrap cart-page">
    <div className="page-title-row"><div><span className="eyebrow">YOUR SELECTION</span><h1>Shopping cart</h1><p>{cart.length} different items · {cart.reduce((s,i)=>s+i.quantity,0)} units</p></div><Link to="/">Continue shopping</Link></div>
    <div className="cart-layout">
      <div className="cart-items">
        {cart.map(item=><article className="cart-item" key={item._id}>
          <Link to={`/product/${item._id}`} className="cart-item-image"><img src={item.image} alt={item.name}/></Link>
          <div className="cart-item-details"><small>{item.brand || item.category}</small><Link to={`/product/${item._id}`}><h3>{item.name}</h3></Link><span className={item.stock >= item.quantity ? "stock-ok" : "stock-out"}>{item.stock >= item.quantity ? "Available" : "Stock changed — adjust quantity"}</span>
            <div className="quantity-stepper"><button onClick={()=>updateQuantity(item._id,item.quantity-1)} disabled={item.quantity<=1}><Minus size={14}/></button><b>{item.quantity}</b><button onClick={()=>updateQuantity(item._id,item.quantity+1)} disabled={item.quantity>=item.stock}><Plus size={14}/></button></div>
          </div>
          <div className="cart-item-end"><strong>{money(item.price*item.quantity)}</strong><button className="remove-link" onClick={()=>removeFromCart(item._id)}><Trash2 size={14}/> Remove</button></div>
        </article>)}
      </div>
      <aside className="summary-card"><span className="eyebrow">ORDER SUMMARY</span><h2>Subtotal</h2><div className="summary-line"><span>Items subtotal</span><b>{money(subtotal)}</b></div><div className="summary-line"><span>Delivery</span><b>{shipping ? money(shipping) : "FREE"}</b></div><div className="summary-total"><span>Estimated total</span><strong>{money(subtotal+shipping)}</strong></div><p className="summary-note">{subtotal >= SHIPPING_THRESHOLD ? "You've unlocked free delivery." : `Add ${money(SHIPPING_THRESHOLD-subtotal)} more for free delivery.`}</p><button className="button button-orange full-width" onClick={()=>navigate("/checkout")} disabled={cart.some(i=>i.stock<i.quantity)}>Proceed to checkout</button><small className="secure-note">Secure checkout · Cash on Delivery</small></aside>
    </div>
  </div>;
}
