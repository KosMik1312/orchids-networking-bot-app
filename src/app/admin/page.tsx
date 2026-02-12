"use client";

import { useState, useEffect } from "react";
import { AdminScreen } from "@/components/AdminScreen";

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (t) setToken(t);
  }, []);

  if (!token) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6" style={{ backgroundColor: "#E9E9E9" }}>
        <div className="text-[#E15859] text-xl font-bold">Нет токена</div>
        <div className="text-[#404243] text-center">Откройте админ-панель через команду /admin в боте.</div>
      </div>
    );
  }

  return <AdminScreen token={token} />;
}
