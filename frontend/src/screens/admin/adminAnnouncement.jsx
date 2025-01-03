import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { createAnnouncement } from "@/slices/adminSlice";
import { useDispatch } from "react-redux";

const AdminNotificationPanel = () => {
  const dispatch = useDispatch();
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [targetAudience, setTargetAudience] = useState("all");
  const [isSending, setIsSending] = useState(false);

  const sendGlobalNotification = async () => {
    if (!notificationTitle.trim() || !notificationMessage.trim()) {
      toast.error("Please fill in both title and message");
      return;
    }

    setIsSending(true);
    try {
      await dispatch(
        createAnnouncement({
          title: notificationTitle,
          message: notificationMessage,
          target: targetAudience,
        })
      ).unwrap();

      toast.success("Announcement sent successfully");
      setNotificationTitle("");
      setNotificationMessage("");
    } catch (error) {
      toast.error(error?.message || "Failed to send announcement");
      console.error("Error sending announcement:", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Global Announcement</h2>

      <div className="space-y-4">
        <Input
          placeholder="Announcement Title"
          value={notificationTitle}
          onChange={(e) => setNotificationTitle(e.target.value)}
        />

        <Textarea
          placeholder="Announcement Message"
          value={notificationMessage}
          onChange={(e) => setNotificationMessage(e.target.value)}
          rows={4}
        />

        <Select value={targetAudience} onValueChange={setTargetAudience}>
          <SelectTrigger>
            <SelectValue placeholder="Select target audience" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            <SelectItem value="users">Regular Users Only</SelectItem>
            <SelectItem value="creators">Creators Only</SelectItem>
          </SelectContent>
        </Select>

        <Button
          onClick={sendGlobalNotification}
          disabled={isSending}
          className="w-full"
        >
          {isSending ? "Sending..." : "Send Announcement"}
        </Button>
      </div>
    </div>
  );
};

export default AdminNotificationPanel;
