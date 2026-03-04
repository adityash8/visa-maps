"use client";

import { useState } from "react";
import { Share2, Check, Link, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackShareClicked } from "@/lib/analytics";

interface ShareButtonProps {
  passport: string;
  passport2: string | null;
}

export function ShareButton({ passport, passport2 }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  function getShareUrl() {
    const params = new URLSearchParams();
    params.set("p", passport);
    if (passport2) params.set("p2", passport2);
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  }

  async function copyLink() {
    const url = getShareUrl();
    await navigator.clipboard.writeText(url);
    setCopied(true);
    trackShareClicked("copy");
    setTimeout(() => setCopied(false), 2000);
    setMenuOpen(false);
  }

  function shareTwitter() {
    const url = getShareUrl();
    const text = "Check out where my passport can take me!";
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      "_blank"
    );
    trackShareClicked("twitter");
    setMenuOpen(false);
  }

  function shareWhatsApp() {
    const url = getShareUrl();
    const text = `Check out where my passport can take me! ${url}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank"
    );
    trackShareClicked("whatsapp");
    setMenuOpen(false);
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}
        {copied ? "Copied!" : "Share"}
      </Button>

      {menuOpen && (
        <div className="absolute top-full mt-1 right-0 z-50 bg-white border rounded-lg shadow-xl overflow-hidden min-w-[160px]">
          <button
            onClick={copyLink}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50"
          >
            <Link className="h-4 w-4" />
            Copy Link
          </button>
          <button
            onClick={shareTwitter}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50"
          >
            <Twitter className="h-4 w-4" />
            Twitter / X
          </button>
          <button
            onClick={shareWhatsApp}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492l4.629-1.467A11.932 11.932 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818c-2.168 0-4.19-.585-5.931-1.607l-.425-.253-2.744.87.886-2.676-.278-.441A9.795 9.795 0 012.182 12c0-5.416 4.402-9.818 9.818-9.818S21.818 6.584 21.818 12 17.416 21.818 12 21.818z" />
            </svg>
            WhatsApp
          </button>
        </div>
      )}
    </div>
  );
}
