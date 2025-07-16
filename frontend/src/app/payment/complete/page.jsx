"use client";

import { getAccessToken, setLocalStorage, USER_DATA_KEY, setCookie, ACTIVE_PLAN_KEY } from "@/lib/auth-storage";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function PaymentCompletePage() {
  const [isPlanActive, setIsPlanActive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let interval;

    const checkPlanStatus = async () => {
      const token = getAccessToken();
      if (!token) return;

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/me`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          }
        );

        const data = await res.json();
        
        if (data?.data) {
          const user = data.data;
          if (user.isPlan) {
            setIsPlanActive(true);
            setLoading(false);
            
            // Update storage with new status so the rest of the app knows
            setLocalStorage(USER_DATA_KEY, user);
            setCookie(ACTIVE_PLAN_KEY, true, 7);
            
            if (interval) {
              clearInterval(interval);
            }
          }
        }
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    // Initial check
    checkPlanStatus();

    // Check every 3 seconds
    interval = setInterval(checkPlanStatus, 3000);

    // Timeout after 2 minutes (40 intervals) to stop polling just in case it takes too long
    const timeout = setTimeout(() => {
      clearInterval(interval);
      setLoading(false);
    }, 120000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <main className="min-h-screen bg-linear-to-br from-[#0f172a] via-[#111827] to-[#1f2937] px-4 py-16">
      <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-3xl items-center justify-center">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur sm:p-12">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-400/40">
              <svg
                className="h-10 w-10 text-emerald-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h1 className="text-3xl font-semibold text-white sm:text-4xl">
              {loading ? (
                "Activating your plan..."
              ) :  (
                isPlanActive ? "Payment Successful!" : "Payment Received!"
              )}
            </h1>
            <p className="mt-4 max-w-xl text-base text-slate-200/90 sm:text-lg">
              Your payment was successful 🎉 Your subscription is being
              activated and may take up to
              <span className="font-semibold text-white"> 1-2 minutes </span>
              to reflect in your account.
              <br />
              <br />
              {isPlanActive 
                ? "Your plan is now active! You can proceed to your dashboard."
                : "Checking your plan status..."}
            </p>

            <div className="mt-10 flex w-full flex-col gap-4 sm:flex-row sm:justify-center">
              {loading ? (
                <div className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white/90">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </div>
              ) : isPlanActive ? (
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400"
                >
                  Go to Home
                </Link>
              ) : (
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white/90 transition hover:border-white/40 hover:text-white"
                >
                  View Plans
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
