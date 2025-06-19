import React, { useState } from "react";
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
import { toast } from "react-toastify";
import { initiateSignUp } from "../../slices/authSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function CreatorRegisterScreen() {
  const [creatorName, setCreatorName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [industry, setIndustry] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const validateForm = () => {
    const trimmedName = creatorName.trim();
    const trimmedEmail = email.trim();
    const trimmedPhoneNumber = phoneNumber.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();
    const trimmedIndustry = industry.trim();

    if (
      !trimmedName ||
      !trimmedEmail ||
      !trimmedPhoneNumber ||
      !trimmedPassword ||
      !trimmedConfirmPassword ||
      !trimmedIndustry
    ) {
      toast.error("All fields are required and cannot be empty.");
      return false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(trimmedEmail)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    const phonePattern = /^\d{10}$/;
    if (!phonePattern.test(trimmedPhoneNumber)) {
      toast.error("Phone number must be 10 digits");
      return false;
    }

    const passwordPattern = /^(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordPattern.test(trimmedPassword)) {
      toast.error(
        "Password must be at least 8 characters long and include at least one number."
      );
      return false;
    }

    if (trimmedPassword !== trimmedConfirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }

    return {
      email: trimmedEmail,
      phoneNumber: trimmedPhoneNumber,
      password: trimmedPassword,
      creatorName: trimmedName,
      industry: trimmedIndustry,
    };
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);

    const userData = validateForm();
    if (!userData) {
      setLoading(false);
      return;
    }

    try {
      const resultAction = await dispatch(
        initiateSignUp({ role: "creator", userData })
      );

      if (initiateSignUp.fulfilled.match(resultAction)) {
        const { pendingUserId, message } = resultAction.payload;
        toast.success(message || "Registration successful!");

        localStorage.setItem("pendingUserId", pendingUserId);
        localStorage.setItem("userRole", "creator");
        navigate(`/verify-otp`);
      } else {
        const errorMessage = resultAction.payload?.message || "Sign-up failed";
        toast.error(errorMessage);
      }
    } catch (err) {
      toast.error(err?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer>
      <Card className="w-full max-w-md p-6 mx-auto bg-cover bg-center">
        <CardHeader>
          <CardTitle>Creator Registration</CardTitle>
          <CardDescription>Create your account as a Creator</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submitHandler}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter Your Email"
                  required
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter Your Phone Number"
                  required
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
                  required
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
                  required
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="creatorName">Creator Name</Label>
                <Input
                  id="creatorName"
                  value={creatorName}
                  onChange={(e) => setCreatorName(e.target.value)}
                  placeholder="Enter Your Creator Name"
                  required
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="industry">Industry</Label>
                <select
                  id="industry"
                  className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  required
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
                disabled={loading}
              >
                {loading ? "Registering..." : "Register"}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </FormContainer>
  );
}
