import FormContainer from "@/components/formContainer";
import { useState } from "react";
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
import { toast } from "react-toastify";
import { initiateSignUp } from "../slices/authSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { throttle } from "lodash";

export default function CreatorRegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [industry, setIndustry] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Move the submitHandler function definition above the throttle
  const submitHandler = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const userData = {
      email,
      phoneNumber,
      password,
      name,
      industry,
    };

    try {
      console.log("before dispatch");
      const resultAction = await dispatch(
        initiateSignUp({ role: "creator", userData })
      );
      console.log("after dispatch", resultAction);

      if (initiateSignUp.fulfilled.match(resultAction)) {
        const { pendingUserId, message } = resultAction.payload; // Destructure here
        toast.success(message);

        localStorage.setItem("pendingUserId", pendingUserId);
        localStorage.setItem("userRole", "creator");
        console.log("Pending User ID for OTP:", pendingUserId);

        navigate(`/verify-otp`);
      } else {
        const errorMessage =
          resultAction.error?.message || "Registration failed";
        toast.error(errorMessage);
      }
    } catch (err) {
      toast.error(err?.message || "Registration failed");
    }
  };

  // Throttle the submitHandler after it has been defined
  const throttledSubmitHandler = throttle(submitHandler, 2000);

  return (
    <FormContainer>
      <Card className="w-full max-w-md p-6 mx-auto bg-cover bg-center">
        <CardHeader>
          <CardTitle>Creator Registration</CardTitle>
          <CardDescription>Create your account as a Creator</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={throttledSubmitHandler}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter Your Email"
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter Your Phone Number"
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Your Password"
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Your Password"
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="creatorName">Creator Name</Label>
                <Input
                  id="creatorName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter Your Creator Name"
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="industry">Industry</Label>
                <select
                  id="industry"
                  className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                >
                  <option value="">Select Your Industry</option>
                  <option value="marketing">Marketing</option>
                  <option value="personal">Personal</option>
                  <option value="technology">Technology</option>
                  <option value="education">Education</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="finance">Finance</option>
                  <option value="consulting">Consulting</option>
                  <option value="real-estate">Real Estate</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <CardFooter>
              <Button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white w-full py-2 px-3 mt-4"
              >
                Register
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </FormContainer>
  );
}
