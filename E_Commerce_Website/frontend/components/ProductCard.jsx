import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useStore } from "../context/StoreContext";
import Rating from "./Rating";

const money = value => `₹${Number(value || 0).toLocaleString("en-IN")}`;

export default function ProductCard({ product }) {
  const { addToCart } = useStore();
  const discount = product.mrp > product.price ? Math.round((1 - product.price / product.mrp) * 100) : 0;
  return (
    <article className="product-card">
      <Link className="product-photo" to={`/product/${product._id}`}>
        {discount > 0 && <span className="discount-badge">{discount}% OFF</span>}
        <img src={product.image} alt={product.name} loading="lazy" onError={e => { e.currentTarget.src = "https://placehold.co/600x600/f1f3f6/64748b?text=MarketHub"; }} />
      </Link>
      <div className="product-card-body">
        <small className="muted">{product.brand || product.category}</small>
        <Link className="product-card-title" to={`/product/${product._id}`}>{product.name}</Link>
        <Rating value={product.rating} count={product.numReviews} />
        <div className="product-price-row">
          <strong>{money(product.price)}</strong>
          {product.mrp > product.price && <del>{money(product.mrp)}</del>}
        </div>
        <p className={product.stock > 0 ? "stock-ok" : "stock-out"}>{product.stock > 0 ? "In stock" : "Currently unavailable"}</p>
        <button className="button button-orange button-small" disabled={!product.stock} onClick={() => addToCart(product)}>
          <ShoppingCart size={15} /> Add to cart
        </button>
      </div>
    </article>
  );
}
