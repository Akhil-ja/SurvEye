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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import FormContainer from "@/components/formContainer";

export default function LoginScreen() {
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
            <form>
              <div className="grid w-full items-center gap-4">
                <Select>
                  <SelectTrigger id="Role">
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="User">User</SelectItem>
                    <SelectItem value="Creator">Creator</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" placeholder="Enter Your Registered Email" />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter Your Password"
                  />
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white w-full py-2 px-4 rounded">
              Sign In
            </Button>
          </CardFooter>
          <div className="text-center mt-4 text-sm">
            <p>Don't have an account? Sign up as:</p>
            <div className="flex justify-center space-x-4 mt-2">
              <Button variant="link" className="text-blue-600">
                User
              </Button>
              <Button variant="link" className="text-blue-600">
                Creator
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
