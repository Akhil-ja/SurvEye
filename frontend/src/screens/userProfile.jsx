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
import { useState } from "react";

const ProfileView = () => {
  const [isNameDialogOpen, setNameDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "Name",
    contactNumber: "1234567890",
    email: "xyz@gmail.com",
  });
  const [newName, setNewName] = useState(profileData.name);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const handleSaveName = () => {
    if (newName.trim()) {
      setProfileData({ ...profileData, name: newName.trim() });
      setNameDialogOpen(false);
    } else {
      alert("Name cannot be empty");
    }
  };

  const handleSavePassword = () => {
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      alert("Please fill all the password fields");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      alert("New password and confirm password do not match");
      return;
    }

    console.log("Password updated:", newPassword);
    setPasswordDialogOpen(false);
    setOldPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
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

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4">
      <Card className="border border-purple-200">
        <CardContent className="p-0">
          <ProfileRow
            label="User Name"
            value={profileData.name}
            showArrow
            onClick={() => setNameDialogOpen(true)}
          />

          <Separator />
          <ProfileRow
            label="Contact Number"
            value={profileData.contactNumber}
          />
          <Separator />
          <ProfileRow label="Email" value={profileData.email} />
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
      <Dialog open={isNameDialogOpen} onOpenChange={setNameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Name</DialogTitle>
            <DialogDescription>
              Enter the new name you want to use.
            </DialogDescription>
          </DialogHeader>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mt-4"
            placeholder="Enter new name"
          />
          <Button className="mt-2 w-20 mx-auto" onClick={handleSaveName}>
            Save
          </Button>
        </DialogContent>
      </Dialog>

      {/* Password Change Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setPasswordDialogOpen}>
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

          <Button className="mt-4 w-full" onClick={handleSavePassword}>
            Save Password
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileView;
