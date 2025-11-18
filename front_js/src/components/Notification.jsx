// src/components/Notification.jsx
import React from "react";
import { AlertCircle, CheckCircle, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Notification = () => {
  const { notification, setNotification } = useAuth();
  if (!notification.visible) return null;
  const isError = notification.type === "error";

  return (
    <div className={`fixed bottom-5 right-5 z-50 max-w-sm rounded-lg shadow-lg p-4 flex items-center space-x-3 ${isError ? "bg-red-500" : "bg-green-500"} text-white`}>
      {isError ? <AlertCircle className="h-6 w-6" /> : <CheckCircle className="h-6 w-6" />}
      <span>{notification.message}</span>
      <button onClick={() => setNotification({ ...notification, visible: false })} className="ml-auto -mr-1 p-1">
        <X className="h-5 w-5" />
      </button>
    </div>
  );
};

export default Notification;