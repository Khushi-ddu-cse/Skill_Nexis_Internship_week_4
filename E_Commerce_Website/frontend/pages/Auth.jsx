import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { useStore } from "../context/StoreContext";

export default function Auth({ mode = "login" }) {
  const isRegister = mode === "register";
  const { login, register } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const change = e => setForm(current => ({ ...current, [e.target.name]: e.target.value }));
  async function submit(e) {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const user = isRegister ? await register(form) : await login({ email: form.email, password: form.password });
      const destination = location.state?.from || (user.role === "admin" ? "/admin" : "/");
      navigate(destination, { replace: true });
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  return <div className="auth-page">
    <div className="auth-panel">
      <div className="auth-visual"><span className="eyebrow">WELCOME TO MARKETHUB</span><h2>Your next<br/><em>great find</em><br/>starts here.</h2><p>Discover useful things, everyday favourites and new ideas worth bringing home.</p><div className="auth-visual-mark">M<span>H</span></div></div>
      <form className="auth-form" onSubmit={submit}>
        <div className="auth-icon"><LockKeyhole/></div>
        <span className="eyebrow">{isRegister ? "JOIN THE MARKETPLACE" : "WELCOME BACK"}</span>
        <h1>{isRegister ? "Create your account" : "Sign in to MarketHub"}</h1>
        <p className="muted">{isRegister ? "A world of everyday discoveries is waiting." : "Access your account, orders and saved details."}</p>
        {error && <div className="alert alert-error">{error}</div>}
        {isRegister && <label>Full name<input name="name" value={form.name} onChange={change} required minLength="2" maxLength="60" autoComplete="name" placeholder="Your name"/></label>}
        <label>Email address<input name="email" type="email" value={form.email} onChange={change} required autoComplete="email" placeholder="you@example.com"/></label>
        <label>Password<div className="password-field"><input name="password" type={showPassword ? "text" : "password"} value={form.password} onChange={change} required minLength="8" autoComplete={isRegister ? "new-password" : "current-password"} placeholder="At least 8 characters"/><button type="button" onClick={()=>setShowPassword(v=>!v)} aria-label="Toggle password visibility">{showPassword ? <EyeOff/> : <Eye/>}</button></div></label>
        <button className="button button-orange auth-submit" disabled={loading}>{loading ? "Please wait…" : isRegister ? "Create account" : "Sign in"}</button>
        <p className="auth-switch">{isRegister ? "Already have an account?" : "New to MarketHub?"} <Link to={isRegister ? "/login" : "/register"}>{isRegister ? "Sign in" : "Create your account"}</Link></p>
      </form>
    </div>
  </div>;
}
