import { useEffect, useState } from "react";
import { Compass, Search } from "lucide-react";
import api, { getErrorMessage } from "../api";
import PostCard from "../components/PostCard";

export default function ExplorePage() {
  const [posts, setPosts] = useState([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  useEffect(() => { api.get("/posts?limit=20").then(r => setPosts(r.data.posts)).catch(e => setError(getErrorMessage(e))); }, []);
  const filtered = posts.filter(p => `${p.text} ${p.author?.name} ${p.author?.username}`.toLowerCase().includes(query.toLowerCase()));
  const refresh = () => api.get("/posts?limit=20").then(r => setPosts(r.data.posts));
  return <div className="explore-page"><div className="page-heading"><div><span className="eyebrow">FIND YOUR INSPIRATION</span><h1>Explore<span className="heading-dot">.</span></h1><p>Discover conversations and ideas from the community.</p></div><Compass className="heading-art" size={34}/></div>
    <div className="explore-search"><Search size={18}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search posts and people..."/></div>
    {error && <div className="inline-error">{error}</div>}
    {filtered.length ? filtered.map(post => <PostCard key={post._id} post={post} onChange={refresh} onDelete={id => setPosts(p => p.filter(x => x._id !== id))}/>) : <div className="empty-state"><strong>No results found</strong><p>Try another search or check back later.</p></div>}
  </div>;
}
