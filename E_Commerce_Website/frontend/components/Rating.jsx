import { Star } from "lucide-react";

export default function Rating({ value = 0, count }) {
  return (
    <span className="rating">
      <span>{Number(value).toFixed(1)}</span>
      <Star size={13} fill="currentColor" />
      {count !== undefined && <small>({count})</small>}
    </span>
  );
}
