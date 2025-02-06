
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Lock, User } from "lucide-react";
import { Link } from "react-router-dom";

const Login = () => {
  return (
    <div className="min-h-screen bg-[#F1F0FB] flex items-center justify-center">
      <Card className="w-full max-w-md border-[#9b87f5]/20">
        <CardHeader>
          <div className="text-center">
            <Link to="/">
              <h1 className="text-2xl font-bold text-[#9b87f5] mb-2">E-Pharma</h1>
            </Link>
            <p className="text-gray-600">Welcome back! Please login to continue</p>
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type="email"
                  placeholder="Email address"
                  className="pl-10"
                />
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type="password"
                  placeholder="Password"
                  className="pl-10"
                />
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              </div>
            </div>
            <Button className="w-full bg-[#9b87f5] hover:bg-[#7E69AB]">
              Sign In
            </Button>
            <div className="text-center text-sm">
              <a href="#" className="text-[#9b87f5] hover:underline">
                Forgot password?
              </a>
            </div>
            <div className="text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <a href="#" className="text-[#9b87f5] hover:underline">
                Sign up
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
