import React from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getOccupations } from "@/slices/adminSlice";
import {
  fetchUserProfile,
  updateUserProfile,
  changePassword,
  clearMessage,
} from "../../slices/userSlice";

const ProfileView = () => {
  const dispatch = useDispatch();
  const userState = useSelector((state) => {
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

  const adminState = useSelector((state) => state?.admin || {});

  const {
    profile = null,
    isLoading = false,
    error = null,
    message = "",
    passwordChangeStatus = "idle",
  } = userState;

  const { occupations = [] } = adminState;

  const [isNameDialogOpen, setNameDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [isDobDialogOpen, setDobDialogOpen] = useState(false);
  const [isOccupationDialogOpen, setOccupationDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [selectedOccupation, setSelectedOccupation] = useState("");

  const fullName = profile
    ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim()
    : "";

  useEffect(() => {
    try {
      dispatch(fetchUserProfile());
      dispatch(getOccupations());
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [dispatch]);

  useEffect(() => {
    if (profile?.first_name && profile?.last_name) {
      setNewName(`${profile.first_name} ${profile.last_name}`);
    }
    if (profile?.occupation) {
      setSelectedOccupation(profile.occupation);
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
      setDobDialogOpen(false);
      setOccupationDialogOpen(false);
      dispatch(clearMessage());
    }
  }, [error, message, dispatch]);

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

  const handleSaveDob = async () => {
    if (!dateOfBirth) {
      toast.error("Please select a date of birth");
      return;
    }

    try {
      await dispatch(
        updateUserProfile({
          ...profile,
          date_of_birth: dateOfBirth,
        })
      ).unwrap();
      setDobDialogOpen(false);
      dispatch(fetchUserProfile());
    } catch (err) {
      console.error("Error updating date of birth:", err);
    }
  };

  const handleSaveOccupation = async () => {
    if (!selectedOccupation) {
      toast.error("Please select an occupation");
      return;
    }

    try {
      await dispatch(
        updateUserProfile({
          ...profile,
          occupation: selectedOccupation,
        })
      ).unwrap();

      await dispatch(fetchUserProfile());

      setOccupationDialogOpen(false);
    } catch (err) {
      console.error("Error updating occupation:", err);
      toast.error("Failed to update occupation. Please try again.");
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

  const AgeRow = () => (
    <ProfileRow
      label="Age"
      value={
        profile?.age ? (
          profile.age
        ) : (
          <Button
            variant="ghost"
            className="text-blue-600 hover:text-blue-700 p-0"
            onClick={() => setDobDialogOpen(true)}
          >
            Add Date of Birth
          </Button>
        )
      }
      showArrow={!profile?.age}
      onClick={() => profile?.age && setDobDialogOpen(true)}
    />
  );

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">Loading profile data...</div>
    );
  }

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
          <ProfileRow label="Email" value={profile?.email || "Loading..."} />
          <Separator />
          <AgeRow />
          <Separator />
          {profile?.occupation && (
            <ProfileRow
              label="Occupation"
              value={profile.occupation.name}
              showArrow
              onClick={() => setOccupationDialogOpen(true)}
            />
          )}
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
              Enter your current password and the new password you&apos;d like
              to set.
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

      {/* Date of Birth Dialog */}
      <Dialog
        open={isDobDialogOpen}
        onOpenChange={(open) => {
          setDobDialogOpen(open);
          if (!open) {
            dispatch(clearMessage());
            setDateOfBirth("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {profile?.age ? "Update Date of Birth" : "Add Date of Birth"}
            </DialogTitle>
            <DialogDescription>
              Please select your date of birth.
            </DialogDescription>
          </DialogHeader>

          <input
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mt-4"
            max={new Date().toISOString().split("T")[0]}
          />

          <Button
            className="mt-4 w-full"
            onClick={handleSaveDob}
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Date of Birth"}
          </Button>
        </DialogContent>
      </Dialog>

      {/* Occupation Dialog */}
      <Dialog
        open={isOccupationDialogOpen}
        onOpenChange={(open) => {
          setOccupationDialogOpen(open);
          if (!open) {
            dispatch(clearMessage());
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {profile?.occupation ? "Update Occupation" : "Add Occupation"}
            </DialogTitle>
            <DialogDescription>
              Please select your current occupation.
            </DialogDescription>
          </DialogHeader>

          <Select
            value={selectedOccupation}
            onValueChange={setSelectedOccupation}
          >
            <SelectTrigger className="w-full mt-4">
              <SelectValue placeholder="Select Occupation" />
            </SelectTrigger>
            <SelectContent>
              {occupations.map((occupation) => (
                <SelectItem key={occupation._id} value={occupation._id}>
                  {occupation.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            className="mt-4 w-full"
            onClick={handleSaveOccupation}
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Occupation"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileView;
