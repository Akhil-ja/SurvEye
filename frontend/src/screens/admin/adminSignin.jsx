import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Button,
  TextField,
  Typography,
  Box,
  Card,
  CardContent,
} from "@mui/material";
import { adminSignIn } from "../../slices/adminSlice";
import { toast } from "react-toastify";

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
    } else {
      toast.error(
        resultAction.error.message || "Login failed. Please try again."
      );
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

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
                onChange={handleEmailChange}
                required
                inputProps={{
                  pattern: "[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$",
                }}
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Password"
                variant="outlined"
                type="password"
                value={password}
                onChange={handlePasswordChange}
                required
              />
            </Box>
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
