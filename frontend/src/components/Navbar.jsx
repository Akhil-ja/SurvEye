import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
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
          {/* Wrap the logo in a Box to center it */}
          <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ cursor: "pointer" }}
              color="black"
            >
              Customized Logo
            </Typography>
          </Box>

          {/* Wrap the buttons in a Box or div */}
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
