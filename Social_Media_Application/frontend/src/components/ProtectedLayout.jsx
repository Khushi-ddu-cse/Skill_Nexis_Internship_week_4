import { useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useAuth } from "../context/AuthContext";
import Composer from "./Composer";

export default function ProtectedLayout() {
  const { user, loading } = useAuth();
  const [showComposer, setShowComposer] = useState(false);
  const [search, setSearch] = useState("");
  if (loading) return <div className="full-loading">Getting your space ready...</div>;
  if (!user) return <Navigate to="/login" replace/>;
  return <div className="app-shell">
    <Sidebar onCreate={() => setShowComposer(true)}/>
    <div className="app-main"><Topbar onCreate={() => setShowComposer(true)} onSearch={setSearch}/><div className="page-content"><Outlet context={{ search }}/></div></div>
    {showComposer && <div className="modal-backdrop" onClick={() => setShowComposer(false)}><div className="modal-card" onClick={e => e.stopPropagation()}><div className="modal-heading"><h2>Create a post</h2><button onClick={() => setShowComposer(false)}>×</button></div><Composer onCreated={() => window.dispatchEvent(new Event("socialsphere-refresh"))} onClose={() => setShowComposer(false)}/></div></div>}
  </div>;
}
