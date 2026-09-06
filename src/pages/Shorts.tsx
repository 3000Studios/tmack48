import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/** Shorts live under Watch hub (/videos#shorts). */
export default function Shorts() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/videos#shorts", { replace: true });
  }, [navigate]);
  return null;
}
