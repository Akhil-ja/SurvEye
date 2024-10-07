import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import { Button } from "@/components/ui/button";
import { LinkContainer } from "react-router-bootstrap";

export default function CustomAppBar() {
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
          <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
            <img
              src="/images/Logo.png"
              alt="Customized Logo"
              style={{ cursor: "pointer", maxWidth: "100%", height: "80px" }}
            />
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <LinkContainer to={"/signin"}>
              <Button
                variant="outline"
                className="signin-button"
                style={{ color: "black" }}
              >
                Login
              </Button>
            </LinkContainer>
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
