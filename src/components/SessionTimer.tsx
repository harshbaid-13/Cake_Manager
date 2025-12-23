"use client";

import { useEffect, useMemo, useState } from "react";

type Session = {
  id: string;
  startTime: string;
  endTime: string | null;
  date: string;
};

const formatDuration = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

export function SessionTimer() {
  const [active, setActive] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let ignore = false;
    void (async () => {
      const res = await fetch("/api/sessions", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (!ignore) {
        setActive(data.activeSession ?? null);
      }
    })();

    return () => {
      ignore = true;
    };
  }, []);

  const startSession = async () => {
    setLoading(true);
    const res = await fetch("/api/sessions", { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setActive(data.session);
    }
    setLoading(false);
  };

  const stopSession = async () => {
    if (!active) return;
    setLoading(true);
    await fetch("/api/sessions", { method: "PATCH" });
    setActive(null);
    setLoading(false);
  };

  const elapsedMs = useMemo(() => {
    if (!active) return 0;
    const start = new Date(active.startTime).getTime();
    const end = new Date().getTime();
    return end - start;
  }, [active]);

  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      setActive((current) =>
        current ? { ...current, endTime: current.endTime } : current
      );
    }, 60000);
    return () => clearInterval(interval);
  }, [active]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Kitchen Session</p>
          {active ? (
            <p className="text-xl font-semibold text-emerald-700">
              Active · {formatDuration(elapsedMs)}
            </p>
          ) : (
            <p className="text-xl font-semibold text-gray-800">Not running</p>
          )}
        </div>
        {active ? (
          <button
            onClick={stopSession}
            disabled={loading}
            className="rounded-full bg-red-500 px-4 py-2 text-white font-semibold shadow"
          >
            Stop
          </button>
        ) : (
          <button
            onClick={startSession}
            disabled={loading}
            className="rounded-full bg-emerald-600 px-4 py-2 text-white font-semibold shadow"
          >
            Start
          </button>
        )}
      </div>
    </div>
  );
}
