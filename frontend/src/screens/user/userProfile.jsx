import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUserProfile,
  updateUserProfile,
  changePassword,
  clearMessage,
} from "../../slices/userSlice";

const ProfileView = () => {
  const dispatch = useDispatch();

  // Add debugging log to check Redux state
  const userState = useSelector((state) => {
    console.log("Redux State:", state);
    return (
      state?.user || {
        profile: null,
        isLoading: false,
        error: null,
        message: "",
        passwordChangeStatus: "idle",
      }
    );
  });

  // Safely destructure with default values
  const {
    profile = null,
    isLoading = false,
    error = null,
    message = "",
    passwordChangeStatus = "idle",
  } = userState;

  const [isNameDialogOpen, setNameDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // Calculate fullName only if profile exists
  const fullName = profile
    ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim()
    : "";

  useEffect(() => {
    try {
      dispatch(fetchUserProfile());
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  }, [dispatch]);

  useEffect(() => {
    if (profile?.first_name && profile?.last_name) {
      setNewName(`${profile.first_name} ${profile.last_name}`);
    }
  }, [profile]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearMessage());
    }
    if (message) {
      toast.success(message);
      setNameDialogOpen(false);
      dispatch(clearMessage());
    }
  }, [error, message]);

  const handleSaveName = async () => {
    if (!newName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    const [firstName, ...lastNameParts] = newName.trim().split(" ");
    const lastName = lastNameParts.join(" ");

    try {
      await dispatch(
        updateUserProfile({
          ...profile,
          first_name: firstName,
          last_name: lastName || "",
        })
      ).unwrap();
      setNameDialogOpen(false);
    } catch (err) {
      console.error("Error updating name:", err);
    }
  };

  const handleSavePassword = async () => {
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      toast.error("Please fill all the password fields");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    try {
      await dispatch(changePassword({ oldPassword, newPassword })).unwrap();
      setPasswordDialogOpen(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      console.error("Error changing password:", err);
    }
  };

  const ProfileRow = ({ label, value, showArrow = false, onClick }) => (
    <div
      className={`flex justify-between items-center p-4 border-b border-gray-100 ${
        onClick ? "cursor-pointer" : ""
      }`}
      onClick={onClick}
    >
      <span className="text-gray-600">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-black">{value}</span>
        {showArrow && <ChevronRight className="h-4 w-4 text-gray-400" />}
      </div>
    </div>
  );

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center p-4">Loading profile data...</div>
    );
  }

  // Show error state if Redux store is not properly connected
  if (!userState) {
    return (
      <div className="flex justify-center p-4 text-red-600">
        Error: Unable to connect to user state. Please check Redux store
        configuration.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4">
      {message && (
        <div className="bg-green-100 text-green-700 p-4 rounded mb-4">
          {message}
        </div>
      )}

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>
      )}

      <Card className="border border-purple-200">
        <CardContent className="p-0">
          <ProfileRow
            label="Name"
            value={fullName || "Loading..."}
            showArrow
            onClick={() => setNameDialogOpen(true)}
          />
          <Separator />
          <ProfileRow
            label="Contact Number"
            value={profile?.number || "Loading..."}
          />
          <Separator />
          <ProfileRow label="Email" value={profile?.email || "Loading..."} />
          <Separator />
        </CardContent>
      </Card>

      <Button
        variant="ghost"
        className="w-full justify-between bg-red-50 hover:bg-red-100 text-red-600"
        onClick={() => setPasswordDialogOpen(true)}
      >
        <span>Change Password</span>
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Name Edit Dialog */}
      <Dialog
        open={isNameDialogOpen}
        onOpenChange={(open) => {
          setNameDialogOpen(open);
          if (!open) {
            dispatch(clearMessage());
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Name</DialogTitle>
            <DialogDescription>
              Enter your full name (first name and last name).
            </DialogDescription>
          </DialogHeader>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mt-4"
            placeholder="Enter full name"
          />
          <Button
            className="mt-2 w-20 mx-auto"
            onClick={handleSaveName}
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </DialogContent>
      </Dialog>

      {/* Password Change Dialog */}
      <Dialog
        open={isPasswordDialogOpen}
        onOpenChange={(open) => {
          setPasswordDialogOpen(open);
          if (!open) {
            dispatch(clearMessage());
            setOldPassword("");
            setNewPassword("");
            setConfirmNewPassword("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and the new password you'd like to
              set.
            </DialogDescription>
          </DialogHeader>

          <input
            type="password"
            placeholder="Old Password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mt-4"
          />

          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mt-4"
          />

          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mt-4"
          />

          <Button
            className="mt-4 w-full"
            onClick={handleSavePassword}
            disabled={passwordChangeStatus === "loading"}
          >
            {passwordChangeStatus === "loading" ? "Saving..." : "Save Password"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileView;
