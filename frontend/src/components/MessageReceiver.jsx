import React, { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { socketService } from "@/socketIO/socketServices";
import { AlertCircle, Bell, CheckCircle, Info, XCircle } from "lucide-react";
import { store } from "@/store";

const MessageReceiver = () => {
  const { toast } = useToast();

  const getToastConfig = (type) => {
    switch (type) {
      case "announcement":
        return {
          icon: <Bell className="h-5 w-5 text-blue-500" />,
          className: "border-blue-500 bg-blue-50",
          titleClass: "text-blue-700",
          descriptionClass: "text-blue-600",
        };
      case "survey_completion":
        return {
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          className: "border-green-500 bg-green-50",
          titleClass: "text-green-700",
          descriptionClass: "text-green-600",
        };
      case "error":
        return {
          icon: <XCircle className="h-5 w-5 text-red-500" />,
          className: "border-red-500 bg-red-50",
          titleClass: "text-red-700",
          descriptionClass: "text-red-600",
        };
      case "warning":
        return {
          icon: <AlertCircle className="h-5 w-5 text-yellow-500" />,
          className: "border-yellow-500 bg-yellow-50",
          titleClass: "text-yellow-700",
          descriptionClass: "text-yellow-600",
        };
      default:
        return {
          icon: <Info className="h-5 w-5 text-gray-500" />,
          className: "border-gray-200 bg-gray-50",
          titleClass: "text-gray-700",
          descriptionClass: "text-gray-600",
        };
    }
  };

  useEffect(() => {
    const handleMessage = (message) => {
      console.log(`Received ${message.type}:`, message);

      const config = getToastConfig(message.type);

      store.dispatch({
        type: "admin/addRealtimeAnnouncement",
        payload: message,
      });

      toast({
        title: message.title,
        description: message.message,
        className: `flex gap-3 ${config.className}`,
        duration: 5000,
        action: <div className="flex items-center gap-2">{config.icon}</div>,
      });
    };

    socketService.on("announcement", handleMessage);
    socketService.on("notification", handleMessage);

    return () => {
      socketService.off("announcement", handleMessage);
      socketService.off("notification", handleMessage);
    };
  }, [toast]);

  return null;
};

export default MessageReceiver;
