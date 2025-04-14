
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft } from "lucide-react";

const FusionLab = () => {
  const [pokemon1, setPokemon1] = useState<string>("");
  const [pokemon2, setPokemon2] = useState<string>("");
  const [pokemon3, setPokemon3] = useState<string>("");
  const [pokemonList, setPokemonList] = useState<any[]>([]);
  const [showThirdPokemon, setShowThirdPokemon] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch Pokemon list from PokeAPI
    const fetchPokemonList = async () => {
      try {
        const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=151");
        const data = await response.json();
        setPokemonList(data.results);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching Pokemon list:", error);
        setIsLoading(false);
      }
    };
    
    fetchPokemonList();
  }, []);

  const handleRandomize = () => {
    const randomPokemon = () => {
      const randomIndex = Math.floor(Math.random() * pokemonList.length);
      return pokemonList[randomIndex]?.name || "";
    };
    
    setPokemon1(randomPokemon());
    setPokemon2(randomPokemon());
    
    if (showThirdPokemon) {
      setPokemon3(randomPokemon());
    }
  };

  const toggleThirdPokemon = () => {
    setShowThirdPokemon(!showThirdPokemon);
    if (!showThirdPokemon) {
      // If turning on third Pokemon, randomly select one
      const randomIndex = Math.floor(Math.random() * pokemonList.length);
      setPokemon3(pokemonList[randomIndex]?.name || "");
    }
  };

  const createFusion = () => {
    // In a real app, this would call your fusion API
    alert(`Creating fusion of: ${pokemon1} + ${pokemon2}${showThirdPokemon ? ` + ${pokemon3}` : ''}`);
  };

  const goBack = () => {
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
            <Button variant="ghost" className="text-white hover:bg-blue-400" onClick={goBack}>
              Home
            </Button>
            <Button variant="ghost" className="text-white bg-blue-400">
              Fusion Lab
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow container mx-auto p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-center text-blue-600 mb-8">Pokémon Fusion Lab</h1>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block mb-2 font-medium">First Pokémon</label>
                  <Select value={pokemon1} onValueChange={setPokemon1}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a Pokémon" />
                    </SelectTrigger>
                    <SelectContent>
                      {pokemonList.map((pokemon) => (
                        <SelectItem key={pokemon.name} value={pokemon.name}>
                          {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {pokemon1 && (
                    <div className="mt-2 flex justify-center">
                      <img 
                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${
                          pokemonList.findIndex(p => p.name === pokemon1) + 1
                        }.png`}
                        alt={pokemon1}
                        className="w-24 h-24"
                      />
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block mb-2 font-medium">Second Pokémon</label>
                  <Select value={pokemon2} onValueChange={setPokemon2}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a Pokémon" />
                    </SelectTrigger>
                    <SelectContent>
                      {pokemonList.map((pokemon) => (
                        <SelectItem key={pokemon.name} value={pokemon.name}>
                          {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {pokemon2 && (
                    <div className="mt-2 flex justify-center">
                      <img 
                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${
                          pokemonList.findIndex(p => p.name === pokemon2) + 1
                        }.png`}
                        alt={pokemon2}
                        className="w-24 h-24"
                      />
                    </div>
                  )}
                </div>
                
                {showThirdPokemon ? (
                  <div>
                    <label className="block mb-2 font-medium">Third Pokémon</label>
                    <Select value={pokemon3} onValueChange={setPokemon3}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a Pokémon" />
                      </SelectTrigger>
                      <SelectContent>
                        {pokemonList.map((pokemon) => (
                          <SelectItem key={pokemon.name} value={pokemon.name}>
                            {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {pokemon3 && (
                      <div className="mt-2 flex justify-center">
                        <img 
                          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${
                            pokemonList.findIndex(p => p.name === pokemon3) + 1
                          }.png`}
                          alt={pokemon3}
                          className="w-24 h-24"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-end justify-center pb-4">
                    <Button 
                      onClick={toggleThirdPokemon}
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      Add Third Pokémon
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="flex justify-center gap-4 mb-8">
                {showThirdPokemon && (
                  <Button 
                    variant="outline"
                    className="border-blue-500 text-blue-500"
                    onClick={toggleThirdPokemon}
                  >
                    Remove Third Pokémon
                  </Button>
                )}
                <Button 
                  variant="outline"
                  className="border-yellow-500 text-yellow-500 hover:bg-yellow-50"
                  onClick={handleRandomize}
                >
                  Randomize Selection
                </Button>
              </div>
              
              <div className="flex justify-center">
                <Button 
                  className="bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-6 text-lg"
                  onClick={createFusion}
                  disabled={!pokemon1 || !pokemon2 || (showThirdPokemon && !pokemon3)}
                >
                  Create {showThirdPokemon ? "Tri-" : ""}Fusion
                </Button>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-blue-800 text-white p-4 mt-auto">
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

export default FusionLab;
