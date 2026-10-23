"use client";

import { useState, useEffect } from "react";
import passports from "@/public/data/passports.json";

const STORAGE_KEY = "visa-maps-passport";
const STORAGE_KEY_2 = "visa-maps-passport-2";
const PASSPORT_CODES = new Set(passports.map(({ code }) => code));

function validCode(value: string | null): string | null {
  const code = value?.toUpperCase() ?? "";
  return PASSPORT_CODES.has(code) ? code : null;
}

function saveSelection(passport: string, passport2: string | null) {
  try {
    localStorage.setItem(STORAGE_KEY, passport);
    if (passport2) localStorage.setItem(STORAGE_KEY_2, passport2);
    else localStorage.removeItem(STORAGE_KEY_2);
  } catch {
    // Browsing remains available when storage is disabled.
  }
}

export function useLocalPassport() {
  const [passport, setPassportState] = useState<string>("US");
  const [passport2, setPassport2State] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let primary = "US";
    let secondary: string | null = null;

    if (params.has("p") || params.has("p2")) {
      primary = validCode(params.get("p")) ?? "US";
      secondary = validCode(params.get("p2"));
    } else {
      try {
        primary = validCode(localStorage.getItem(STORAGE_KEY)) ?? "US";
        secondary = validCode(localStorage.getItem(STORAGE_KEY_2));
      } catch {
        // Use the default selection when storage is unavailable.
      }
    }
    if (secondary === primary) secondary = null;
    // Hydrate the initial selection from browser-only URL and storage after SSR.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPassportState(primary);
    setPassport2State(secondary);
    saveSelection(primary, secondary);
    setLoaded(true);
  }, []);

  function setPassport(value: string) {
    const code = validCode(value);
    if (!code) return;
    const secondary = passport2 === code ? null : passport2;
    setPassportState(code);
    setPassport2State(secondary);
    saveSelection(code, secondary);
  }

  function setPassport2(value: string | null) {
    const code = validCode(value);
    const secondary = code === passport ? null : code;
    setPassport2State(secondary);
    saveSelection(passport, secondary);
  }

  return { passport, passport2, setPassport, setPassport2, loaded };
}
