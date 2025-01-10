import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSelector } from "react-redux";
import React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
} from "@mui/material";

const UserHome = () => {
  const authInfo = useSelector((state) => state.auth.authInfo);
  const [openDialog, setOpenDialog] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText("https://{}/share");
      setCopied(true);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setCopied(false);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  if (!authInfo || !authInfo.user) {
    return (
      <div className="p-6 bg-white">
        <Card className="h-40">
          <CardContent className="p-4">
            <h2 className="text-xl">Loading user information...</h2>
          </CardContent>
        </Card>
      </div>
    );
  }

  const HoverCard = ({ className, children, to, onClick }) => {
    const cardContent = (
      <Card
        className={`${className} m-1.5 transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer`}
        onClick={onClick}
      >
        {children}
      </Card>
    );

    return to ? (
      <Link to={to} className="no-underline text-inherit">
        {cardContent}
      </Link>
    ) : (
      cardContent
    );
  };

  return (
    <div className="p-6 bg-white">
      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-1 space-y-4">
          <HoverCard className="h-40">
            <CardContent className="p-4">
              <h1 className="text-3xl font-bold">
                Hello {authInfo.user.first_name || "User"}
              </h1>
              <h2 className="text-xl text-pink-500">Welcome Back!</h2>
            </CardContent>
          </HoverCard>
          <HoverCard className="h-30" onClick={handleOpenDialog}>
            <CardHeader>
              <CardTitle>SHARE TO FRIENDS</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Invite friends and grow the community</p>
            </CardContent>
          </HoverCard>
          <HoverCard className="h-38" to="/user/attendedsurveys">
            <CardHeader>
              <CardTitle>DASHBOARD</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Get a complete overview of your activity
              </p>
            </CardContent>
          </HoverCard>
        </div>

        <div className="col-span-2 space-y-4">
          <HoverCard className="h-52" to="/user/survey">
            <CardHeader>
              <CardTitle>TAKE A SURVEY</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Browse through available surveys/complete them to earn credits
                in your wallet
              </p>
            </CardContent>
          </HoverCard>
          <HoverCard className="h-52" to="/user/wallet">
            <CardHeader>
              <CardTitle>WALLET</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                {" "}
                View your balance, transaction history, and easily manage funds
              </p>
            </CardContent>
          </HoverCard>
        </div>

        <div className="col-span-1 space-y-4">
          <HoverCard className="h-52" to="/user/profile">
            <CardHeader>
              <CardTitle>PROFILE</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Manage your account information.</p>
            </CardContent>
          </HoverCard>
          <HoverCard className="h-52" to="/user/announcements">
            <CardHeader>
              <CardTitle>ANNOUNCEMENTS</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Stay updated with platform news, important announcements
              </p>
            </CardContent>
          </HoverCard>
        </div>

        <div className="col-span-4">
          <HoverCard className="h-40 mt-0" to="/user/wallet">
            <CardHeader>
              <CardTitle>LOGOUT</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Logout from the Application</p>
            </CardContent>
          </HoverCard>
        </div>
      </div>
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>Share with Friends</DialogTitle>
        <DialogContent>
          <p className="text-sm">
            Copy this link and share it with your friends:
          </p>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value="https://{}/share"
              readOnly
              className="p-2 border rounded w-full"
            />
            <Button onClick={handleCopyLink} variant="contained">
              {copied ? "Copied!" : "Copy Link"}
            </Button>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default UserHome;
