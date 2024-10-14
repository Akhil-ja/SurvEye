import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import { TextField, Typography, Box, Card, CardContent } from "@mui/material";
import { adminSignIn } from "../slices/adminSlice";

const AdminSignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.admin);

  const handleLogin = async (e) => {
    e.preventDefault();

    const resultAction = await dispatch(adminSignIn({ email, password }));

    if (adminSignIn.fulfilled.match(resultAction)) {
      navigate("/admin/home");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <Card sx={{ width: 400 }}>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            Admin Sign In
          </Typography>
          <form onSubmit={handleLogin}>
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Email"
                variant="outlined"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Password"
                variant="outlined"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Box>
            {error && <Typography color="error">{error}</Typography>}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isLoading}
              fullWidth
            >
              {isLoading ? "Logging in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSignIn;
