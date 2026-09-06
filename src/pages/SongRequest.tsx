import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/** Song request merged into Fans hub (/community#request). */
export default function SongRequest() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/community#request", { replace: true });
  }, [navigate]);
  return null;
}
