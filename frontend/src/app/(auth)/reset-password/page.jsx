"use client";
import Link from "next/link";
import { Icon } from "@iconify/react";
import PrimaryBtn from "@/components/landing/PrimaryBtn";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/api";
import toast from "react-hot-toast";
import axios from "axios";
export default function ResetPasswordPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [resetToken, setResetToken] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Get resetToken from sessionStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedToken = sessionStorage.getItem('resetToken');
            if (storedToken) {
                setResetToken(storedToken);
            } else {
                // If no resetToken found, redirect to forgot password page
                toast.error("Please start the password reset process");
                router.push("/forgot-password");
            }
        }
    }, [router]);

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        const form = e.target;
        const newPassword = form.newPassword.value;
        const confirmPassword = form.confirmPassword.value;

        // Validation
        if (!newPassword || !confirmPassword) {
            setSubmitError("Please fill in all fields");
            toast.error("Please fill in all fields");
            return;
        }

        if (newPassword.length < 6) {
            setSubmitError("Password must be at least 6 characters");
            toast.error("Password must be at least 6 characters");
            return;
        }

        if (newPassword !== confirmPassword) {
            setSubmitError("Passwords do not match");
            toast.error("Passwords do not match");
            return;
        }

        if (!resetToken) {
            setSubmitError("Reset token not found. Please start the reset process again.");
            toast.error("Reset token not found. Please start the reset process again.");
            router.push("/forgot-password");
            return;
        }

        setIsSubmitting(true);
        setSubmitError("");

        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/reset-password`,
                {
                    newPassword: newPassword,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${resetToken}`,
                    },
                }
            );

            // Axios returns response.data, so check response.data.success
            if (response?.data?.success) {
                // Clear sessionStorage
                if (typeof window !== 'undefined') {
                    sessionStorage.removeItem('resetToken');
                    sessionStorage.removeItem('pendingForgotPasswordEmail');
                }

                toast.success("Password reset successfully!");

                // Redirect to signin page
                setTimeout(() => {
                    router.push("/signin");
                }, 1000);
            } else {
                const errorMsg = response?.data?.message || response?.data?.error || "Failed to reset password. Please try again.";
                setSubmitError(errorMsg);
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
                "Failed to reset password. Please try again.";

            setSubmitError(errorMessage);
            toast.error(errorMessage);
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
                            <Icon icon="solar:lock-password-bold" className="text-[#FFCA42] text-xl" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h2>
                        <p className="text-gray-500 text-sm">Enter your new password</p>
                    </div>

                    <form onSubmit={handleResetPassword} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700">New Password</label>
                            <div className="relative group">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="newPassword"
                                    required
                                    className={cn(
                                        "w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-xl",
                                        "focus:ring-2 focus:ring-[#FFCA42]/20 focus:border-[#FFCA42] outline-none transition-all",
                                        "placeholder:text-gray-400 text-gray-900",
                                        "group-hover:border-gray-300"
                                    )}
                                    placeholder="••••••••"
                                />
                                <Icon icon="solar:lock-password-linear" className="absolute left-3.5 top-3.5 text-gray-400 text-lg transition-colors group-hover:text-gray-500" />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <Icon icon={showPassword ? "solar:eye-bold" : "solar:eye-closed-bold"} className="text-lg" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700">Confirm Password</label>
                            <div className="relative group">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    required
                                    className={cn(
                                        "w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-xl",
                                        "focus:ring-2 focus:ring-[#FFCA42]/20 focus:border-[#FFCA42] outline-none transition-all",
                                        "placeholder:text-gray-400 text-gray-900",
                                        "group-hover:border-gray-300"
                                    )}
                                    placeholder="••••••••"
                                />
                                <Icon icon="solar:lock-password-linear" className="absolute left-3.5 top-3.5 text-gray-400 text-lg transition-colors group-hover:text-gray-500" />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <Icon icon={showConfirmPassword ? "solar:eye-bold" : "solar:eye-closed-bold"} className="text-lg" />
                                </button>
                            </div>
                        </div>

                        {submitError ? (
                            <p className="text-sm text-red-500">{submitError}</p>
                        ) : null}

                        <PrimaryBtn
                            title={isSubmitting ? "Resetting..." : "Reset Password"}
                            style="w-full rounded-xl"
                            icon="solar:lock-password-bold"
                        />
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
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
