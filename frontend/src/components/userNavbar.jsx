/* eslint-disable react/react-in-jsx-scope */
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import { Button } from "@/components/ui/button";
import { LinkContainer } from "react-router-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../slices/authSlice";
import { useNavigate, useLocation } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, LogOut } from "lucide-react";

export default function UserNavbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const state = useSelector((state) => state.auth);
  const authInfo = state.user?.authInfo || state.creator?.authInfo;

  const handleLogout = () => {
    if (authInfo && authInfo.user) {
      const role = authInfo.user.role;
      dispatch(logout());
      localStorage.removeItem(`authInfo_${role}`);
      setTimeout(() => {
        navigate("/signin");
      }, 100);
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };
  console.log("User Information:", authInfo);
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="static"
        sx={{
          backgroundColor: "#EA580A",
          boxShadow: "0 2px 20px rgba(0, 0, 0, 0.2)",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <LinkContainer to={"/"}>
            <Box
              sx={{
                flexGrow: 1,
                display: "flex",
                justifyContent: "center",
                marginLeft: 1,
              }}
            >
              <img
                src="/images/Logo.png"
                alt="Customized Logo"
                style={{ cursor: "pointer", maxWidth: "100%", height: "80px" }}
              />
            </Box>
          </LinkContainer>

          <Box sx={{ display: "flex", gap: 2 }}>
            {authInfo ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-orange-500 text-white">
                        {getInitials(authInfo.name || authInfo.creator_name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => navigate(`/${authInfo.user.role}/profile`)}
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>

                  {/* Role-based navigation */}
                  {authInfo.user.role === "creator" && (
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => navigate("/creator/dashboard")}
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>Creator Dashboard</span>
                    </DropdownMenuItem>
                  )}
                  {authInfo.user.role === "user" && (
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => navigate("/user/dashboard")}
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>User Dashboard</span>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem
                    className="cursor-pointer text-red-600"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : location.pathname === "/signin" ? (
              <>
                <LinkContainer to={"/creator/signup"}>
                  <Button
                    variant="outline"
                    className="join-creator-button"
                    style={{ color: "black" }}
                  >
                    Join as Creator
                  </Button>
                </LinkContainer>
                <LinkContainer to={"/user/signup"}>
                  <Button
                    variant="outline"
                    className="join-user-button"
                    style={{ color: "red" }}
                  >
                    Join as User
                  </Button>
                </LinkContainer>
              </>
            ) : (
              <LinkContainer to={"/signin"}>
                <Button
                  variant="outline"
                  className="signin-button"
                  style={{ color: "black" }}
                >
                  Login
                </Button>
              </LinkContainer>
            )}
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
