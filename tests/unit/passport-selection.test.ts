import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLocalPassport } from "@/lib/use-local-passport";

const hook = vi.hoisted(() => ({ states: [] as unknown[] }));
vi.mock("react", () => ({
  useState: (initial: unknown) => {
    const index = hook.states.length;
    hook.states.push(initial);
    return [initial, (value: unknown) => { hook.states[index] = value; }];
  },
  useEffect: (effect: () => void) => effect(),
}));

const saved = new Map<string, string>();
const storage = {
  getItem: (key: string) => saved.get(key) ?? null,
  setItem: (key: string, value: string) => { saved.set(key, value); },
  removeItem: (key: string) => { saved.delete(key); },
};

function useInitialize(search: string) {
  vi.stubGlobal("window", { location: { search } });
  return useLocalPassport();
}

beforeEach(() => {
  hook.states = [];
  saved.clear();
  vi.stubGlobal("localStorage", storage);
});

describe("passport persistence", () => {
  it("lets an explicit single-passport link clear the locally saved second passport", () => {
    saved.set("visa-maps-passport", "US");
    saved.set("visa-maps-passport-2", "GB");
    useInitialize("?p=IN");
    expect(hook.states).toEqual(["IN", null, true]);
    expect(saved.has("visa-maps-passport-2")).toBe(false);
  });

  it("uses valid explicit dual-passport links instead of storage", () => {
    saved.set("visa-maps-passport", "IN");
    useInitialize("?p=US&p2=GB");
    expect(hook.states).toEqual(["US", "GB", true]);
  });

  it("normalizes lowercase valid links and removes duplicate passports", () => {
    useInitialize("?p=gb&p2=GB");
    expect(hook.states).toEqual(["GB", null, true]);
  });

  it("uses a deterministic default for invalid explicit links, without restoring storage", () => {
    saved.set("visa-maps-passport", "IN");
    saved.set("visa-maps-passport-2", "GB");
    useInitialize("?p=XX&p2=invalid");
    expect(hook.states).toEqual(["US", null, true]);
  });

  it("validates saved passport codes when there is no explicit selection", () => {
    saved.set("visa-maps-passport", "xx");
    saved.set("visa-maps-passport-2", "also-invalid");
    useInitialize("");
    expect(hook.states).toEqual(["US", null, true]);
  });

  it("loads a valid saved pair without a URL selection", () => {
    saved.set("visa-maps-passport", "IN");
    saved.set("visa-maps-passport-2", "US");
    useInitialize("");
    expect(hook.states).toEqual(["IN", "US", true]);
  });

  it("still loads and changes passports when browser storage is unavailable", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => { throw new DOMException("Storage disabled", "SecurityError"); },
      setItem: () => { throw new DOMException("Storage disabled", "SecurityError"); },
      removeItem: () => { throw new DOMException("Storage disabled", "SecurityError"); },
    });
    const result = useInitialize("?p=IN");
    expect(hook.states).toEqual(["IN", null, true]);
    expect(() => result.setPassport("GB")).not.toThrow();
    expect(() => result.setPassport2("US")).not.toThrow();
    expect(() => result.setPassport2(null)).not.toThrow();
  });
});
