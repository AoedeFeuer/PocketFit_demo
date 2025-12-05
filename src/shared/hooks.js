import { useEffect, useState } from "react";
export const LS_KEYS = { user:"pf_user", appts:"pf_appts", chat:"pf_chat", recovery:"pf_recovery" };
export function useLS(key, init) {
  const [v, setV] = useState(() => {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : init; }
    catch { return init; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)); } catch {} }, [key, v]);
  return [v, setV];
}
