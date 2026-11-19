import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ShoppingCart, Truck, ShieldCheck, RotateCcw } from "lucide-react";
import { api } from "../api";
import { useStore } from "../context/StoreContext";
import Rating from "../components/Rating";

const money = n => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function Product() {
  const { id } = useParams();
  const { addToCart } = useStore();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api(`/products/${id}`).then(data => { if (active) setProduct(data.product); })
      .catch(err => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  if (loading) return <div className="page-wrap"><div className="loading-line">Loading product…</div></div>;
  if (error || !product) return <div className="page-wrap"><div className="alert alert-error">{error || "Product not found."}</div><Link to="/">Back to shopping</Link></div>;
  const discount = product.mrp > product.price ? Math.round((1 - product.price / product.mrp) * 100) : 0;

  return <div className="page-wrap product-detail">
    <div className="breadcrumbs"><Link to="/">Home</Link> / {product.category} / {product.name}</div>
    <div className="product-detail-layout">
      <div className="product-detail-image"><img src={product.image} alt={product.name}/></div>
      <div className="product-detail-info">
        <span className="eyebrow">{product.brand} · {product.category}</span>
        <h1>{product.name}</h1>
        <Rating value={product.rating} count={product.numReviews}/>
        <div className="detail-price">{money(product.price)} {discount > 0 && <><del>{money(product.mrp)}</del><span>{discount}% off</span></>}</div>
        <p className="tax-note">Inclusive of applicable taxes</p>
        <div className="detail-description">{product.description}</div>
        <p className={product.stock > 0 ? "stock-ok" : "stock-out"}>{product.stock > 0 ? `${product.stock} available` : "Currently unavailable"}</p>
        <button className="button button-orange detail-add" disabled={!product.stock} onClick={() => { addToCart(product); setAdded(true); }}>
          <ShoppingCart size={18}/>{added ? "Added to cart" : "Add to cart"}
        </button>
        <div className="product-promises"><div><Truck/><span><b>Delivery</b><small>Convenient doorstep delivery</small></span></div><div><ShieldCheck/><span><b>Secure shopping</b><small>Your account is protected</small></span></div><div><RotateCcw/><span><b>Order support</b><small>Track your order online</small></span></div></div>
      </div>
    </div>
  </div>;
}
