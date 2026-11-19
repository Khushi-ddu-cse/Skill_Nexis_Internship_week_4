import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

const money = n => `₹${Number(n || 0).toLocaleString("en-IN")}`;
export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    api("/orders/my").then(data=>{if(active)setOrders(data.orders||[]);})
      .catch(err=>{if(active)setError(err.message);})
      .finally(()=>{if(active)setLoading(false);});
    return ()=>{active=false;};
  }, []);
  return <div className="page-wrap orders-page"><div className="page-title-row"><div><span className="eyebrow">YOUR MARKETPLACE ACTIVITY</span><h1>Your orders</h1><p>All your purchases, together in one place.</p></div><Link to="/">Continue shopping</Link></div>
    {loading ? <p>Loading your orders…</p> : error ? <div className="alert alert-error">{error}</div> : !orders.length ? <div className="empty-state"><span>📦</span><h3>No orders yet</h3><p>Your next great find is waiting.</p><Link className="button button-orange" to="/">Explore products</Link></div> :
      <div className="orders-list">{orders.map(order=><article className="order-card" key={order._id}><div className="order-card-head"><div><small>ORDER PLACED</small><b>{new Date(order.createdAt).toLocaleDateString("en-IN")}</b></div><div><small>ORDER TOTAL</small><b>{money(order.totalAmount)}</b></div><div><small>ORDER ID</small><b>#{order._id.slice(-8).toUpperCase()}</b></div><span className={`order-status status-${order.status.toLowerCase()}`}>{order.status}</span></div><div className="order-card-body">{order.items.map((item,i)=><div className="order-line" key={`${item.product}-${i}`}><img src={item.image} alt=""/><div><b>{item.name}</b><small>Qty: {item.quantity} · {money(item.price)} each</small></div></div>)}<div className="order-delivery"><b>Delivering to</b><span>{order.shippingAddress.fullName}, {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.postalCode}</span><small>Payment: Cash on Delivery</small></div></div></article>)}</div>}
  </div>;
}
