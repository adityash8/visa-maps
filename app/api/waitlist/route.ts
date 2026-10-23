import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

const MAX_BODY_BYTES = 1024;
const UNAVAILABLE = "Waitlist is unavailable. Please try again later.";

export async function POST(request: Request) {
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    return NextResponse.json({ error: "Expected JSON" }, { status: 415 });
  }

  let body: unknown;
  try {
    const reader = request.body?.getReader();
    if (!reader) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    const decoder = new TextDecoder();
    let bytes = 0;
    let text = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > MAX_BODY_BYTES) {
        await reader.cancel();
        return NextResponse.json({ error: "Request is too large" }, { status: 413 });
      }
      text += decoder.decode(value, { stream: true });
    }
    body = JSON.parse(text + decoder.decode());
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body) || Object.keys(body).some((key) => key !== "email")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  const rawEmail = (body as { email?: unknown }).email;
  if (typeof rawEmail !== "string") return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  const email = rawEmail.trim().toLowerCase();
  if (email.length > 254 || email.split("@")[0].length > 64 || !/^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  try {
    const { error } = await getSupabase().from("waitlist").insert({ email });
    if (error && error.code !== "23505") {
      return NextResponse.json({ error: UNAVAILABLE }, { status: 503 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: UNAVAILABLE }, { status: 503 });
  }
}
