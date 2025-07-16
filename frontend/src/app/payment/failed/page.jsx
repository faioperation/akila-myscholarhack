import Link from "next/link";

export default function PaymentFailedPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0b0f1a] via-[#111827] to-[#1f2937] px-4 py-16">
      <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-3xl items-center justify-center">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur sm:p-12">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-rose-500/15 ring-1 ring-rose-400/40">
              <svg
                className="h-10 w-10 text-rose-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-3xl font-semibold text-white sm:text-4xl">
              Payment Failed
            </h1>
            <p className="mt-4 max-w-xl text-base text-slate-200/90 sm:text-lg">
              We could not process your payment. Please try again or choose a
              different method.
            </p>
            <div className="mt-10 flex w-full flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-full bg-[#FFCA42] px-6 py-3 text-sm font-semibold text-[#1a1a1a] shadow-lg transition hover:scale-[1.02] hover:bg-[#ffd96b]"
              >
                Try Again
              </Link>
              <Link
                href="/dashboard/student"
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white/90 transition hover:border-white/40 hover:text-white"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>

          <div className="mt-12 rounded-2xl border border-white/10 bg-white/5 px-5 py-6 text-center text-sm text-slate-200">
            If you were charged, contact support and we will fix it quickly.
          </div>
        </div>
      </div>
    </main>
  );
}
