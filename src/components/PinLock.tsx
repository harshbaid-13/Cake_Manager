'use client';

import { useEffect, useState } from "react";

const PIN_CODE = "1234";
const STORAGE_KEY = "cake_pin";

export function PinLock() {
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (stored === PIN_CODE) {
      setUnlocked(true);
    }
    setMounted(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === PIN_CODE) {
      localStorage.setItem(STORAGE_KEY, PIN_CODE);
      setUnlocked(true);
      setError("");
    } else {
      setError("Incorrect PIN");
    }
  };

  if (!mounted || unlocked) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-semibold text-gray-900">Enter PIN</h2>
        <p className="mt-1 text-sm text-gray-600">For mom-only access</p>
        <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
          <input
            type="password"
            inputMode="numeric"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-3 text-lg tracking-widest focus:border-gray-400 focus:outline-none"
            placeholder="1234"
          />
          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          <button
            type="submit"
            className="w-full rounded-lg bg-emerald-600 py-3 text-white font-semibold"
          >
            Unlock
          </button>
        </form>
      </div>
    </div>
  );
}


