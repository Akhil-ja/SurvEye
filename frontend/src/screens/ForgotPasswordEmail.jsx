import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  forgotPasswordSendOTP,
  setForgotPasswordEmail,
} from "../slices/authSlice";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ForgotPasswordEmail = () => {
  const [email, setEmail] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isLoading, error, message } = useSelector((state) => state.auth);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    dispatch(setForgotPasswordEmail(email)); // Store the email in Redux
    const response = await dispatch(forgotPasswordSendOTP(email));

    // Assuming the response contains a success status, you navigate to the OTP page
    if (response.meta.requestStatus === "fulfilled") {
      navigate("/forgot-password-otp", { state: { email } }); // Pass the email via the navigate function
    }
  };

  return (
    <div
      className="flex justify-center items-center h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/images/forgotPasswordBackground.jpg')" }}
    >
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Forgot Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSendOTP}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email" className="font-semibold mb-2">
                  Enter your email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            {message && (
              <p className="text-green-500 text-sm mt-2">{message}</p>
            )}
            <CardFooter className="flex justify-between">
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-orange-500 hover:bg-orange-600 text-white w-full py-2 px-4 rounded mt-4"
              >
                {isLoading ? "Sending OTP..." : "Send OTP"}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPasswordEmail;
