import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getAnnouncement } from "@/slices/adminSlice";

const UserAnnouncements = () => {
  const [localAnnouncements, setLocalAnnouncements] = useState([]);
  const dispatch = useDispatch();

  const { announcements, isLoading } = useSelector((state) => ({
    announcements: state.admin.announcements || [],
    isLoading: state.admin.isLoading,
  }));

  const connectSocket = () => {
    const authInfo = JSON.parse(sessionStorage.getItem("authInfo"));
    const { id: userId, role } = authInfo.user;
    console.log("userid:", userId);

    // const token = authInfo.tokens.accessToken;

    const socket = new WebSocket(
      `ws://localhost:3000/?userId=${userId}&role=${role}`
    );

    socket.onopen = () => {
      console.log("Connected to WebSocket server");
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed");
    };

    socket.onmessage = (event) => {
      console.log(event.data);
      const notification = JSON.parse(event.data);
      alert("New announcement received:", notification);

      toast.info(
        <div>
          <strong>{notification.title}</strong>
          <p>{notification.message}</p>
        </div>,
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        }
      );

      setLocalAnnouncements((prev) => [
        {
          _id: Date.now(),
          ...notification,
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ]);
    };

    return socket;
  };

  useEffect(() => {
    let socket;
    try {
      socket = connectSocket();
    } catch (error) {
      console.error("WebSocket connection error:", error);
    }

    dispatch(getAnnouncement());

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [dispatch]);

  const allAnnouncements = [...localAnnouncements, ...announcements].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">Loading announcements...</div>
    );
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <ToastContainer />
      <div className="flex items-center gap-2 mb-4">
        <Bell className="h-5 w-5" />
        <h2 className="text-xl font-semibold">Announcements</h2>
      </div>

      <ScrollArea className="h-[400px] rounded-md border">
        {allAnnouncements.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No announcements yet
          </div>
        ) : (
          <div className="space-y-4 p-4">
            {allAnnouncements.map((announcement) => (
              <Card key={announcement._id} className="p-4">
                <div className="font-medium">{announcement.title}</div>
                <div className="text-sm text-gray-600 mt-1">
                  {announcement.message}
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  {new Date(announcement.timestamp).toLocaleString()}
                </div>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default UserAnnouncements;
