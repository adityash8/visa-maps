import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/waitlist/route";

const db = vi.hoisted(() => ({
  getSupabase: vi.fn(), insert: vi.fn(), upsert: vi.fn(), from: vi.fn(),
}));
vi.mock("@/lib/supabase", () => ({ getSupabase: db.getSupabase }));

function request(body: unknown) {
  return new Request("https://visa-maps.example/api/waitlist", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  db.insert.mockResolvedValue({ error: null });
  db.upsert.mockResolvedValue({ error: null });
  db.from.mockReturnValue({ insert: db.insert, upsert: db.upsert });
  db.getSupabase.mockReturnValue({ from: db.from });
});

describe("waitlist POST", () => {
  it("returns 503 when persistence is not configured, without a false success", async () => {
    db.getSupabase.mockImplementation(() => { throw new Error("missing configuration"); });
    const response = await POST(request({ email: "traveler@example.com" }));
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: "Waitlist is unavailable. Please try again later." });
  });

  it.each([null, [], {}, { email: 4 }, { email: "a@" }, { email: "@example.com" },
    { email: "a b@example.com" }, { email: "a@example.com\nBcc: x@example.com" },
    { email: ".a@example.com" }, { email: "a..b@example.com" }, { email: "a.@example.com" },
    { email: `${"x".repeat(65)}@example.com` },
    { email: "a@example.com", confirmed: true }, { email: `${"x".repeat(255)}@example.com` },
  ])("rejects invalid or unsupported input %j", async (body) => {
    const response = await POST(request(body));
    expect(response.status).toBe(400);
    expect(db.getSupabase).not.toHaveBeenCalled();
  });

  it("rejects malformed JSON", async () => {
    const response = await POST(new Request("https://visa-maps.example/api/waitlist", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: "{",
    }));
    expect(response.status).toBe(400);
  });

  it("requires the JSON media type", async () => {
    const response = await POST(new Request("https://visa-maps.example/api/waitlist", {
      method: "POST", headers: { "Content-Type": "application/json-invalid" }, body: JSON.stringify({ email: "traveler@example.com" }),
    }));
    expect(response.status).toBe(415);
    expect(db.getSupabase).not.toHaveBeenCalled();
  });

  it("rejects an oversized request before accessing persistence", async () => {
    const response = await POST(request({ email: "traveler@example.com", padding: "x".repeat(2048) }));
    expect(response.status).toBe(413);
    expect(db.getSupabase).not.toHaveBeenCalled();
  });

  it("inserts a normalized email without requiring row update permission", async () => {
    const response = await POST(request({ email: " Traveler@Example.COM " }));
    expect(response.status).toBe(200);
    expect(db.insert).toHaveBeenCalledWith({ email: "traveler@example.com" });
    expect(db.upsert).not.toHaveBeenCalled();
    expect(await response.json()).toEqual({ ok: true });
  });

  it("returns the same result for a confirmed duplicate unique-key error", async () => {
    const error = { code: "23505", message: "duplicate key value violates unique constraint" };
    db.insert.mockResolvedValue({ error });
    db.upsert.mockResolvedValue({ error });
    const response = await POST(request({ email: "traveler@example.com" }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
  });

  it.each(["42501", "42P01", "23502", "23503", "23514"])("does not claim success for database error %s", async (code) => {
    const error = { code, message: "Sensitive database details must not be logged" };
    db.insert.mockResolvedValue({ error });
    db.upsert.mockResolvedValue({ error });
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const response = await POST(request({ email: "traveler@example.com" }));
    expect(response.status).toBe(503);
    expect(JSON.stringify(await response.json())).not.toContain("Sensitive");
    expect(log).not.toHaveBeenCalled();
    log.mockRestore();
  });

  it("handles a persistence transport failure without blaming the request", async () => {
    db.insert.mockRejectedValue(new Error("network failed"));
    db.upsert.mockRejectedValue(new Error("network failed"));
    expect((await POST(request({ email: "traveler@example.com" }))).status).toBe(503);
  });
});
