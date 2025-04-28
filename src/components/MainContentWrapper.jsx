// components/MainContentWrapper.jsx
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export default function MainContentWrapper({ children }) {
  const mainRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.focus(); // focus on route change
    }
  }, [location]);

  return (
    <div
      ref={mainRef}
      tabIndex={-1}
      style={{ outline: "none" }}
    >
      {children}
    </div>
  );
}
