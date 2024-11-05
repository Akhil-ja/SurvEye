import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSelector } from "react-redux";
import React from "react";

const UserHome = () => {
  const authInfo = useSelector((state) => state.auth.authInfo);

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

  const HoverCard = ({ className, children }) => (
    <Card
      className={`${className} transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer`}
    >
      {children}
    </Card>
  );

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
          <HoverCard className="h-30">
            <CardHeader>
              <CardTitle>SHARE TO FRIENDS</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Invite friends and grow the community</p>
            </CardContent>
          </HoverCard>
          <HoverCard className="h-39">
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
          <HoverCard className="h-52">
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
          <HoverCard className="h-52">
            <CardHeader>
              <CardTitle>REWARDS</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Track your progress and redeem bonuses as you complete surveys
                on the platform
              </p>
            </CardContent>
          </HoverCard>
        </div>

        <div className="col-span-1 space-y-4">
          <HoverCard className="h-52">
            <CardHeader>
              <CardTitle>PROFILE</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Manage your account information.</p>
            </CardContent>
          </HoverCard>
          <HoverCard className="h-52">
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
          <HoverCard className="h-40 mt-0">
            <CardHeader>
              <CardTitle>WALLET</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                View your balance, transaction history, and easily manage funds
              </p>
            </CardContent>
          </HoverCard>
        </div>
      </div>
    </div>
  );
};

export default UserHome;
