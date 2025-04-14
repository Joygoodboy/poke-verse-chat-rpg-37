export class PokemonFuser {
  async createFusion(pokemon1, pokemon2, pokemon3 = null) {
    try {
      // Prepare detailed Pokemon data for AI processing
      const pokemonData = {
        pokemon1: {
          name: pokemon1.name,
          types: pokemon1.types.map(t => t.type.name),
          stats: this.transformStats(pokemon1.stats),
          abilities: pokemon1.abilities.map(a => a.ability.name)
        },
        pokemon2: {
          name: pokemon2.name,
          types: pokemon2.types.map(t => t.type.name),
          stats: this.transformStats(pokemon2.stats),
          abilities: pokemon2.abilities.map(a => a.ability.name)
        },
        pokemon3: pokemon3 ? {
          name: pokemon3.name,
          types: pokemon3.types.map(t => t.type.name),
          stats: this.transformStats(pokemon3.stats),
          abilities: pokemon3.abilities.map(a => a.ability.name)
        } : null
      };

      const response = await fetch('/api/ai_completion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `Generate a unique Pokemon tri-fusion combining characteristics of ${pokemonData.pokemon1.name}, ${pokemonData.pokemon2.name}${pokemon3 ? ` and ${pokemonData.pokemon3.name}` : ''}.

interface PokemonFusion {
  name: string;
  type: string[];
  description: string;
  stats: {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
    special_attack: number;
    special_defense: number;
  };
  abilities: Array<{
    name: string;
    description: string;
  }>;
}

{
  "name": "Pichachu-Zerachu",
  "type": ["Electric", "Normal", "Dragon"],
  "description": "A powerful tri-fusion that combines the speed of Pikachu, the strength of Zeraora, and the mystique of Dragonite.",
  "stats": {
    "hp": 85,
    "attack": 90,
    "defense": 75,
    "speed": 110,
    "special_attack": 100,
    "special_defense": 85
  },
  "abilities": [
    {
      "name": "Tri-Static Surge",
      "description": "Combines the static ability of Pikachu, the electric punch of Zeraora, and the dragon's resilience."
    },
    {
      "name": "Fusion Synergy",
      "description": "Gains a boost to all stats when battling, scaling with the number of Pokemon in the fusion."
    }
  ]
}

Guidelines:
1. Create a creative, unique name blending all three Pokemon
2. Merge types logically, maximum of 3 types
3. Balance stats between all three parents
4. Create unique, thematic tri-fusion abilities
5. Ensure result is engaging and plausible`,
          data: pokemonData
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI Completion Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`AI Completion failed: ${response.status} - ${errorText}`);
      }

      const fusionData = await response.json();
      
      // Validate and normalize the fusion data
      return this.validateFusionData(fusionData);
    } catch (error) {
      console.error('Failed to create fusion:', error);
      
      // Fallback to default fusion if AI fails
      return this.createDefaultFusion(pokemon1, pokemon2, pokemon3);
    }
  }

  createDefaultFusion(pokemon1, pokemon2, pokemon3 = null) {
    // Generate a basic tri-fusion when AI fails
    const combinedName = this.combineNames(
      pokemon1.name, 
      pokemon2.name, 
      pokemon3 ? pokemon3.name : ''
    );
    
    const combinedTypes = [...new Set([
      ...pokemon1.types.map(t => t.type.name), 
      ...pokemon2.types.map(t => t.type.name),
      ...(pokemon3 ? pokemon3.types.map(t => t.type.name) : [])
    ])].slice(0, 3);

    return {
      name: combinedName,
      type: combinedTypes,
      description: `A mysterious tri-fusion of ${pokemon1.name}, ${pokemon2.name}${pokemon3 ? ` and ${pokemon3.name}` : ''}`,
      stats: this.averageStats(
        this.transformStats(pokemon1.stats), 
        this.transformStats(pokemon2.stats),
        pokemon3 ? this.transformStats(pokemon3.stats) : null
      ),
      abilities: [
        {
          name: "Tri-Fusion Power",
          description: "Combines the strengths of three Pokemon in unprecedented ways."
        }
      ]
    };
  }

  combineNames(name1, name2, name3 = '') {
    // Enhanced name combination logic for three Pokemon
    const combineName = (n1, n2, n3) => {
      const parts = [n1, n2, n3].filter(Boolean);
      const halfLength = Math.ceil(parts.join('').length / parts.length);
      
      return parts.map(name => 
        name.slice(0, Math.ceil(name.length / 2))
      ).join('').slice(0, halfLength).charAt(0).toUpperCase() + 
      parts.map(name => 
        name.slice(Math.ceil(name.length / 2))
      ).join('').slice(0, halfLength);
    };
    
    return combineName(name1, name2, name3);
  }

  averageStats(stats1, stats2, stats3 = null) {
    const averagedStats = {};
    const statNames = Object.keys(stats1);
    
    for (const stat of statNames) {
      const statsToAverage = [stats1[stat], stats2[stat]];
      if (stats3) statsToAverage.push(stats3[stat]);
      
      averagedStats[stat] = Math.round(
        statsToAverage.reduce((a, b) => a + b, 0) / statsToAverage.length
      );
    }
    return averagedStats;
  }

  async generateImagePrompt(fusionData, parentNames) {
    try {
      const response = await fetch('/api/ai_completion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `Generate a detailed, creative pixel art sprite prompt for a Tri-Pokemon fusion:
          
interface ImagePrompt {
  prompt: string;
}

{
  "prompt": "detailed pixel art sprite of Pichachu-Zerachu, a tri-fusion of Pikachu, Zeraora, and Dragonite, with electric sparks, dragon scales, and a dynamic pose, 32-bit style reminiscent of Pokemon Fire Red, clean pixel edges, white background"
}

Using the fusion data and parent Pokemon names, create a detailed prompt for generating a pixel art sprite that:
- Clearly describes the fusion's appearance combining distinctive features from all three Pokemon
- Specifies classic 32-bit game sprite style with clean pixel edges
- Mentions white background and front-facing game asset style
- Captures the fusion's unique type characteristics

Fusion name: ${fusionData.name}
Parent Pokemon: ${parentNames.pokemon1Name} / ${parentNames.pokemon2Name}${parentNames.pokemon3Name ? ` / ${parentNames.pokemon3Name}` : ''}`,
          data: fusionData
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.prompt + ", pixel art, sprite, 32-bit, clean pixels, white background";
    } catch (error) {
      console.error('Failed to generate image prompt:', error);
      
      // Fallback prompt if AI fails
      return `${fusionData.name}, a tri-fusion of ${parentNames.pokemon1Name} / ${parentNames.pokemon2Name}${parentNames.pokemon3Name ? ` / ${parentNames.pokemon3Name}` : ''}, pixel art, sprite, 32-bit, clean pixels, white background`;
    }
  }

  transformStats(stats) {
    return stats.reduce((acc, stat) => {
      const statName = stat.stat.name.replace('-', '_');
      acc[statName] = stat.base_stat;
      return acc;
    }, {});
  }

  validateFusionData(fusionData) {
    // Default values in case of incomplete AI response
    const defaultFusion = {
      name: 'Mysterion',
      type: ['Normal'],
      description: 'A mysterious Pokemon fusion with unique characteristics.',
      stats: {
        hp: 70,
        attack: 75,
        defense: 70,
        speed: 65,
        special_attack: 70,
        special_defense: 70
      },
      abilities: [
        {
          name: 'Fusion Power',
          description: 'Combines the strengths of two Pokemon in unexpected ways.'
        }
      ]
    };

    // Merge default with AI response, giving priority to AI response
    const mergedFusion = {
      name: fusionData.name || defaultFusion.name,
      type: fusionData.type && fusionData.type.length ? fusionData.type : defaultFusion.type,
      description: fusionData.description || defaultFusion.description,
      stats: { ...defaultFusion.stats, ...fusionData.stats },
      abilities: fusionData.abilities && fusionData.abilities.length 
        ? fusionData.abilities 
        : defaultFusion.abilities
    };

    // Ensure all stats are numbers and within reasonable bounds
    Object.keys(mergedFusion.stats).forEach(stat => {
      mergedFusion.stats[stat] = Math.max(10, Math.min(180, Number(mergedFusion.stats[stat])));
    });

    return mergedFusion;
  }
}