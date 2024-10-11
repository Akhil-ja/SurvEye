import { useState } from "react";
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
import { signIn } from "../slices/authSlice";
import { useNavigate } from "react-router-dom";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user"); // Set default role to "user"

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isLoading, error } = useSelector((state) => state.auth);

  const handleLogin = async (e) => {
    e.preventDefault();

    console.log("Auth State:", { isLoading, error });

    const resultAction = await dispatch(
      signIn({ role, credentials: { email, password } })
    );

    // Check if signIn was successful
    if (signIn.fulfilled.match(resultAction)) {
      // Navigate based on role
      if (role === "user") {
        navigate("/user/home"); // Redirect to user home
      } else {
        navigate("/creator/home"); // Redirect to creator home
      }
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

                {/* Password Input */}
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="password" className="font-semibold">
                    Password
                  </Label>
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
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="submit"
              onClick={handleLogin}
              disabled={isLoading}
              className="bg-orange-500 hover:bg-orange-600 text-white w-full py-2 px-4 rounded"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </CardFooter>
          <div className="text-center mt-4 text-sm">
            <p>Don't have an account? Sign up as:</p>
            <div className="flex justify-center space-x-4 mt-2">
              <LinkContainer to={"/user/signup"}>
                <Button variant="link" className="text-blue-600">
                  User
                </Button>
              </LinkContainer>
              <LinkContainer to={"/creator/signup"}>
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
