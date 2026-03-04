import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    let supabase;
    try {
      supabase = getSupabase();
    } catch {
      // Supabase not configured — accept silently for demo
      return NextResponse.json({ ok: true });
    }

    const { error } = await supabase
      .from("waitlist")
      .upsert({ email }, { onConflict: "email" });

    if (error) {
      console.error("Waitlist insert error:", error);
      return NextResponse.json({ error: "Failed to join" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
