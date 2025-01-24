import { useState } from "react";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LinkContainer } from "react-router-bootstrap";
import { signIn } from "../../slices/authSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { auth, googleProvider } from "../../../firebase";
import { signInWithPopup } from "firebase/auth";
import { googleAuth } from "../../slices/authSlice";

function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isLoading, error } = useSelector((state) => state.auth);

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log("Auth State:", { isLoading, error });
    const resultAction = await dispatch(
      signIn({ role, credentials: { email, password } })
    );
    if (signIn.fulfilled.match(resultAction)) {
      toast.success("Successfully signed in!");
      if (role === "user") {
        navigate("/user/home");
      } else {
        navigate("/creator/home");
      }
    } else if (signIn.rejected.match(resultAction)) {
      toast.error(resultAction.payload?.message || "Sign-in failed");
    }
  };

  const handleGoogleSignIn = async (e) => {
    e.preventDefault();
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const { email, displayName } = user;
      const resultAction = await dispatch(
        googleAuth({
          credentials: { email, displayName },
        })
      );
      if (googleAuth.fulfilled.match(resultAction)) {
        if (role) {
          navigate(`/${role}/home`);
        } else {
          toast.error("Role not found in the response.");
        }
        toast.success("Successfully signed in!");
      }
    } catch (error) {
      console.error("Error during Google sign-in:", error);
      toast.error("Google sign-in failed");
    }
  };

  return (
    <div
      className="flex justify-center items-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/images/signInbackground.jpg')" }}
    >
      <Card className="w-[320px]">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-xl">Sign in</CardTitle>
          <CardDescription className="text-sm">
            Sign in if already a user
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <form onSubmit={handleLogin} className="space-y-3">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Role</Label>
              <div className="flex justify-between gap-4">
                <div className="flex items-center">
                  <Input
                    type="radio"
                    id="user"
                    name="role"
                    value="user"
                    checked={role === "user"}
                    onChange={() => setRole("user")}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="user" className="ml-2 text-sm">
                    User
                  </Label>
                </div>
                <div className="flex items-center">
                  <Input
                    type="radio"
                    id="creator"
                    name="role"
                    value="creator"
                    checked={role === "creator"}
                    onChange={() => setRole("creator")}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="creator" className="ml-2 text-sm">
                    Creator
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Your Email"
                className="h-8 text-sm"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <LinkContainer to="/forgot-password-email">
                  <Button variant="link" className="text-xs h-auto p-0">
                    Forgot Password?
                  </Button>
                </LinkContainer>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
                className="h-8 text-sm"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-8 text-sm bg-[hsl(24.6,95%,50.1%)] hover:bg-[hsl(24.6,95%,45%)] text-white"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>

            <Button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full h-8 text-sm bg-gray-400 hover:bg-gray-500"
            >
              Sign In with Google
            </Button>
          </form>
        </CardContent>

        <div className="text-center py-4 text-xs space-y-2">
          <p>Don&apos;t have an account? Sign up as:</p>
          <div className="flex justify-center gap-4">
            <LinkContainer to="/user/signup">
              <Button variant="link" className="text-xs h-auto p-0">
                User
              </Button>
            </LinkContainer>
            <LinkContainer to="/creator/signup">
              <Button variant="link" className="text-xs h-auto p-0">
                Creator
              </Button>
            </LinkContainer>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default LoginScreen;
