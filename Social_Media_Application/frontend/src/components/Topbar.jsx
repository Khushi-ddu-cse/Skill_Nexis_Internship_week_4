import { Search, Bell, Plus } from "lucide-react";
import Avatar from "./Avatar";
import { useAuth } from "../context/AuthContext";

export default function Topbar({ onCreate, onSearch }) {
  const { user } = useAuth();
  return (
    <header className="topbar">
      <div className="mobile-brand">social<span>sphere</span></div>
      <div className="search-wrap"><Search size={18} /><input placeholder="Search people, posts, ideas..." onChange={e => onSearch?.(e.target.value)} /></div>
      <div className="top-actions">
        <button className="icon-button" title="Notifications are not included in this starter"><Bell size={19} /></button>
        <button className="top-create" onClick={onCreate}><Plus size={17} /> <span>Create post</span></button>
        <Avatar user={user} />
      </div>
    </header>
  );
}
