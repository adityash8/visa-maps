"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { trackWaitlistSignup } from "@/lib/analytics";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus("success");
        trackWaitlistSignup(email);
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <p className="text-sm text-green-600 font-medium">
        You&apos;re on the list! We&apos;ll notify you when new features launch.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        className="flex-1 px-3 py-2 text-sm border rounded-lg outline-none focus:ring-1 focus:ring-gray-300"
      />
      <Button type="submit" size="sm" disabled={status === "loading"}>
        {status === "loading" ? "..." : "Join Waitlist"}
      </Button>
      {status === "error" && (
        <p className="text-xs text-red-500">Something went wrong. Try again.</p>
      )}
    </form>
  );
}
