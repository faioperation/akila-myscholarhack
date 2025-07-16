"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, getUserRole, hasActivePlan } from "@/lib/auth";

export default function ProtectedRoute({ children, allowedRole = null }) {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = () => {
            const authStatus = isAuthenticated();
            const userRole = getUserRole();
            const planStatus = hasActivePlan();

            if (!authStatus) {
                // Not authenticated, redirect to signin
                router.push("/signin");
                return;
            }

            // Check if student has an active plan
            if (userRole === "STUDENT" && !planStatus) {
                router.push("/pricing");
                return;
            }

            if (allowedRole && userRole !== allowedRole) {
                // Authenticated but wrong role
                // Redirect to signin as requested by the user for strictness
                router.push("/signin");
                return;
            }

            // All checks passed
            setIsAuthorized(true);
            setIsLoading(false);
        };

        checkAuth();
    }, [router, allowedRole]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return isAuthorized ? children : null;
}
