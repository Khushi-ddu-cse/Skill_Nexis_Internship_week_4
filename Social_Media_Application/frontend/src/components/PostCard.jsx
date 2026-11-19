import { useState } from "react";
import { Heart, MessageCircle, MoreHorizontal, Send, Trash2, Pencil, X } from "lucide-react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../api";
import { useAuth } from "../context/AuthContext";
import Avatar from "./Avatar";

function timeAgo(date) {
  const seconds = Math.max(1, Math.floor((Date.now() - new Date(date).getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function PostCard({ post, onChange, onDelete }) {
  const { user } = useAuth();
  const [comment, setComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(post.text || "");
  const [menu, setMenu] = useState(false);
  const [error, setError] = useState("");
  const liked = post.likes?.some(person => String(person._id || person) === String(user?._id));
  const ownPost = String(post.author?._id) === String(user?._id);

  const like = async () => {
    if (busy) return;
    setBusy(true); setError("");
    try { await api.post(`/posts/${post._id}/like`); onChange(); }
    catch (e) { setError(getErrorMessage(e)); }
    finally { setBusy(false); }
  };

  const addComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      await api.post(`/posts/${post._id}/comments`, { text: comment });
      setComment(""); onChange(); setShowComments(true);
    } catch (e) { setError(getErrorMessage(e)); }
  };

  const deleteComment = async (commentId) => {
    try { await api.delete(`/posts/${post._id}/comments/${commentId}`); onChange(); }
    catch (e) { setError(getErrorMessage(e)); }
  };

  const saveEdit = async () => {
    try { await api.put(`/posts/${post._id}`, { text: editText, imageUrl: post.imageUrl || "" }); setEditing(false); onChange(); }
    catch (e) { setError(getErrorMessage(e)); }
  };

  const removePost = async () => {
    if (!window.confirm("Delete this post? This cannot be undone.")) return;
    try { await api.delete(`/posts/${post._id}`); onDelete(post._id); }
    catch (e) { setError(getErrorMessage(e)); }
  };

  return (
    <article className="post-card">
      <div className="post-head">
        <Link to={`/profile/${post.author?._id}`} className="author-line">
          <Avatar user={post.author} />
          <span className="author-meta"><strong>{post.author?.name || "Member"}</strong><small>@{post.author?.username || "member"} · {timeAgo(post.createdAt)}</small></span>
        </Link>
        {ownPost && <div className="post-menu-wrap">
          <button className="icon-button" onClick={() => setMenu(!menu)}><MoreHorizontal size={20} /></button>
          {menu && <div className="post-menu">
            <button onClick={() => { setEditing(true); setMenu(false); }}><Pencil size={15} /> Edit post</button>
            <button className="danger-text" onClick={removePost}><Trash2 size={15} /> Delete post</button>
          </div>}
        </div>}
      </div>

      {editing ? <div className="edit-box"><textarea value={editText} onChange={e => setEditText(e.target.value)} maxLength={2000}/><div><button className="text-button" onClick={() => setEditing(false)}>Cancel</button><button className="primary-small" onClick={saveEdit}>Save changes</button></div></div> :
        post.text && <p className="post-text">{post.text}</p>}
      {post.imageUrl && <div className="post-image"><img src={post.imageUrl} alt="Post attachment" onError={e => { e.currentTarget.parentElement.innerHTML = "<div class='image-fallback'>Image could not be loaded</div>"; }} /></div>}

      {error && <div className="inline-error">{error}</div>}
      <div className="post-stats"><span>{post.likes?.length || 0} likes</span><button onClick={() => setShowComments(!showComments)}>{post.comments?.length || 0} comments</button></div>
      <div className="post-actions">
        <button className={liked ? "liked" : ""} onClick={like} disabled={busy}><Heart size={19} fill={liked ? "currentColor" : "none"} /> Like</button>
        <button onClick={() => setShowComments(!showComments)}><MessageCircle size={19} /> Comment</button>
      </div>
      {showComments && <div className="comments-area">
        {post.comments?.map(item => <div className="comment-row" key={item._id}>
          <Avatar user={item.author} size="sm" />
          <div className="comment-bubble"><strong>{item.author?.name || "Member"}</strong><p>{item.text}</p></div>
          {(String(item.author?._id) === String(user?._id) || ownPost) && <button className="comment-delete" title="Delete comment" onClick={() => deleteComment(item._id)}><X size={14}/></button>}
        </div>)}
        <form className="comment-form" onSubmit={addComment}>
          <Avatar user={user} size="sm" />
          <input value={comment} onChange={e => setComment(e.target.value)} placeholder="Write a comment..." maxLength={500}/>
          <button type="submit" disabled={!comment.trim()}><Send size={17}/></button>
        </form>
      </div>}
    </article>
  );
}
