import { NavLink, useNavigate } from "react-router-dom";
import { Home, Compass, UserRound, PlusSquare, LogOut, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Avatar from "./Avatar";

export default function Sidebar({ onCreate }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const items = [
    { to: "/", label: "Home feed", icon: Home },
    { to: "/explore", label: "Explore", icon: Compass },
    { to: `/profile/${user?._id}`, label: "My profile", icon: UserRound }
  ];
  return (
    <aside className="sidebar">
      <button className="brand" onClick={() => navigate("/")}>
        <span className="brand-mark"><Sparkles size={20} /></span>
        <span>social<span>sphere</span></span>
      </button>
      <div className="side-label">MENU</div>
      <nav className="side-nav">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink key={label} to={to} end={to === "/"} className={({ isActive }) => `side-link ${isActive ? "active" : ""}`}>
            <Icon size={19} /><span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <button className="side-create" onClick={onCreate}><PlusSquare size={18} /> Create post</button>
      <div className="sidebar-bottom">
        <div className="mini-user">
          <Avatar user={user} />
          <div className="mini-user-text"><strong>{user?.name}</strong><span>@{user?.username}</span></div>
        </div>
        <button className="logout-link" onClick={() => { logout(); navigate("/login"); }}><LogOut size={17} /> Log out</button>
      </div>
    </aside>
  );
}
