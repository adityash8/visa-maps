"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "visa-maps-passport";
const STORAGE_KEY_2 = "visa-maps-passport-2";

export function useLocalPassport() {
  const [passport, setPassportState] = useState<string>("US");
  const [passport2, setPassport2State] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const p = params.get("p");
    const p2 = params.get("p2");

    if (p) {
      setPassportState(p);
      localStorage.setItem(STORAGE_KEY, p);
    } else {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setPassportState(stored);
    }

    if (p2) {
      setPassport2State(p2);
      localStorage.setItem(STORAGE_KEY_2, p2);
    } else {
      const stored2 = localStorage.getItem(STORAGE_KEY_2);
      if (stored2) setPassport2State(stored2);
    }

    setLoaded(true);
  }, []);

  function setPassport(code: string) {
    setPassportState(code);
    localStorage.setItem(STORAGE_KEY, code);
  }

  function setPassport2(code: string | null) {
    setPassport2State(code);
    if (code) {
      localStorage.setItem(STORAGE_KEY_2, code);
    } else {
      localStorage.removeItem(STORAGE_KEY_2);
    }
  }

  return { passport, passport2, setPassport, setPassport2, loaded };
}
