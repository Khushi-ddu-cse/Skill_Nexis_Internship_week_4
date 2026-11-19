import { Routes, Route, useOutletContext } from "react-router-dom";
import ProtectedLayout from "./components/ProtectedLayout";
import AuthPage from "./pages/AuthPage";
import FeedPage from "./pages/FeedPage";
import ExplorePage from "./pages/ExplorePage";
import ProfilePage from "./pages/ProfilePage";

function HomeRoute() {
  const { search } = useOutletContext();
  return <FeedPage searchTerm={search}/>;
}

export default function App() {
  return <Routes>
    <Route path="/login" element={<AuthPage mode="login"/>}/>
    <Route path="/register" element={<AuthPage mode="register"/>}/>
    <Route element={<ProtectedLayout/>}>
      <Route path="/" element={<HomeRoute/>}/>
      <Route path="/explore" element={<ExplorePage/>}/>
      <Route path="/profile/:id" element={<ProfilePage/>}/>
    </Route>
    <Route path="*" element={<div className="not-found"><h1>404</h1><p>We couldn't find that page.</p><a href="/">Back home</a></div>}/>
  </Routes>;
}
