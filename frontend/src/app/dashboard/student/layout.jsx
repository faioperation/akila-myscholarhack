import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function StudentLayout({ children }) {
    return (
        <ProtectedRoute allowedRole="STUDENT">
            {children}
        </ProtectedRoute>
    );
}
