"use client";

import { useState, useEffect, useRef } from "react";
import { AdminScreen } from "@/components/AdminScreen";

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let isMounted = true;

    // 1. Проверяем URL-параметр ?token=
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get("token");
    if (urlToken) {
      setToken(urlToken);
      setLoading(false);
      return;
    }

    // 2. Проверяем Telegram WebApp initData
    const webApp = (window as any).Telegram?.WebApp;
    if (webApp && webApp.initData) {
      setToken(webApp.initData);
      setLoading(false);
      return;
    }

    // 3. Ждём инициализации Telegram WebApp
    let attempts = 0;
    pollingRef.current = setInterval(() => {
      attempts++;
      const wa = (window as any).Telegram?.WebApp;
      if (wa && wa.initData) {
        clearInterval(pollingRef.current!);
        if (isMounted) {
          setToken(wa.initData);
          setLoading(false);
        }
      } else if (attempts > 25) {
        clearInterval(pollingRef.current!);
        if (isMounted) setLoading(false);
      }
    }, 200);

    return () => {
      isMounted = false;
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#E9E9E9" }}>
        <div className="text-[#404243] text-lg">Загрузка...</div>
      </div>
    );
  }

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
