import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
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

import {
  updateCreatorProfile,
  changePassword,
  fetchCreatorProfile,
  resetPasswordChangeStatus,
  clearMessage,
} from "../slices/creatorSlice";
import { toast } from "react-toastify";

const CreatorProfile = () => {
  const dispatch = useDispatch();
  const { profile, isLoading, error, message, passwordChangeStatus } =
    useSelector((state) => state.creator);

  const [isNameDialogOpen, setNameDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isIndustryDialogOpen, setIndustryDialogOpen] = useState(false);
  const [newIndustry, setNewIndustry] = useState("");

  useEffect(() => {
    dispatch(fetchCreatorProfile());
  }, []);

  useEffect(() => {
    if (profile) {
      setNewName(profile.creator_name || "");
    }
  }, [profile]);

  useEffect(() => {
    if (profile) {
      setNewIndustry(profile.industry || "");
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
    if (newName.trim()) {
      await dispatch(updateCreatorProfile({ creator_name: newName.trim() }));
      setNameDialogOpen(false);
    }
  };

  const handleSaveIndustry = async () => {
    if (newIndustry) {
      await dispatch(updateCreatorProfile({ industry: newIndustry }));
      setIndustryDialogOpen(false);
    }
  };
  const handleSavePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      alert("New password and confirm password do not match");
      return;
    }

    await dispatch(changePassword({ oldPassword, newPassword }));
    if (passwordChangeStatus === "succeeded") {
      setPasswordDialogOpen(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      dispatch(resetPasswordChangeStatus());
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

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4">
      <Card className="border border-purple-200">
        <CardContent className="p-0">
          <ProfileRow
            label="User Name"
            value={profile?.creator_name || "Name"}
            showArrow
            onClick={() => setNameDialogOpen(true)}
          />
          <Separator />
          <ProfileRow
            label="Contact Number"
            value={profile?.number || "Not set"}
          />
          <Separator />
          <ProfileRow label="Email" value={profile?.email || "Not set"} />
          <Separator />
          <ProfileRow
            label="Industry"
            value={profile?.industry || "Not set"}
            showArrow
            onClick={() => setIndustryDialogOpen(true)}
          />
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

      <Dialog open={isIndustryDialogOpen} onOpenChange={setIndustryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Industry</DialogTitle>
            <DialogDescription>
              Select the industry you belong to.
            </DialogDescription>
          </DialogHeader>
          <select
            value={newIndustry}
            onChange={(e) => setNewIndustry(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mt-4"
          >
            <option value="">Select Your Industry</option>
            <option value="marketing">Marketing</option>
            <option value="personal">Personal</option>
            <option value="technology">Technology</option>
            <option value="education">Education</option>
            <option value="healthcare">Healthcare</option>
            <option value="finance">Finance</option>
            <option value="consulting">Consulting</option>
            <option value="real-estate">Real Estate</option>
            <option value="other">Other</option>
          </select>
          <Button
            className="mt-4 w-full"
            onClick={handleSaveIndustry}
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Industry"}
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

export default CreatorProfile;
