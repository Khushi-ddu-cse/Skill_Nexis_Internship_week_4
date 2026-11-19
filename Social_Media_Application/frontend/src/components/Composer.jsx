import { useState } from "react";
import { ImagePlus, Send, X } from "lucide-react";
import api, { getErrorMessage } from "../api";
import { useAuth } from "../context/AuthContext";
import Avatar from "./Avatar";

export default function Composer({ onCreated, onClose }) {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [showImage, setShowImage] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api.post("/posts", { text, imageUrl });
      setText(""); setImageUrl(""); onCreated(); onClose?.();
    } catch (e) { setError(getErrorMessage(e)); }
    finally { setBusy(false); }
  };

  return <form className="composer-card" onSubmit={submit}>
    <div className="composer-top"><Avatar user={user}/><textarea value={text} onChange={e => setText(e.target.value)} placeholder={`What's on your mind, ${user?.name?.split(" ")[0] || "there"}?`} maxLength={2000}/></div>
    {showImage && <div className="image-url-field"><input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="Paste an image URL (https://...)" /><button type="button" onClick={() => { setShowImage(false); setImageUrl(""); }}><X size={16}/></button></div>}
    {error && <div className="inline-error">{error}</div>}
    <div className="composer-bottom"><button type="button" className="attach-button" onClick={() => setShowImage(!showImage)}><ImagePlus size={18}/> Add image URL</button><span className="char-count">{text.length}/2000</span><button className="primary-small" type="submit" disabled={busy || (!text.trim() && !imageUrl.trim())}>{busy ? "Posting..." : "Share post"} <Send size={15}/></button></div>
  </form>;
}
