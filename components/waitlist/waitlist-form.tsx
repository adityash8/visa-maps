"use client";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { trackWaitlistSignup } from "@/lib/analytics";
export function WaitlistForm() {
  const id = useId();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");
  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const response = await fetch("/api/waitlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      if (response.ok) { setStatus("success"); trackWaitlistSignup(); setEmail(""); }
      else { setError(response.status === 503 ? "Signups are unavailable while the waitlist is being configured. Please try again later." : "We couldn’t save your email. Check the address and try again."); setStatus("error"); }
    } catch { setError("We couldn’t connect. Check your connection and try again."); setStatus("error"); }
  }
  if (status === "success") return <p className="success-message" role="status">Your email is on the waitlist. Visa-change alerts are not active yet.</p>;
  return <form onSubmit={handleSubmit} className="waitlist-form"><label htmlFor={id}>Email address</label><div className="waitlist-fields"><input id={id} name="email" autoComplete="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required aria-describedby={status === "error" ? `${id}-error` : undefined} /><Button type="submit" size="sm" disabled={status === "loading"} aria-busy={status === "loading"}>{status === "loading" ? "Saving…" : "Join Waitlist"}</Button></div>{status === "error" && <p id={`${id}-error`} className="error-message" role="alert">{error}</p>}</form>;
}
