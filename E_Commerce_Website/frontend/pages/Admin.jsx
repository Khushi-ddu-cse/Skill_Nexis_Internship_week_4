import { useCallback, useEffect, useState } from "react";
import { api } from "../api";

const categories = ["Electronics","Fashion","Home & Kitchen","Beauty","Sports","Books","Toys & Games","Grocery","Accessories","Other"];
const empty = { name:"", description:"", brand:"", category:"Electronics", price:"", mrp:"", image:"", stock:"0", featured:false };
const money = n => `₹${Number(n||0).toLocaleString("en-IN")}`;

export default function Admin() {
  const [tab,setTab] = useState("products");
  const [products,setProducts] = useState([]);
  const [orders,setOrders] = useState([]);
  const [form,setForm] = useState(empty);
  const [editing,setEditing] = useState(null);
  const [error,setError] = useState("");
  const [message,setMessage] = useState("");
  const [busy,setBusy] = useState(false);

  const load = useCallback(async()=>{
    const [p,o] = await Promise.all([api("/products?limit=48"),api("/orders")]);
    setProducts(p.products||[]); setOrders(o.orders||[]);
  },[]);
  useEffect(()=>{load().catch(e=>setError(e.message));},[load]);

  const update = e => setForm(v=>({...v,[e.target.name]:e.target.type==="checkbox"?e.target.checked:e.target.value}));
  function edit(product) {
    setEditing(product._id);
    setForm({ name:product.name, description:product.description, brand:product.brand||"", category:product.category, price:String(product.price), mrp:String(product.mrp), image:product.image, stock:String(product.stock), featured:product.featured });
    setTab("products");
    window.scrollTo({top:0,behavior:"smooth"});
  }
  async function save(e) {
    e.preventDefault(); setError(""); setMessage(""); setBusy(true);
    try {
      const payload = {...form,price:Number(form.price),mrp:Number(form.mrp),stock:Number(form.stock)};
      if(payload.price>payload.mrp) throw new Error("Selling price cannot be higher than MRP.");
      await api(editing?`/products/${editing}`:"/products",{method:editing?"PUT":"POST",body:JSON.stringify(payload)});
      setForm(empty); setEditing(null); setMessage("Product saved successfully."); await load();
    } catch(err){setError(err.message);} finally{setBusy(false);}
  }
  async function archive(id) {
    if(!window.confirm("Archive this product? It will no longer appear in the store.")) return;
    try{await api(`/products/${id}`,{method:"DELETE"});await load();setMessage("Product archived.");}catch(e){setError(e.message);}
  }
  async function status(id,status) {
    try{await api(`/orders/${id}/status`,{method:"PATCH",body:JSON.stringify({status})});await load();setMessage("Order status updated.");}catch(e){setError(e.message);}
  }

  return <div className="page-wrap admin-page"><span className="eyebrow">MARKETHUB CONTROL CENTRE</span><h1>Admin dashboard</h1><p>Manage products, inventory and customer orders.</p>
    {error&&<div className="alert alert-error">{error}</div>}{message&&<div className="alert alert-success">{message}</div>}
    <div className="admin-metrics"><div><small>Active products</small><b>{products.length}</b></div><div><small>Total orders</small><b>{orders.length}</b></div><div><small>Order value</small><b>{money(orders.reduce((s,o)=>s+o.totalAmount,0))}</b></div><div><small>Pending orders</small><b>{orders.filter(o=>!["Delivered","Cancelled"].includes(o.status)).length}</b></div></div>
    <div className="admin-tabs"><button className={tab==="products"?"active":""} onClick={()=>setTab("products")}>Products & inventory</button><button className={tab==="orders"?"active":""} onClick={()=>setTab("orders")}>Customer orders</button></div>
    {tab==="products"? <div className="admin-layout"><form className="admin-form" onSubmit={save}><h2>{editing?"Edit product":"Add a product"}</h2>
      <label>Product name<input name="name" value={form.name} onChange={update} required maxLength="160"/></label><label>Brand<input name="brand" value={form.brand} onChange={update}/></label><label>Category<select name="category" value={form.category} onChange={update}>{categories.map(c=><option key={c}>{c}</option>)}</select></label><div className="form-grid"><label>Selling price<input name="price" type="number" min="0" value={form.price} onChange={update} required/></label><label>MRP<input name="mrp" type="number" min="0" value={form.mrp} onChange={update} required/></label><label>Stock<input name="stock" type="number" min="0" value={form.stock} onChange={update} required/></label></div><label>Image URL<input name="image" type="url" value={form.image} onChange={update} required placeholder="https://…"/></label><label>Description<textarea name="description" value={form.description} onChange={update} rows="4" required/></label><label className="checkbox-label"><input type="checkbox" name="featured" checked={form.featured} onChange={update}/> Feature this product</label><button className="button button-orange" disabled={busy}>{busy?"Saving…":editing?"Update product":"Create product"}</button>{editing&&<button type="button" className="button button-outline" onClick={()=>{setEditing(null);setForm(empty);}}>Cancel edit</button>}</form>
      <div className="admin-product-list"><h2>Product catalogue ({products.length})</h2>{products.map(p=><div className="admin-product" key={p._id}><img src={p.image} alt=""/><div><b>{p.name}</b><small>{p.category} · {money(p.price)} · Stock: {p.stock}</small></div><button onClick={()=>edit(p)}>Edit</button><button className="danger-text" onClick={()=>archive(p._id)}>Archive</button></div>)}</div></div>:
      <div className="admin-order-list"><h2>Recent orders ({orders.length})</h2>{orders.map(o=><div className="admin-order" key={o._id}><div><b>#{o._id.slice(-8).toUpperCase()}</b><small>{o.user?.name||"Customer"} · {new Date(o.createdAt).toLocaleDateString("en-IN")}</small></div><strong>{money(o.totalAmount)}</strong><select value={o.status} disabled={o.status==="Cancelled"} onChange={e=>status(o._id,e.target.value)}>{["Placed","Confirmed","Packed","Shipped","Delivered","Cancelled"].map(s=><option key={s}>{s}</option>)}</select></div>)}</div>}
  </div>;
}
