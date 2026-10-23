"use client";
import { useRef, useState } from "react";
import { Share2, Check, Link as LinkIcon, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackShareClicked } from "@/lib/analytics";
interface ShareButtonProps { passport: string; passport2: string | null; }
export function ShareButton({ passport, passport2 }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [error, setError] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  function getShareUrl() { const params = new URLSearchParams({ p: passport }); if (passport2) params.set("p2", passport2); return `${window.location.origin}/?${params}`; }
  async function copyLink() {
    try { await navigator.clipboard.writeText(getShareUrl()); setCopied(true); setError(false); trackShareClicked("copy"); setTimeout(() => setCopied(false), 2000); setMenuOpen(false); }
    catch { setError(true); }
  }
  function shareTwitter() { window.open(`https://twitter.com/intent/tweet?${new URLSearchParams({ text: "Explore passport entry rules with official sources.", url: getShareUrl() })}`, "_blank", "noopener,noreferrer"); trackShareClicked("twitter"); setMenuOpen(false); }
  function shareWhatsApp() { window.open(`https://wa.me/?${new URLSearchParams({ text: `Explore passport entry rules with official sources. ${getShareUrl()}` })}`, "_blank", "noopener,noreferrer"); trackShareClicked("whatsapp"); setMenuOpen(false); }
  return <div className="share-control" ref={root} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setMenuOpen(false); }} onKeyDown={(event) => { if (event.key === "Escape") { setMenuOpen(false); root.current?.querySelector("button")?.focus(); } }}>
    <Button variant="outline" size="sm" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{copied ? <Check size={16} aria-hidden="true" /> : <Share2 size={16} aria-hidden="true" />}{copied ? "Copied!" : "Share"}</Button>
    {menuOpen && <div className="share-menu"><button onClick={copyLink}><LinkIcon size={16} aria-hidden="true" />Copy Link</button><button onClick={shareTwitter}><Twitter size={16} aria-hidden="true" />Twitter / X</button><button onClick={shareWhatsApp}>WhatsApp</button>{error && <p role="alert">Copy unavailable. Copy the address from your browser.</p>}</div>}
  </div>;
}
