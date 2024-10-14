import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { adminLogout } from "../slices/adminSlice";

const AdminNavbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { adminInfo, isAuthenticated } = useSelector((state) => state.admin);

  console.log("Auth Info:", adminInfo);
  console.log("Is Authenticated:", isAuthenticated);

  const handleLogout = () => {
    if (adminInfo) {
      dispatch(adminLogout());
      localStorage.removeItem("adminInfo");
      localStorage.removeItem("token");
      navigate("/admin/signin");
    }
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: "#EA580A" }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Admin Dashboard
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          {isAuthenticated && (
            <Button onClick={handleLogout} color="inherit" variant="outlined">
              Logout
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default AdminNavbar;
