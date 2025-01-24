import React, { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
// import { socketService } from "@/socketIO/socketServices";
import { getAnnouncement } from "@/slices/adminSlice";

const UserAnnouncements = () => {
  // const [realtimeAnnouncements, setRealtimeAnnouncements] = useState([]);
  const dispatch = useDispatch();

  const { storedAnnouncements, isLoading, error } = useSelector((state) => {
    return {
      storedAnnouncements: state.admin.announcements || [],
      isLoading: state.admin.isLoading,
      error: state.admin.error,
    };
  });

  useEffect(() => {
    dispatch(getAnnouncement());

    // const handleAnnouncement = (announcement) => {
    //   setRealtimeAnnouncements((prev) => [
    //     {
    //       _id: Date.now(),
    //       ...announcement,
    //       timestamp: new Date().toISOString(),
    //     },
    //     ...prev,
    //   ]);
    // };

    // socketService.on("announcement", handleAnnouncement);

    return () => {
      // socketService.off("announcement", handleAnnouncement);
    };
  }, [dispatch]);

  const allAnnouncements = [
    // ...realtimeAnnouncements,
    ...storedAnnouncements.filter((a) => {
      // Check if there is a target, and if so, check if it's 'users' or 'all'
      if (a.target) {
        return a.target === "users" || a.target === "all";
      }
      // If there's no target field, include it by default
      return true;
    }),
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  if (error) {
    return <div className="flex justify-center p-4">Error: {error}</div>;
  }

  if (isLoading && allAnnouncements.length === 0) {
    return (
      <div className="flex justify-center p-4">Loading announcements...</div>
    );
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
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
              <Card
                key={announcement._id}
                className="p-4 border-l-4 border-l-blue-500 bg-blue-50"
              >
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
