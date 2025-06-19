import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { adminLogout } from "../slices/adminSlice";
import React from "react";

const AdminNavbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const adminInfo = JSON.parse(localStorage.getItem("adminInfo"));

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
        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          Admin Dashboard
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          {adminInfo && (
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
