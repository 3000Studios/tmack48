import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/** Contact merged into Connect (/support#contact). */
export default function Contact() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/support#contact", { replace: true });
  }, [navigate]);
  return null;
}
