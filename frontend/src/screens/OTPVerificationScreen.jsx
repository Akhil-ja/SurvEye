import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { verifyOTP } from "../slices/authSlice";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import FormContainer from "@/components/formContainer";
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

const OTPVerificationScreen = () => {
  const [otp, setOtp] = useState("");
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();

    const pendingUserId = localStorage.getItem("pendingUserId");

    if (!pendingUserId) {
      toast.error("No pending user ID found. Please sign up first.");
      return;
    }

    try {
      const resultAction = await dispatch(
        verifyOTP({
          role: "creator",
          pendingUserId,
          otp,
        })
      );

      if (verifyOTP.fulfilled.match(resultAction)) {
        localStorage.removeItem("pendingUserId");
        toast.success(resultAction.payload.message);
        navigate("/creator/home");
      } else {
        toast.error(resultAction.payload?.message || "Invalid OTP");
      }
    } catch (err) {
      toast.error(err?.message || "OTP verification failed");
    }
  };

  return (
    <FormContainer>
      <Card className="w-full max-w-md p-6 mx-auto bg-cover bg-center">
        <CardHeader>
          <CardTitle>Verify OTP</CardTitle>
          <CardDescription>Enter the OTP sent to your email</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submitHandler}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="otp">OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP"
                  required
                />
              </div>
            </div>
            <CardFooter className="px-0 pt-6">
              <Button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white w-full py-2 px-3"
                disabled={isLoading}
              >
                {isLoading ? "Verifying..." : "Verify OTP"}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
      {error && <p className="text-red-500 mt-2 text-center">{error}</p>}
    </FormContainer>
  );
};

export default OTPVerificationScreen;
