"use client";
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { useState } from 'react';
import { cn } from "@/lib/utils";
import { apiPost } from "@/lib/api";
import toast from "react-hot-toast";
import { useRouter } from 'next/navigation';
export default function ForgotPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isSubmitting) return;

 
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

        setIsSubmitting(true);
        setError("");
        setSuccess(false);

        try {
            sessionStorage.setItem("pendingForgotPasswordEmail", email.trim());
            const response = await apiPost("/auth/forgot-password", { email: email.trim() });

            if (response?.success) {
                setSuccess(true);
                toast.success("Password reset OTP sent to your email!");
                setEmail(""); 
                router.push("/forgot-password-otp");
            } else {
                const errorMsg = response?.message || "Failed to send reset link. Please try again.";
                setError(errorMsg);
                toast.error(errorMsg);
            }
        } catch (err) {
            const errorMessage =
                err?.data?.message ||
                err?.data?.error ||
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                err?.message ||
                err?.response?.message ||
                "Failed to send reset link. Please try again.";

            if (errorMessage.includes("records that were required but not found") || 
                errorMessage.includes("An operation failed because it depends on one or more records")) {
                setError("The is no account with this email");
                toast.error("The is no account with this email");
            } else {
                setError(errorMessage);
                toast.error(errorMessage);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#FFFAEC] mb-4">
                            <Icon icon="solar:lock-keyhole-minimalistic-bold" className="text-[#FFCA42] text-xl" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password?</h2>
                        <p className="text-gray-500 text-sm">
                            {success
                                ? "Check your email for the password reset link."
                                : "Enter your email address to get the password reset link."
                            }
                        </p>
                    </div>

                    {success ? (
                        <div className="space-y-6">
                            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                                <Icon icon="solar:check-circle-bold" className="text-green-600 text-4xl mx-auto mb-2" />
                                <p className="text-sm text-green-800 font-medium">
                                    Password reset link has been sent to your email address.
                                </p>
                                <p className="text-xs text-green-600 mt-2">
                                    Please check your inbox and follow the instructions to reset your password.
                                </p>
                            </div>
                            <Link
                                href="/signin"
                                className="block w-full text-center font-medium text-sm md:text-base text-[#1B1B1B] bg-[#FFCA42] py-3.5 px-6 rounded-xl hover:bg-[#ffc942c2] duration-300 transition-colors"
                            >
                                Back to Sign In
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700">Email Address</label>
                                <div className="relative group">
                                    <input
                                        type="email"
                                        name="email"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            setError("");
                                        }}
                                        className={cn(
                                            "w-full pl-10 pr-4 py-3 bg-white border rounded-xl",
                                            "focus:ring-2 focus:ring-[#FFCA42]/20 focus:border-[#FFCA42] outline-none transition-all",
                                            "placeholder:text-gray-400 text-gray-900",
                                            error ? "border-red-300" : "border-gray-200",
                                            "group-hover:border-gray-300"
                                        )}
                                        placeholder="name@example.com"
                                        disabled={isSubmitting}
                                        required
                                    />
                                    <Icon icon="solar:letter-linear" className="absolute left-3.5 top-3.5 text-gray-400 text-lg transition-colors group-hover:text-gray-500" />
                                </div>
                                {error && (
                                    <p className="text-sm text-red-500">{error}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={cn(
                                    "w-full font-medium text-sm md:text-base text-[#1B1B1B] bg-[#FFCA42] py-3.5 px-6 rounded-xl",
                                    "hover:bg-[#ffc942c2] duration-300 transition-colors",
                                    "disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                )}
                            >
                                {isSubmitting ? "Sending..." : "Reset Password"}
                            </button>
                        </form>
                    )}

                    {!success && (
                        <div className="mt-8 text-center pt-6 border-t border-gray-100">
                            <Link href="/signin" className="text-gray-500 hover:text-gray-700 flex items-center justify-center gap-2 group transition-colors">
                                <Icon icon="solar:arrow-left-linear" className="group-hover:-translate-x-1 transition-transform" />
                                Back to Sign In
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
