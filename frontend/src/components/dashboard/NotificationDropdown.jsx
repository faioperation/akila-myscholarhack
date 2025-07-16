"use client";
import { useState, useRef, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPatch, apiDelete } from "@/lib/api";



import toast from "react-hot-toast";

// Swipeable Notification Item Component
const NotificationItem = ({ item, onClick, onDelete }) => {
    const [offsetX, setOffsetX] = useState(0);
    const startX = useRef(0);
    const isDragging = useRef(false);

    const handlePointerDown = (e) => {
        startX.current = e.clientX;
        isDragging.current = true;
        // Capture pointer to track even if mouse leaves element
        e.target.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e) => {
        if (!isDragging.current) return;
        const currentX = e.clientX;
        const diff = currentX - startX.current;
        
        // Allow dragging in both directions up to 120px
        if (diff > -120 && diff < 120) {
             setOffsetX(diff);
        }
    };

    const handlePointerUp = (e) => {
        isDragging.current = false;
        e.target.releasePointerCapture(e.pointerId);
        
        // Threshold to snap open (~70px)
        if (offsetX < -70) {
            setOffsetX(-100); // Snap open left (reveal right btn)
        } else if (offsetX > 70) {
            setOffsetX(100); // Snap open right (reveal left btn)
        } else {
            setOffsetX(0); // Snap close
        }
    };

    const { notification } = item;

    return (
        <div className="relative overflow-hidden">
             {/* Delete Button Background (Right Side - Revealed on Left Swipe) */}
            <div className="absolute inset-y-0 right-0 w-[100px] bg-red-500 flex items-center justify-center text-white z-0">
                <button 
                  onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item.id);
                  }}
                  className="w-full h-full flex flex-col items-center justify-center"
                >
                    <Icon icon="mdi:trash-can-outline" width={24} height={24} />
                    <span className="text-xs font-medium">Delete</span>
                </button>
            </div>

            {/* Delete Button Background (Left Side - Revealed on Right Swipe) */}
            <div className="absolute inset-y-0 left-0 w-[100px] bg-red-500 flex items-center justify-center text-white z-0">
                <button 
                  onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item.id);
                  }}
                  className="w-full h-full flex flex-col items-center justify-center"
                >
                    <Icon icon="mdi:trash-can-outline" width={24} height={24} />
                    <span className="text-xs font-medium">Delete</span>
                </button>
            </div>

            {/* Foreground Content */}
            <div 
                className={`relative z-10 px-4 py-3 cursor-pointer transition-transform duration-200 ease-out ${
                    !item.isRead ? "bg-blue-50 hover:bg-blue-100" : "bg-white hover:bg-gray-50"
                }`}
                style={{ transform: `translateX(${offsetX}px)` }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                onClick={() => {
                     // Prevent click if dragged significantly
                     if (offsetX === 0) onClick(item);
                }}
            >
              <div className="flex gap-3 pointer-events-none"> {/* Disable pointer events on children to prevent interference */}
                <div className="flex-shrink-0 mt-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    !item.isRead ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"
                  }`}>
                    <Icon icon="solar:bell-bing-bold" width={16} height={16} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${!item.isRead ? "text-gray-900" : "text-gray-600"}`}>
                    {notification?.title || "Notification"}
                  </p>
                  <p className={`text-sm mt-1 line-clamp-2 ${!item.isRead ? "text-gray-800" : "text-gray-500"}`}>
                    {notification?.message || notification?.description || ""}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "numeric" }) : ""}
                  </p>
                </div>
                {!item.isRead && (
                  <div className="flex-shrink-0 self-center">
                    <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                  </div>
                )}
              </div>
            </div>
        </div>
    );
};

export default function NotificationDropdown({ isAdmin, onClose }) {
  const dropdownRef = useRef(null);
  const queryClient = useQueryClient();

  // Fetch notifications based on role
  const { data: notificationsResponse, isLoading } = useQuery({
    queryKey: ["notifications", isAdmin ? "admin" : "student"],
    queryFn: async () => {
      const endpoint = isAdmin ? "/notifications/admin" : "/notifications/student";
      const response = await apiGet(endpoint);
      return response;
    },
  });

  const notifications = notificationsResponse?.data || [];

  // Mark as read mutation
  const readMutation = useMutation({
    mutationFn: async (id) => {
      const endpoint = isAdmin 
        ? `/notifications/admin/${id}/read` 
        : `/notifications/student/${id}/read`;
      return apiPatch(endpoint);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const endpoint = isAdmin 
        ? `/notifications/admin/${id}` 
        : `/notifications/student/${id}`;
      return apiDelete(endpoint);
    },
    onSuccess: () => {
      toast.success("Notification deleted");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: () => {
        toast.error("Failed to delete notification");
    }
  });

  const handleNotificationClick = (notificationItem) => {
    if (!notificationItem.isRead) {
        // Correct endpoint for student is .../read as per prompt
        // Assuming admin also follows same pattern for consistency, though prompt was specific about student read
        readMutation.mutate(notificationItem.id);
    }
  };

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 animate-fadeIn max-h-[500px] overflow-y-auto"
      style={{ top: "100%" }}
    >
      <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-semibold text-gray-900">Notifications</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <Icon icon="mdi:close" width={20} height={20} />
        </button>
      </div>

      {isLoading ? (
        <div className="py-8 flex justify-center">
          <Icon icon="svg-spinners:3-dots-fade" width="24" height="24" className="text-gray-400" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="py-8 text-center text-gray-500">
          <p>No notifications found</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {notifications.map((item, index) => (
            <NotificationItem 
               key={item.id || index} 
               item={item} 
               onClick={handleNotificationClick}
               onDelete={(id) => deleteMutation.mutate(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
