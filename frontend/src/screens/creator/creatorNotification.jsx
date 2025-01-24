import React, { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bell,
  CheckCircle,
  Info,
  MessageCircleQuestion,
  RefreshCw,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getAnnouncement } from "@/slices/adminSlice";
import { getNotifications } from "@/slices/creatorSlice";

const CreatorNotification = () => {
  const dispatch = useDispatch();

  const { storedAnnouncements, announcementsLoading, announcementsError } =
    useSelector((state) => ({
      storedAnnouncements: Array.isArray(state.admin.announcements)
        ? state.admin.announcements
        : [],
      announcementsLoading: state.admin.isLoading,
      announcementsError: state.admin.error,
    }));

  const { storedNotifications, notificationsLoading, notificationsError } =
    useSelector((state) => ({
      storedNotifications: Array.isArray(state.creator.notifications)
        ? state.creator.notifications
        : [],
      notificationsLoading: state.creator.isLoading,
      notificationsError: state.creator.error,
    }));

  useEffect(() => {
    dispatch(getAnnouncement());
    dispatch(getNotifications());
  }, [dispatch]);

  const getCardStyle = (type) => {
    switch (type) {
      case "announcement":
        return "p-4 border-l-4 border-l-blue-500 bg-blue-50";
      case "survey_completion":
        return "p-4 border-l-4 border-l-green-500 bg-green-50";
      case "notification":
        return "p-4 border-l-4 border-l-purple-500 bg-purple-50";
      default:
        return "p-4 border-l-4 border-l-gray-500 bg-gray-50";
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "announcement":
        return <Bell className="h-5 w-5 text-blue-500" />;
      case "survey_completion":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "notification":
        return <Info className="h-5 w-5 text-purple-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const allItems = [
    ...storedAnnouncements
      .filter((a) => {
        if (a.target) {
          return a.target === "creators" || a.target === "all";
        }
        return true;
      })
      .map((a) => ({
        ...a,
        type: "announcement",
        title: a.title || "Announcement",
        message: a.message || "No details available",
        timestamp: a.timestamp || Date.now(),
      })),
    ...storedNotifications.map((n) => ({
      ...n,
      type: n.type || "notification",
      title: n.title || "Notification",
      message: n.message || "No details available",
      timestamp: n.timestamp || Date.now(),
    })),
  ]
    .filter((item) => item && typeof item === "object")
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const isLoading = announcementsLoading || notificationsLoading;
  const error = announcementsError || notificationsError;

  const handleRefresh = () => {
    dispatch(getAnnouncement());
    dispatch(getNotifications());
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <Info className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Unable to Load Notifications
        </h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button
          className="px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 flex items-center gap-2"
          onClick={handleRefresh}
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      </div>
    );
  }

  if (isLoading && allItems.length === 0) {
    return (
      <div className="flex justify-center p-4">Loading notifications...</div>
    );
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="h-5 w-5" />
        <h2 className="text-xl font-semibold">Notifications & Announcements</h2>
      </div>

      <ScrollArea className="h-[400px] rounded-md border">
        {allItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <MessageCircleQuestion className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              No Notifications
            </h3>
            <p className="text-gray-500 mb-4">
              You&apos;re all caught up! Check back later for updates.
            </p>
            <button
              className="px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors flex items-center gap-2"
              onClick={handleRefresh}
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        ) : (
          <div className="space-y-4 p-4">
            {allItems.map((item, index) => (
              <Card
                key={item._id || `notification-${index}`}
                className={getCardStyle(item.type)}
              >
                <div className="flex items-center gap-2 mb-1">
                  {getIcon(item.type)}
                  <div className="font-medium">{item.title}</div>
                </div>
                <div className="text-sm text-gray-600 mt-1">{item.message}</div>
                <div className="text-xs text-gray-400 mt-2">
                  {new Date(item.timestamp).toLocaleString()}
                </div>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default CreatorNotification;
