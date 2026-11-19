import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Zap, ShieldCheck, Truck, Headphones } from "lucide-react";
import { api } from "../api";
import ProductCard from "../components/ProductCard";

const categories = [
  { name: "Electronics", icon: "🎧", tone: "lavender" },
  { name: "Fashion", icon: "👟", tone: "peach" },
  { name: "Home & Kitchen", icon: "🏡", tone: "mint" },
  { name: "Beauty", icon: "✨", tone: "pink" },
  { name: "Sports", icon: "⚽", tone: "blue" },
  { name: "Books", icon: "📚", tone: "yellow" },
  { name: "Toys & Games", icon: "🧩", tone: "mint" },
  { name: "Accessories", icon: "⌚", tone: "peach" }
];

export default function Home() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const category = params.get("category") || "All";
  const query = params.get("q") || "";
  const sort = params.get("sort") || "newest";

  useEffect(() => {
    let active = true;
    setLoading(true); setError("");
    const search = new URLSearchParams({ limit: "24", sort });
    if (category !== "All") search.set("category", category);
    if (query) search.set("q", query);
    api(`/products?${search}`).then(data => { if (active) setProducts(data.products || []); })
      .catch(err => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [category, query, sort]);

  const setFilter = (key, value) => {
    const next = new URLSearchParams(params);
    if (value === "All" || !value) next.delete(key); else next.set(key, value);
    setParams(next);
  };

  return <div className="home-page">
    <section className="hero-market">
      <div className="hero-copy">
        <span className="eyebrow"><Zap size={14}/> THE EVERYDAY FINDS EDIT</span>
        <h1>Good things.<br/><em>Great finds.</em></h1>
        <p>Discover the things you need, the brands you love and a few new favourites along the way.</p>
        <a className="button button-orange hero-button" href="#products">Explore products <ArrowRight size={17}/></a>
        <div className="hero-note"><span>✦</span> A better way to discover everyday essentials</div>
      </div>
      <div className="hero-art">
        <div className="hero-orbit orbit-one"></div><div className="hero-orbit orbit-two"></div>
        <div className="hero-product-emoji">🛍️</div>
        <div className="hero-floating-card"><span>THE DAILY EDIT</span><b>Find your<br/>next favourite.</b><small>Explore something new →</small></div>
        <div className="hero-sticker">DISCOVER<br/>MORE</div>
      </div>
    </section>

    <section className="benefit-row">
      <div><Truck/><span><b>Convenient delivery</b><small>To your doorstep</small></span></div>
      <div><ShieldCheck/><span><b>Shopping you can trust</b><small>Secure accounts</small></span></div>
      <div><Headphones/><span><b>Here to help</b><small>Support when you need it</small></span></div>
      <div><Zap/><span><b>Everyday value</b><small>Find your best picks</small></span></div>
    </section>

    <section className="section-block" id="categories">
      <div className="section-heading"><div><span className="eyebrow">BROWSE YOUR WAY</span><h2>Shop by category</h2></div><span className="section-aside">A little bit of everything</span></div>
      <div className="category-grid">
        {categories.map(item => <button key={item.name} className={`category-tile ${item.tone} ${category === item.name ? "selected" : ""}`} onClick={() => { setFilter("category", item.name); document.getElementById("products")?.scrollIntoView({ behavior: "smooth" }); }}>
          <span>{item.icon}</span><b>{item.name}</b><small>Explore <ArrowRight size={12}/></small>
        </button>)}
      </div>
    </section>

    <section className="deal-banner" id="featured">
      <div><span className="eyebrow">THE MARKETPLACE MIX</span><h2>Little upgrades.<br/>Big everyday joy.</h2><p>Explore customer favourites and fresh discoveries.</p><a href="#products">Shop the collection <ArrowRight size={16}/></a></div>
      <div className="deal-art"><span>✳</span><b>GOOD<br/>FINDS<br/>LIVE HERE.</b><small>MARKETHUB / YOUR DAILY DISCOVERY</small></div>
    </section>

    <section className="section-block products-section" id="products">
      <div className="section-heading product-heading"><div><span className="eyebrow">CURATED FOR YOU</span><h2>{query ? `Results for “${query}”` : category === "All" ? "Explore products" : category}</h2><p>{products.length} products to discover</p></div>
        <div className="product-controls"><select value={category} onChange={e => setFilter("category", e.target.value)}><option>All</option>{categories.map(c => <option key={c.name}>{c.name}</option>)}</select><select value={sort} onChange={e => setFilter("sort", e.target.value)}><option value="newest">Newest</option><option value="popular">Popular</option><option value="rating">Top rated</option><option value="priceLow">Price: low to high</option><option value="priceHigh">Price: high to low</option></select></div>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      {loading ? <div className="product-grid">{Array.from({length:8}).map((_,i)=><div className="product-skeleton" key={i}/>)}</div> :
        products.length ? <div className="product-grid">{products.map(product=><ProductCard key={product._id} product={product}/>)}</div> :
        <div className="empty-state"><span>🔎</span><h3>No products found</h3><p>Try another search or category.</p><button className="button button-outline" onClick={()=>setParams({})}>Clear filters</button></div>}
    </section>
  </div>;
}
