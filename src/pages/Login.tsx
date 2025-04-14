
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would validate credentials here
    // For now, we'll just set the username in localStorage
    const username = email.split('@')[0];
    localStorage.setItem("loggedInUser", username);
    navigate("/");
  };

  const handleGuestLogin = () => {
    const guestName = "Guest" + Math.floor(Math.random() * 1000);
    localStorage.setItem("loggedInUser", guestName);
    navigate("/");
  };

  const goToRegister = () => {
    navigate("/register");
  };

  const goBack = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <Button 
        variant="ghost" 
        className="absolute top-4 left-4 text-white"
        onClick={goBack}
      >
        <ChevronLeft className="mr-1" size={16} /> Back to Home
      </Button>
      
      <div className="bg-blue-400/30 backdrop-blur-sm p-8 rounded-lg w-full max-w-md">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-2">
            <span className="text-red-500 font-bold text-2xl">t/on</span>
            <span className="text-blue-300 font-bold text-2xl">nto</span>
            <span className="text-blue-100 font-bold text-2xl">o</span>
            <div className="ml-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome, Trainer!</h1>
          <p className="text-white/80">Login to continue your adventure</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white mb-1">Email</label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white mb-1">Password</label>
            <Input
              id="password"
              type="password"
              placeholder="••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full"
              required
            />
          </div>
          
          <Button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white">
            Login
          </Button>
          
          <Button 
            type="button" 
            variant="secondary" 
            className="w-full"
            onClick={goToRegister}
          >
            Don't have an account? Register
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-white text-sm mb-2">OR CONTINUE WITH</p>
          <Button 
            variant="secondary" 
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            onClick={handleGuestLogin}
          >
            Play as Guest
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Login;
