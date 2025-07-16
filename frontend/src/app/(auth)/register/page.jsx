"use client";
import Link from "next/link";
import { Icon } from "@iconify/react";
import PrimaryBtn from "@/components/landing/PrimaryBtn";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/api";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleRegistration = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const form = e.target;

    const fullName = form.fullName.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value;

    // Validation
    if (!fullName || !email || !password) {
      setSubmitError("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      setSubmitError("Password must be at least 6 characters");
      return;
    }

    const data = { name: fullName, email, password };

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await apiPost("/user/register", data);

      // Handle different response structures
      if (response?.success) {
        sessionStorage.setItem("pendingVerificationEmail", email);
        form.reset();
        toast.success("Registration successful");
        router.push("/verify-email");
      } else {
        const errorMsg = response?.message || "Registration failed. Please try again later.";
        
        // setSubmitError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {

      setSubmitError("This Email Is already Registered. please login or Try with another Email");
      toast.error("This Email Is already Registered. please login or Try with another Email");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50  p-4">
      <div className={`max-w-md w-full bg-white rounded-2xl  ${submitError? "border border-red-300 shadow-lg shadow-red-200" : "border border-gray-100 shadow-lg"} overflow-hidden`}>
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#FFFAEC] mb-4">
              <Icon
                icon="solar:user-plus-bold"
                className="text-[#FFCA42] text-xl"
              />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Create Account
            </h2>
            <p className="text-gray-500 text-sm">
              Join us and start your journey
            </p>
          </div>

          <form onSubmit={handleRegistration} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Full Name
              </label>
              <div className="relative group">
                <input
                  type="text"
                  name="fullName"
                  required
                  className={cn(
                    "w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl",
                    "focus:ring-2 focus:ring-[#FFCA42]/20 focus:border-[#FFCA42] outline-none transition-all",
                    "placeholder:text-gray-400 text-gray-900",
                    "group-hover:border-gray-300"
                  )}
                  placeholder="John Doe"
                />
                <Icon
                  icon="solar:user-circle-linear"
                  className="absolute left-3.5 top-3.5 text-gray-400 text-lg transition-colors group-hover:text-gray-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Email Address
              </label>
              <div className="relative group">
                <input
                  type="email"
                  name="email"
                  required
                  className={cn(
                    "w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl",
                    "focus:ring-2 focus:ring-[#FFCA42]/20 focus:border-[#FFCA42] outline-none transition-all",
                    "placeholder:text-gray-400 text-gray-900",
                    "group-hover:border-gray-300"
                  )}
                  placeholder="name@example.com"
                />
                <Icon
                  icon="solar:letter-linear"
                  className="absolute left-3.5 top-3.5 text-gray-400 text-lg transition-colors group-hover:text-gray-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Password
              </label>
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  className={cn(
                    "w-full pl-10 pr-12 py-3 bg-white border border-gray-200 rounded-xl",
                    "focus:ring-2 focus:ring-[#FFCA42]/20 focus:border-[#FFCA42] outline-none transition-all",
                    "placeholder:text-gray-400 text-gray-900",
                    "group-hover:border-gray-300"
                  )}
                  placeholder="••••••••"
                />
                <Icon
                  icon="solar:lock-password-linear"
                  className="absolute left-3.5 top-3.5 text-gray-400 text-lg transition-colors group-hover:text-gray-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                >
                  <Icon 
                    icon={showPassword ? "solar:eye-bold" : "solar:eye-closed-bold"} 
                    className="text-lg" 
                  />
                </button>
              </div>
            </div>

            <PrimaryBtn
              title={isSubmitting ? "Signing Up..." : "Sign Up"}
              style="w-full rounded-xl"
              icon="solar:arrow-right-bold"
            />
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-gray-500 text-sm">
              Already have an account?{" "}
              <Link
                href="/signin"
                className="font-semibold text-[#FFCA42] hover:text-[#eeb526] transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
