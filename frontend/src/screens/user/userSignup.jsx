import FormContainer from "@/components/formContainer";
import { useState, useEffect } from "react";
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
import { initiateSignUp, clearMessage } from "../../slices/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { throttle } from "lodash";

export default function UserRegisterScreen() {
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { error, message } = useSelector((state) => state.auth);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
    if (message) {
      toast.success(message);
      dispatch(clearMessage());
    }
  }, [error, message, dispatch]);

  const submitHandler = async (e) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    const trimmedPhoneNumber = phoneNumber.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedDateOfBirth = dateOfBirth.trim();

    if (
      !trimmedEmail ||
      !trimmedPhoneNumber ||
      !trimmedPassword ||
      !trimmedConfirmPassword ||
      !trimmedFirstName ||
      !trimmedLastName ||
      !trimmedDateOfBirth
    ) {
      toast.error("All fields are required");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(trimmedEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    const phonePattern = /^\d{10}$/;
    if (!phonePattern.test(trimmedPhoneNumber)) {
      toast.error("Phone number must be 10 digits");
      return;
    }

    if (trimmedPassword !== trimmedConfirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const userData = {
      email: trimmedEmail,
      phoneNumber: trimmedPhoneNumber,
      password: trimmedPassword,
      firstName: trimmedFirstName,
      lastName: trimmedLastName,
      dateOfBirth: trimmedDateOfBirth,
    };

    try {
      const resultAction = await dispatch(
        initiateSignUp({ role: "user", userData })
      );

      if (initiateSignUp.fulfilled.match(resultAction)) {
        const { pendingUserId } = resultAction.payload;
        localStorage.setItem("pendingUserId", pendingUserId);
        localStorage.setItem("userRole", "user");
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

  const throttledSubmitHandler = throttle(submitHandler, 10000);

  return (
    <FormContainer>
      <Card className="w-full max-w-md p-6 mx-auto bg-cover bg-center">
        <CardHeader>
          <CardTitle>User Registration</CardTitle>
          <CardDescription>Create your account as a User</CardDescription>
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
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter Your First Name"
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter Your Last Name"
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  type="date"
                  id="dateOfBirth"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  placeholder="Select Your Date of Birth"
                />
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
