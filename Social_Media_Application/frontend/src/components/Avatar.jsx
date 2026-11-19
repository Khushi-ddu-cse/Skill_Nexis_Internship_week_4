export default function Avatar({ user, size = "md", className = "" }) {
  const initial = user?.name?.trim()?.[0]?.toUpperCase() || "?";
  return (
    <div className={`avatar avatar-${size} ${className}`}>
      {user?.avatar ? <img src={user.avatar} alt="" onError={e => { e.currentTarget.style.display = "none"; }} /> : initial}
    </div>
  );
}
