import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import { Button } from "@/components/ui/button";
import { LinkContainer } from "react-router-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../slices/authSlice";
import { useNavigate, useLocation } from "react-router-dom";

export default function UserNavbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const authInfo = useSelector((state) => state.auth.authInfo);

  const handleLogout = () => {
    console.log("Current authInfo:", authInfo);

    if (authInfo) {
      console.log("Logging out user with role:", authInfo.role);
      dispatch(logout());
      localStorage.removeItem("authInfo");
      setTimeout(() => {
        navigate("/signin");
      }, 100);
    } else {
      console.warn("No user is logged in or role is undefined.", authInfo);
    }
  };

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
              <Button
                variant="outline"
                className="logout-button"
                style={{ color: "black" }}
                onClick={handleLogout}
              >
                Logout
              </Button>
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
