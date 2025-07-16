import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function AdminLayout({ children }) {
    return (
        <ProtectedRoute allowedRole="ADMIN">
            {children}
        </ProtectedRoute>
    );
}
