import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {} from "../slices/authSlice";
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

const ForgotPasswordOTPPage = () => {
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const dispatch = useDispatch();
  const { isLoading, error, otpResendStatus } = useSelector(
    (state) => state.auth
  );
  const navigate = useNavigate();

  useEffect(() => {
    let interval;
    if (timer > 0 && !canResend) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0 && !canResend) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer, canResend]);

  const submitHandler = async (e) => {
    e.preventDefault();

    const pendingUserId = localStorage.getItem("pendingUserId");

    if (!pendingUserId) {
      toast.error(
        "No pending user ID found. Please request password reset first."
      );
      return;
    }

    try {
      const resultAction = await dispatch(
        verifyForgotPasswordOTP({
          pendingUserId,
          otp,
        })
      );

      if (verifyForgotPasswordOTP.fulfilled.match(resultAction)) {
        localStorage.removeItem("pendingUserId");
        toast.success(resultAction.payload.message);
        navigate("/reset-password");
      } else {
        toast.error(resultAction.error.message || "Invalid OTP");
      }
    } catch (err) {
      toast.error(err?.message || "OTP verification failed");
    }
  };

  const handleResendOTP = async () => {
    const pendingUserId = localStorage.getItem("pendingUserId");

    if (!pendingUserId) {
      toast.error(
        "No pending user ID found. Please request password reset first."
      );
      return;
    }

    try {
      const resultAction = await dispatch(
        resendForgotPasswordOTP(pendingUserId)
      );
      if (resendForgotPasswordOTP.fulfilled.match(resultAction)) {
        toast.success(resultAction.payload.message);
        setTimer(60);
        setCanResend(false);
      } else {
        toast.error(resultAction.error.message || "Failed to resend OTP");
      }
    } catch (err) {
      toast.error(err?.message || "Failed to resend OTP");
    }
  };

  return (
    <FormContainer>
      <Card className="w-full max-w-md p-6 mx-auto bg-cover bg-center">
        <CardHeader>
          <CardTitle>Forgot Password - Verify OTP</CardTitle>
          <CardDescription>
            Enter the OTP sent to your email to reset your password
          </CardDescription>
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
            <CardFooter className="flex flex-col px-0 pt-6">
              <Button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white w-full py-2 px-3 mb-3"
                disabled={isLoading}
              >
                {isLoading ? "Verifying..." : "Verify OTP"}
              </Button>
              <Button
                type="button"
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 w-full py-2 px-3"
                onClick={handleResendOTP}
                disabled={!canResend || otpResendStatus === "loading"}
              >
                {canResend
                  ? otpResendStatus === "loading"
                    ? "Resending..."
                    : "Resend OTP"
                  : `Resend OTP (${timer}s)`}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
      {error && <p className="text-red-500 mt-2 text-center">{error}</p>}
    </FormContainer>
  );
};

export default ForgotPasswordOTPPage;
