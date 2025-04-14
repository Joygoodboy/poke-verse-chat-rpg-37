
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft } from "lucide-react";
import { PokemonFuser } from "../components/pokemonFuser";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

const FusionLab = () => {
  const [pokemon1, setPokemon1] = useState<string>("");
  const [pokemon2, setPokemon2] = useState<string>("");
  const [pokemon3, setPokemon3] = useState<string>("");
  const [pokemonList, setPokemonList] = useState<any[]>([]);
  const [showThirdPokemon, setShowThirdPokemon] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCreatingFusion, setIsCreatingFusion] = useState<boolean>(false);
  const [fusion, setFusion] = useState<any>(null);
  
  const navigate = useNavigate();
  const pokemonFuser = new PokemonFuser();

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
        toast.error("Failed to load Pokémon list");
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
    } else {
      // Reset fusion if removing third Pokemon
      setFusion(null);
    }
  };

  const fetchPokemonData = async (name: string) => {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
    if (!response.ok) throw new Error(`Failed to fetch ${name}`);
    return await response.json();
  };

  const createFusion = async () => {
    if (!pokemon1 || !pokemon2 || (showThirdPokemon && !pokemon3)) {
      toast.error("Please select all required Pokémon");
      return;
    }
    
    try {
      setIsCreatingFusion(true);
      
      // Fetch detailed data for all selected Pokemon
      const pokemon1Data = await fetchPokemonData(pokemon1);
      const pokemon2Data = await fetchPokemonData(pokemon2);
      let pokemon3Data = null;
      
      if (showThirdPokemon && pokemon3) {
        pokemon3Data = await fetchPokemonData(pokemon3);
      }
      
      // Create the fusion
      const fusionResult = await pokemonFuser.createFusion(
        pokemon1Data, 
        pokemon2Data, 
        pokemon3Data
      );
      
      setFusion(fusionResult);
      toast.success(`Successfully created ${fusionResult.name}!`);
    } catch (error) {
      console.error("Error creating fusion:", error);
      toast.error("Failed to create fusion");
    } finally {
      setIsCreatingFusion(false);
    }
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
            <Button onClick={goBack} variant="outline" className="bg-transparent text-white border-white">
              Back to Home
            </Button>
          </div>
        </div>
      </header>

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
              
              <div className="flex justify-center mb-8">
                <Button 
                  className="bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-6 text-lg"
                  onClick={createFusion}
                  disabled={!pokemon1 || !pokemon2 || (showThirdPokemon && !pokemon3) || isCreatingFusion}
                >
                  {isCreatingFusion 
                    ? "Creating Fusion..." 
                    : `Create ${showThirdPokemon ? "Tri-" : ""}Fusion`}
                </Button>
              </div>
              
              {/* Fusion Result */}
              {fusion && (
                <div className="mt-8">
                  <h2 className="text-xl font-bold text-center mb-4">Fusion Result</h2>
                  <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg p-6 shadow-md">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                      <div className="flex-shrink-0">
                        <img 
                          src={fusion.image || "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png"} 
                          alt={fusion.name}
                          className="w-40 h-40 object-contain"
                        />
                      </div>
                      <div className="flex-grow">
                        <h3 className="text-2xl font-bold text-indigo-700">{fusion.name}</h3>
                        <div className="flex flex-wrap gap-2 my-2">
                          {fusion.type.map((type: string) => (
                            <span 
                              key={type} 
                              className="px-3 py-1 rounded-full text-xs font-semibold"
                              style={{
                                backgroundColor: getTypeColor(type),
                                color: ['dark', 'ghost', 'psychic'].includes(type.toLowerCase()) ? 'white' : 'black'
                              }}
                            >
                              {type}
                            </span>
                          ))}
                        </div>
                        <p className="text-gray-700 italic mb-4">{fusion.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {Object.entries(fusion.stats).map(([stat, value]: [string, any]) => (
                            <div key={stat} className="flex flex-col">
                              <span className="text-xs text-gray-500 uppercase">
                                {stat.replace('_', ' ')}
                              </span>
                              <div className="flex items-center gap-2">
                                <div className="h-2 bg-gray-200 rounded-full flex-grow">
                                  <div 
                                    className="h-2 bg-indigo-500 rounded-full" 
                                    style={{ width: `${Math.min(100, (Number(value) / 180) * 100)}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs font-semibold">{value}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-4">
                          <h4 className="font-semibold text-sm text-indigo-700 mb-2">Abilities</h4>
                          <ul className="space-y-2">
                            {fusion.abilities.map((ability: any, index: number) => (
                              <li key={index} className="bg-white p-2 rounded shadow-sm">
                                <span className="font-medium">{ability.name}:</span> {ability.description}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-blue-800 text-white p-4 mt-auto">
        <div className="container mx-auto text-center">
          <p className="text-sm">© 2025 Pokémon Fusion Lab. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

// Helper function to get color based on Pokemon type
function getTypeColor(type: string): string {
  const typeColors: Record<string, string> = {
    normal: '#A8A878',
    fire: '#F08030',
    water: '#6890F0',
    electric: '#F8D030',
    grass: '#78C850',
    ice: '#98D8D8',
    fighting: '#C03028',
    poison: '#A040A0',
    ground: '#E0C068',
    flying: '#A890F0',
    psychic: '#F85888',
    bug: '#A8B820',
    rock: '#B8A038',
    ghost: '#705898',
    dragon: '#7038F8',
    dark: '#705848',
    steel: '#B8B8D0',
    fairy: '#EE99AC',
  };
  
  return typeColors[type.toLowerCase()] || '#A8A878';
}

export default FusionLab;
