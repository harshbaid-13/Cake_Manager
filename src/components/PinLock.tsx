"use client";

import { useEffect, useRef, useState } from "react";

const PIN_CODE = "1234";
const STORAGE_KEY = "cake_pin";

export function PinLock() {
  const [pinBoxes, setPinBoxes] = useState(["", "", "", ""]);
  const [unlocked, setUnlocked] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState("");
  const pinRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    let ignore = false;
    void (async () => {
      const stored =
        typeof window !== "undefined"
          ? localStorage.getItem(STORAGE_KEY)
          : null;
      if (!ignore && stored === PIN_CODE) {
        setUnlocked(true);
      }
      if (!ignore) {
        setMounted(true);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pin = pinBoxes.join("");
    if (pin === PIN_CODE) {
      localStorage.setItem(STORAGE_KEY, PIN_CODE);
      setUnlocked(true);
      setError("");
    } else {
      setError("Incorrect PIN");
    }
  };

  const updatePinBox = (index: number, value: string) => {
    setPinBoxes((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  if (!mounted || unlocked) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
      style={{
        WebkitBackdropFilter: "blur(4px)",
        backdropFilter: "blur(4px)",
        overscrollBehavior: "none",
        touchAction: "none",
      }}
      tabIndex={-1}
      aria-modal={true}
      role="dialog"
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      <style>{`
        body { overflow: hidden !important; }
      `}</style>
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-semibold text-gray-900">Enter PIN</h2>
        <p className="mt-1 text-sm text-gray-600">For mom-only access</p>
        <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
          <div className="flex justify-between gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <input
                key={i}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={pinBoxes[i]}
                ref={(el) => {
                  pinRefs.current[i] = el;
                }}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  updatePinBox(i, val);
                  if (val && i < 3) {
                    pinRefs.current[i + 1]?.focus();
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && !pinBoxes[i] && i > 0) {
                    updatePinBox(i - 1, "");
                    pinRefs.current[i - 1]?.focus();
                  }
                }}
                className={`w-16 rounded-lg border border-gray-200 bg-white px-0 py-3 text-center text-2xl tracking-widest text-gray-900 placeholder:text-gray-500 focus:border-gray-400 focus:outline-none ${
                  error ? "border-red-400" : ""
                }`}
                placeholder="•"
                autoFocus={i === 0}
                aria-label={`PIN digit ${i + 1}`}
              />
            ))}
          </div>
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
