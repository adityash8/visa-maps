"use client";

import { useCallback, useSyncExternalStore } from "react";

export function StaleNotice({ checkedAt }: { checkedAt: string }) {
  const deadline = Date.parse(checkedAt) + 30 * 86400000;
  const subscribe = useCallback((onChange: () => void) => {
    let timer: ReturnType<typeof setTimeout>;
    function update() {
      clearTimeout(timer);
      onChange();
      const remaining = deadline + 1 - Date.now();
      if (remaining > 0) timer = setTimeout(update, Math.min(remaining, 2147483647));
    }
    update();
    window.addEventListener("focus", update);
    return () => { clearTimeout(timer); window.removeEventListener("focus", update); };
  }, [deadline]);
  const stale = useSyncExternalStore(subscribe, () => Date.now() > deadline, () => false);
  return <>
    {stale && <p className="stale-label" role="status">Stale: checked over 30 days ago. Recheck the official source.</p>}
    <noscript>Rules checked over 30 days ago are stale. Compare the checked date with today and recheck the official source.</noscript>
  </>;
}
