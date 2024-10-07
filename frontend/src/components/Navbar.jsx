import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Button } from "@/components/ui/button";

export default function CustomAppBar() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="static"
        sx={{
          backgroundColor: "transparent",
          boxShadow: "none", // Optional: removes the default shadow
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
            {/* Login Button */}
            <Button variant="outline" style={{ color: "black" }}>
              Login
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
