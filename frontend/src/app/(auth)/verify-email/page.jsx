"use client";
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from "@/lib/utils";
import { apiPost } from "@/lib/api";
import toast from "react-hot-toast";

export default function VerifyEmailPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState("");


    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedEmail = sessionStorage.getItem('pendingVerificationEmail');
            if (storedEmail) {
                setEmail(storedEmail);
            }
        }
    }, []);

    const handleVerifyEmail = async (e) => {
        e.preventDefault();

        if (!email || !email.trim()) {
            setError("Please enter your email address");
            toast.error("Please enter your email address");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            setError("Please enter a valid email address");
            toast.error("Please enter a valid email address");
            return;
        }

        setIsSending(true);
        setError("");

        try {
            const response = await apiPost("/otp/send", { email: email.trim() });

            if (response?.success) {

                if (typeof window !== 'undefined') {
                    sessionStorage.setItem('pendingVerificationEmail', email.trim());
                }
                toast.success("Verification code sent to your email!");

                router.push("/otp");
            } else {
                const errorMsg = response?.message || "Failed to send verification code";
                setError(errorMsg);
                toast.error(errorMsg);
            }
        } catch (err) {

            toast.error(err?.message || "Failed to send verification code");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <div className="mx-auto w-16 h-16 bg-[#FFFAEC] rounded-full flex items-center justify-center mb-6">
                            <Icon icon="solar:letter-unread-bold" className="text-3xl text-[#FFCA42]" />
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h2>
                        <p className="text-gray-500 text-sm">
                            Enter your email address to receive a verification code
                        </p>
                    </div>

                    <form onSubmit={handleVerifyEmail} className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 text-left">
                                Email Address
                            </label>
                            <div className="relative group">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setError("");
                                    }}
                                    placeholder="name@example.com"
                                    className={cn(
                                        "w-full pl-10 pr-4 py-3 bg-white border rounded-xl",
                                        "focus:ring-2 focus:ring-[#FFCA42]/20 focus:border-[#FFCA42] outline-none transition-all",
                                        "placeholder:text-gray-400 text-gray-900",
                                        error ? "border-red-300" : "border-gray-200",
                                        "group-hover:border-gray-300"
                                    )}
                                    disabled={isSending}
                                />
                                <Icon
                                    icon="solar:letter-linear"
                                    className="absolute left-3.5 top-3.5 text-gray-400 text-lg transition-colors group-hover:text-gray-500"
                                />
                            </div>
                            {error && (
                                <p className="text-sm text-red-500 text-left">{error}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isSending}
                            className={cn(
                                "w-full font-medium text-sm md:text-base text-[#1B1B1B] bg-[#FFCA42] py-3.5 px-6 rounded-xl",
                                "hover:bg-[#ffc942c2] duration-300 transition-colors",
                                "disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            )}
                        >
                            {isSending ? "Sending..." : "Verify Email"}
                        </button>
                    </form>

                    <div className="mt-8 border-t border-gray-100 pt-6 text-center">
                        <Link href="/signin" className="text-gray-500 hover:text-gray-700 flex items-center justify-center gap-2 group transition-colors">
                            <Icon icon="solar:arrow-left-linear" className="group-hover:-translate-x-1 transition-transform" />
                            Back to Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
