import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CalendarDays, Grid3X3 } from "lucide-react";
import api, { getErrorMessage } from "../api";
import Avatar from "../components/Avatar";
import PostCard from "../components/PostCard";

export default function ProfilePage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const load = () => api.get(`/users/${id}`).then(r => setData(r.data)).catch(e => setError(getErrorMessage(e)));
  useEffect(() => { setData(null); setError(""); load(); }, [id]);
  if (error) return <div className="empty-state">{error}</div>;
  if (!data) return <div className="loading-card">Loading profile...</div>;
  return <div className="profile-page">
    <div className="profile-cover"></div>
    <section className="profile-header"><Avatar user={data.user} size="xl"/><div className="profile-title"><h1>{data.user.name}</h1><span>@{data.user.username}</span><p>{data.user.bio || "A member of the SocialSphere community."}</p><small><CalendarDays size={14}/> Joined {new Date(data.user.createdAt).toLocaleDateString(undefined, { month: "long", year: "numeric" })}</small></div><div className="profile-count"><strong>{data.posts.length}</strong><span>Posts</span></div></section>
    <div className="profile-post-heading"><Grid3X3 size={18}/><h2>Posts</h2></div>
    {data.posts.length ? data.posts.map(post => <PostCard key={post._id} post={post} onChange={load} onDelete={load}/>) : <div className="empty-state"><strong>No posts yet</strong><p>When this user shares something, it will show up here.</p></div>}
  </div>;
}
