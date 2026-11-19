import { useCallback, useEffect, useState } from "react";
import { Sparkles, Users, TrendingUp, RefreshCw } from "lucide-react";
import api, { getErrorMessage } from "../api";
import { useAuth } from "../context/AuthContext";
import PostCard from "../components/PostCard";
import Composer from "../components/Composer";
import Avatar from "../components/Avatar";

export default function FeedPage({ searchTerm = "" }) {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async (nextPage = 1) => {
    setLoading(true); setError("");
    try {
      const { data } = await api.get(`/posts?page=${nextPage}&limit=10`);
      setPosts(data.posts); setPage(data.page); setPages(data.pages || 1);
    } catch (e) { setError(getErrorMessage(e)); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(1); }, [load]);
  const refresh = () => load(page);
  const visiblePosts = posts.filter(p => !searchTerm || `${p.text} ${p.author?.name} ${p.author?.username}`.toLowerCase().includes(searchTerm.toLowerCase()));

  return <div className="feed-layout">
    <main className="feed-main">
      <div className="page-heading"><div><span className="eyebrow">YOUR COMMUNITY</span><h1>Home feed<span className="heading-dot">.</span></h1><p>See what your people are sharing today.</p></div><button className="refresh-button" onClick={refresh} title="Refresh feed"><RefreshCw size={17}/></button></div>
      <Composer onCreated={refresh}/>
      <div className="feed-section-title"><h2>Latest posts</h2><span><span className="live-dot"></span> Updated from the community</span></div>
      {loading ? <div className="loading-card">Loading your feed...</div> : error ? <div className="empty-state"><strong>Couldn't load the feed</strong><p>{error}</p><button className="primary-small" onClick={refresh}>Try again</button></div> :
        visiblePosts.length ? <>{visiblePosts.map(post => <PostCard key={post._id} post={post} onChange={refresh} onDelete={id => setPosts(current => current.filter(p => p._id !== id))}/>)}
          {pages > 1 && <div className="pagination"><button disabled={page <= 1} onClick={() => load(page - 1)}>Previous</button><span>Page {page} of {pages}</span><button disabled={page >= pages} onClick={() => load(page + 1)}>Next</button></div>}
        </> : <div className="empty-state"><div className="empty-icon"><Sparkles size={24}/></div><strong>{searchTerm ? "No matching posts" : "Your feed is waiting for its first post"}</strong><p>{searchTerm ? "Try a different search." : "Be the first to share something with your community."}</p></div>}
    </main>
    <aside className="feed-aside">
      <div className="welcome-card"><span className="welcome-icon"><Sparkles size={20}/></span><span className="eyebrow">A SPACE TO CONNECT</span><h3>Small moments.<br/><em>Big connections.</em></h3><p>Share a thought, celebrate a win, or simply say hello.</p></div>
      <div className="profile-widget"><div className="widget-heading"><h3>Your profile</h3><span>✦</span></div><div className="profile-widget-user"><Avatar user={user} size="lg"/><div><strong>{user?.name}</strong><span>@{user?.username}</span></div></div><p>{user?.bio || "Add a little bio to tell the community about yourself."}</p></div>
      <div className="community-card"><div className="community-icon"><Users size={19}/></div><div><strong>Community first</strong><p>Be kind, stay curious, and make someone's day.</p></div></div>
      <div className="aside-footer">© 2026 SocialSphere · Made for connection</div>
    </aside>
  </div>;
}
