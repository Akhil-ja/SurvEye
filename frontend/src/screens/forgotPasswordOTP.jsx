import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { verifyForgotPasswordOTP } from "../slices/authSlice";
import { useNavigate, useLocation } from "react-router-dom"; // Add useLocation
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ForgotPasswordOTP = () => {
  const [otp, setOtp] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation(); // Use useLocation to get email from state
  const email = location.state?.email; // Retrieve email from location state

  const { isLoading, error, message, forgotPasswordStatus, authInfo } =
    useSelector((state) => state.auth);

  // If user is authenticated, navigate to their home page
  useEffect(() => {
    if (authInfo && authInfo.role) {
      navigate(`/${authInfo.role}/home`);
    }
  }, [authInfo, navigate]);

  // Handle OTP verification
  const handleVerifyOTP = (e) => {
    e.preventDefault();
    if (email) {
      dispatch(verifyForgotPasswordOTP({ email, otp }));
    } else {
      // Handle the case where email is missing (e.g., show an error message)
      console.error("Email is missing.");
    }
  };

  return (
    <div
      className="flex justify-center items-center h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/images/signInbackground.jpg')" }}
    >
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Verify OTP</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-4">
            An OTP has been sent to <strong>{email || "your email"}</strong>
          </p>
          <form onSubmit={handleVerifyOTP}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="otp" className="font-semibold">
                  Enter OTP
                </Label>
                <Input
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter the OTP"
                  className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            {forgotPasswordStatus === "success" && (
              <p className="text-green-500 text-sm mt-2">{message}</p>
            )}
            <CardFooter className="flex justify-between">
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-orange-500 hover:bg-orange-600 text-white w-full py-2 px-4 rounded mt-4"
              >
                {isLoading ? "Verifying OTP..." : "Verify OTP"}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPasswordOTP;
