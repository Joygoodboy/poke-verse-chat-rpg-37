
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Globe, Swords, Users, Gift, GameController } from "lucide-react";

const Home = () => {
  const [username, setUsername] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const storedUsername = localStorage.getItem("loggedInUser");
    if (storedUsername) {
      setUsername(storedUsername);
      setIsLoggedIn(true);
    }
  }, []);

  const handleGetStarted = () => {
    navigate("/chat");
  };

  const handleFusionLabClick = () => {
    navigate("/fusion-lab");
  };

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleGuestClick = () => {
    // Generate a guest username
    const guestName = "Guest" + Math.floor(Math.random() * 1000);
    localStorage.setItem("loggedInUser", guestName);
    setUsername(guestName);
    setIsLoggedIn(true);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex flex-col">
      {/* Header */}
      <header className="bg-blue-600 p-4 text-white">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-red-500 font-bold text-2xl">t/on</span>
            <span className="text-blue-300 font-bold text-2xl">nto</span>
            <span className="text-blue-100 font-bold text-2xl">o</span>
            <div className="ml-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" className="bg-transparent text-white border-white">
              About
            </Button>
            <Button variant="outline" className="bg-transparent text-white border-white">
              Help
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-blue-500 p-2 text-white">
        <div className="container mx-auto">
          <div className="flex space-x-2">
            <Button variant="ghost" className="text-white bg-blue-400">
              Home
            </Button>
            <Button variant="ghost" className="text-white hover:bg-blue-400" onClick={handleFusionLabClick}>
              Fusion Lab
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow container mx-auto p-4">
        {isLoggedIn ? (
          <div className="mt-8">
            <Card className="p-8 bg-blue-400/50 backdrop-blur-sm text-white">
              <div className="flex flex-col md:flex-row items-center">
                <div className="mb-6 md:mb-0 md:mr-6">
                  <div className="bg-green-400 rounded-full p-4 w-24 h-24 mx-auto flex items-center justify-center">
                    <img src="https://robohash.org/avatar.png?set=set1" alt="Avatar" className="w-16 h-16" />
                  </div>
                  <h2 className="text-xl font-bold mt-2 text-center">{username}</h2>
                  <div className="bg-blue-300/50 rounded-full py-1 px-3 mt-2 text-center text-sm">
                    Novice
                  </div>
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold">Welcome Back, Trainer!</h1>
                  <p className="my-2">
                    Your Pokémon adventure continues. Jump back into the action and continue your journey to become a Pokémon Master.
                  </p>
                  <div className="grid grid-cols-2 gap-4 my-4">
                    <div className="bg-yellow-400/20 p-3 rounded-md text-center">
                      <div className="text-yellow-300 text-xl">👑</div>
                      <div className="text-sm">Current Level</div>
                      <div className="font-bold">1</div>
                    </div>
                    <div className="bg-red-400/20 p-3 rounded-md text-center">
                      <div className="text-red-300 text-xl">⚔️</div>
                      <div className="text-sm">Pokémon</div>
                      <div className="font-bold">0</div>
                    </div>
                  </div>
                  <Button 
                    className="w-full bg-green-500 hover:bg-green-600 text-white"
                    onClick={handleGetStarted}
                  >
                    Get Started
                  </Button>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <Card className="p-6 bg-blue-300/30 backdrop-blur-sm text-white flex flex-col items-center">
                <div className="mb-2 text-white">
                  <Users size={32} />
                </div>
                <h3 className="text-lg font-bold mb-1">Multiplayer Chat</h3>
                <p className="text-center text-sm">Connect with trainers from around the world</p>
              </Card>
              <Card className="p-6 bg-blue-300/30 backdrop-blur-sm text-white flex flex-col items-center" onClick={handleFusionLabClick}>
                <div className="mb-2 text-white">
                  <GameController size={32} />
                </div>
                <h3 className="text-lg font-bold mb-1">Fusion Lab</h3>
                <p className="text-center text-sm">Create unique Pokémon combinations</p>
              </Card>
              <Card className="p-6 bg-blue-300/30 backdrop-blur-sm text-white flex flex-col items-center">
                <div className="mb-2 text-white">
                  <Swords size={32} />
                </div>
                <h3 className="text-lg font-bold mb-1">Battle Arena</h3>
                <p className="text-center text-sm">Test your skills against other trainers</p>
              </Card>
            </div>
          </div>
        ) : (
          <div className="mt-8 flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 text-white mb-8 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Begin Your Pokémon Adventure!</h1>
              <p className="text-xl mb-8">
                Catch, train, and battle with your favorite Pokémon in this immersive RPG experience.
              </p>
              <div className="flex space-x-4">
                <Button 
                  className="bg-green-500 hover:bg-green-600 text-white"
                  onClick={handleGuestClick}
                >
                  Start as Guest
                </Button>
                <Button 
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={handleLoginClick}
                >
                  Login
                </Button>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <img 
                src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png" 
                alt="Pikachu"
                className="w-64 h-64 transform translate-x-12"
              />
              <img 
                src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png" 
                alt="Squirtle"
                className="w-64 h-64 transform -translate-x-12 translate-y-12"
              />
              <img 
                src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png" 
                alt="Bulbasaur"
                className="w-64 h-64 absolute transform translate-y-24"
              />
            </div>
          </div>
        )}

        <section className="mt-12 bg-blue-400/30 backdrop-blur-sm rounded-lg p-6 text-white">
          <h2 className="text-2xl font-bold text-center mb-6">Game Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-300/30 p-6 rounded-lg flex flex-col items-center">
              <Globe className="text-green-300 mb-3" size={40} />
              <h3 className="text-lg font-bold mb-2">Explore the World</h3>
              <p className="text-center text-sm">Travel across regions, discover new Pokémon and complete exciting quests.</p>
            </div>
            <div className="bg-blue-300/30 p-6 rounded-lg flex flex-col items-center">
              <Users className="text-green-300 mb-3" size={40} />
              <h3 className="text-lg font-bold mb-2">Train Your Team</h3>
              <p className="text-center text-sm">Build the ultimate team by catching and training various Pokémon species.</p>
            </div>
            <div className="bg-blue-300/30 p-6 rounded-lg flex flex-col items-center">
              <Swords className="text-green-300 mb-3" size={40} />
              <h3 className="text-lg font-bold mb-2">Battle Others</h3>
              <p className="text-center text-sm">Test your skills in battles against wild Pokémon and other trainers.</p>
            </div>
            <div className="bg-blue-300/30 p-6 rounded-lg flex flex-col items-center">
              <Users className="text-green-300 mb-3" size={40} />
              <h3 className="text-lg font-bold mb-2">Chat with Trainers</h3>
              <p className="text-center text-sm">Connect and strategize with trainers from around the world.</p>
            </div>
            <div className="bg-blue-300/30 p-6 rounded-lg flex flex-col items-center">
              <Gift className="text-green-300 mb-3" size={40} />
              <h3 className="text-lg font-bold mb-2">Daily Rewards</h3>
              <p className="text-center text-sm">Log in daily to receive special items and rare Pokémon.</p>
            </div>
            <div className="bg-blue-300/30 p-6 rounded-lg flex flex-col items-center">
              <GameController className="text-green-300 mb-3" size={40} />
              <h3 className="text-lg font-bold mb-2">Mini-Games</h3>
              <p className="text-center text-sm">Enjoy fun mini-games and earn rewards to help your adventure.</p>
            </div>
          </div>
        </section>

        <section className="mt-12 bg-purple-500/20 backdrop-blur-sm rounded-lg p-6 text-white text-center">
          <h2 className="text-2xl font-bold mb-2">Join Our Community</h2>
          <h3 className="text-xl mb-4">Connect with Trainers Worldwide</h3>
          <p>Join thousands of trainers already on their Pokémon journey!</p>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-blue-800 text-white p-4">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="flex items-center mb-2">
              <span className="text-red-500 font-bold">t/on</span>
              <span className="text-blue-300 font-bold">nto</span>
              <span className="text-blue-100 font-bold">o</span>
              <div className="ml-1 w-2 h-2 bg-yellow-500 rounded-full"></div>
            </div>
            <p className="text-sm">Your ultimate Pokémon adventure awaits in this immersive web RPG experience.</p>
          </div>
          <div>
            <h3 className="font-bold mb-2">Quick Links</h3>
            <ul className="text-sm space-y-1">
              <li>Home</li>
              <li>Multiplayer</li>
              <li>Battle</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-2">Resources</h3>
            <ul className="text-sm space-y-1">
              <li>Help Center</li>
              <li>FAQ</li>
              <li>Community</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
