import { useState } from "react";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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

export default function LoginScreen() {
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

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);

      const user = result.user;
      const { email, displayName } = user;

      console.log("Email:", email);
      console.log("Name:", displayName);

      const resultAction = await dispatch(
        googleAuth({
          credentials: { email, displayName },
        })
      );

      if (googleAuth.fulfilled.match(resultAction)) {
        console.log(resultAction.payload.user.role);
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
    <>
      <div
        className="flex justify-center items-center h-screen bg-cover bg-center"
        style={{ backgroundImage: "url('/images/signInbackground.jpg')" }}
      >
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>Sign in if already a user</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="grid w-full items-center gap-4">
                {/* Role Selection */}
                <div className="flex flex-col space-y-2">
                  <Label className="font-semibold">Role</Label>
                  <div className="flex justify-between">
                    <div className="flex items-center">
                      <Input
                        type="radio"
                        id="user"
                        name="role"
                        value="user"
                        checked={role === "user"}
                        onChange={() => setRole("user")}
                        className="h-4 w-4 text-orange-500 border-gray-300 focus:ring-orange-500"
                      />
                      <Label htmlFor="user" className="ml-2 text-gray-700">
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
                        className="h-4 w-4 text-orange-500 border-gray-300 focus:ring-orange-500"
                      />
                      <Label htmlFor="creator" className="ml-2 text-gray-700">
                        Creator
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Email Input */}
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="email" className="font-semibold">
                    Email
                  </Label>
                  <Input
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter Your Registered Email"
                    className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {/* Password Input with Forgot Password Link */}
                <div className="flex flex-col space-y-1.5">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password" className="font-semibold">
                      Password
                    </Label>

                    <LinkContainer to="/forgot-password-email">
                      <Button variant="link" className="text-blue-600">
                        Forgot Password?
                      </Button>
                    </LinkContainer>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter Your Password"
                    className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <CardFooter className="flex justify-between">
                <Button
                  type="submit"
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="bg-orange-500 hover:bg-orange-600 text-white w-full py-2 px-4 rounded mt-4"
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              </CardFooter>
            </form>
            <div className="mt-4 text-center">
              <Button
                onClick={handleGoogleSignIn}
                className="bg-gray-400 hover:bg-gray-500 text-white w-full py-2 px-4 rounded"
              >
                Sign In with Google
              </Button>
            </div>
          </CardContent>
          <div className="text-center mt-4 text-sm">
            <p>Don&apos;t have an account? Sign up as:</p>
            <div className="flex justify-center space-x-4 mt-2">
              <LinkContainer to="/user/signup">
                <Button variant="link" className="text-blue-600">
                  User
                </Button>
              </LinkContainer>
              <LinkContainer to="/creator/signup">
                <Button variant="link" className="text-blue-600">
                  Creator
                </Button>
              </LinkContainer>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
