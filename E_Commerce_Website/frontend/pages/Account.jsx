import { Link } from "react-router-dom";
import { UserRound, Package, ShieldCheck } from "lucide-react";
import { useStore } from "../context/StoreContext";

export default function Account() {
  const { user, logout } = useStore();
  return <div className="page-wrap account-page"><span className="eyebrow">YOUR MARKETHUB</span><h1>Hello, {user?.name}</h1><p>Manage your account and shopping activity.</p><div className="account-grid"><Link to="/orders"><Package/><b>Your orders</b><small>View purchases and order status</small></Link><div><UserRound/><b>Account details</b><small>{user?.email}</small></div>{user?.role==="admin"&&<Link to="/admin"><ShieldCheck/><b>Admin dashboard</b><small>Manage marketplace inventory</small></Link>}</div><button className="button button-outline" onClick={logout}>Sign out</button></div>;
}
