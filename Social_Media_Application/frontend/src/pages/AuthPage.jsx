import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../api";

export default function AuthPage({ mode }) {
  const isRegister = mode === "register";
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/" replace/>;

  const update = e => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async e => {
    e.preventDefault(); setError(""); setBusy(true);
    try {
      if (isRegister) await register(form);
      else await login({ email: form.email, password: form.password });
      navigate("/");
    } catch (e) { setError(getErrorMessage(e)); }
    finally { setBusy(false); }
  };

  return <div className="auth-page">
    <section className="auth-visual">
      <button className="brand brand-light" onClick={() => navigate("/")}><span className="brand-mark"><Sparkles size={20}/></span><span>social<span>sphere</span></span></button>
      <div className="auth-copy"><span className="eyebrow">YOUR PEOPLE. YOUR SPACE.</span><h1>Good things<br/>happen when<br/><em>we connect.</em></h1><p>A little corner of the internet to share your moments, find your people and stay inspired.</p></div>
      <div className="auth-orbit orbit-one"></div><div className="auth-orbit orbit-two"></div>
      <div className="auth-foot">Make room for meaningful moments.</div>
    </section>
    <section className="auth-form-side">
      <div className="auth-form-wrap">
        <span className="form-kicker">{isRegister ? "GET STARTED" : "WELCOME BACK"}</span>
        <h2>{isRegister ? "Create your account" : "Sign in to your space"}</h2>
        <p className="auth-subtitle">{isRegister ? "Join the conversation. Your community is waiting." : "Pick up right where you left off."}</p>
        {error && <div className="form-error">{error}</div>}
        <form onSubmit={submit}>
          {isRegister && <>
            <label>Full name<input name="name" value={form.name} onChange={update} placeholder="e.g. Alex Morgan" required minLength={2} maxLength={60}/></label>
            <label>Username<input name="username" value={form.username} onChange={update} placeholder="choose_a_username" required minLength={3} maxLength={24}/><small>Letters, numbers and underscores only.</small></label>
          </>}
          <label>Email address<input type="email" name="email" value={form.email} onChange={update} placeholder="you@example.com" required/></label>
          <label>Password<div className="password-field"><input type={showPassword ? "text" : "password"} name="password" value={form.password} onChange={update} placeholder="At least 8 characters" required minLength={8}/><button type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}</button></div></label>
          <button className="auth-submit" disabled={busy}>{busy ? "Please wait..." : isRegister ? "Create account" : "Sign in"} <ArrowRight size={17}/></button>
        </form>
        <p className="auth-switch">{isRegister ? "Already part of the community?" : "New around here?"} <Link to={isRegister ? "/login" : "/register"}>{isRegister ? "Sign in" : "Create an account"}</Link></p>
      </div>
    </section>
  </div>;
}
