
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

      // For now, we'll create an enhanced fusion based on the Pokemon data
      return this.createEnhancedFusion(pokemon1, pokemon2, pokemon3);
    } catch (error) {
      console.error('Failed to create fusion:', error);
      
      // Fallback to default fusion if something fails
      return this.createDefaultFusion(pokemon1, pokemon2, pokemon3);
    }
  }

  createEnhancedFusion(pokemon1, pokemon2, pokemon3 = null) {
    // Generate a fusion with more visual elements from all Pokémon
    const combinedName = this.combineNames(
      pokemon1.name, 
      pokemon2.name, 
      pokemon3 ? pokemon3.name : ''
    );
    
    // Combine types intelligently (prioritize unique types)
    const combinedTypes = [...new Set([
      ...pokemon1.types.map(t => t.type.name), 
      ...pokemon2.types.map(t => t.type.name),
      ...(pokemon3 ? pokemon3.types.map(t => t.type.name) : [])
    ])].slice(0, 3);

    // Create abilities that combine aspects of each Pokémon
    const fusedAbilities = this.createFusedAbilities(
      pokemon1.abilities, 
      pokemon2.abilities,
      pokemon3 ? pokemon3.abilities : null
    );

    // Generate a description based on all parent Pokémon
    const description = this.generateFusionDescription(
      pokemon1, 
      pokemon2, 
      pokemon3,
      combinedTypes
    );

    // For the image, we'll use a combination approach - here we just use the first Pokémon
    // In a real app, you would use an image generation service
    const spriteOptions = [
      pokemon1.sprites.other["official-artwork"]?.front_default,
      pokemon1.sprites.other.home?.front_default,
      pokemon1.sprites.front_default
    ];
    
    // Find the first available sprite image
    const baseImage = spriteOptions.find(sprite => sprite) || '';

    return {
      name: combinedName,
      type: combinedTypes,
      description: description,
      stats: this.averageStats(
        this.transformStats(pokemon1.stats), 
        this.transformStats(pokemon2.stats),
        pokemon3 ? this.transformStats(pokemon3.stats) : null
      ),
      abilities: fusedAbilities,
      image: baseImage,
    };
  }

  createFusedAbilities(abilities1, abilities2, abilities3 = null) {
    // Extract ability names
    const ability1Names = abilities1.map(a => a.ability.name);
    const ability2Names = abilities2.map(a => a.ability.name);
    const ability3Names = abilities3 ? abilities3.map(a => a.ability.name) : [];
    
    // Create a primary fusion ability
    const fusionAbility = {
      name: this.combineWords([
        ability1Names[0] || "Unknown", 
        ability2Names[0] || "Power",
        abilities3 ? ability3Names[0] : null
      ]),
      description: `A unique ability combining the powers of ${
        ability1Names[0] || "unknown"}, ${ability2Names[0] || "unknown"}${
        abilities3 ? ` and ${ability3Names[0] || "unknown"}` : ""}`
    };
    
    // Create a secondary specialized ability
    const specializedAbility = {
      name: `${abilities3 ? "Tri" : "Dual"}-Nature`,
      description: `This Pokémon can harness the natural talents of ${
        pokemon1.name}, ${pokemon2.name}${pokemon3 ? ` and ${pokemon3.name}` : ""} simultaneously.`
    };
    
    return [fusionAbility, specializedAbility];
  }

  generateFusionDescription(pokemon1, pokemon2, pokemon3, types) {
    const isTri = pokemon3 !== null;
    const typePhrase = types.length > 1 
      ? `${types.slice(0, -1).join(", ")} and ${types[types.length - 1]}` 
      : types[0];
      
    const heightAvg = (pokemon1.height + pokemon2.height + (pokemon3 ? pokemon3.height : 0)) / (isTri ? 3 : 2);
    const weightAvg = (pokemon1.weight + pokemon2.weight + (pokemon3 ? pokemon3.weight : 0)) / (isTri ? 3 : 2);
    
    const sizeDesc = heightAvg > 15 ? "towering" : heightAvg < 5 ? "compact" : "medium-sized";
    const buildDesc = weightAvg > 1000 ? "massive" : weightAvg < 100 ? "lightweight" : "balanced";
    
    return `A ${sizeDesc}, ${buildDesc} ${isTri ? "tri" : "dual"}-fusion of ${pokemon1.name}, ${pokemon2.name}${
      isTri ? ` and ${pokemon3.name}` : ""
    }. This ${typePhrase}-type Pokémon inherits unique characteristics from each of its parent species, combining their strengths in unprecedented ways.`;
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
      description: `A mysterious ${pokemon3 ? "tri" : "dual"}-fusion of ${pokemon1.name}, ${pokemon2.name}${pokemon3 ? ` and ${pokemon3.name}` : ''}`,
      stats: this.averageStats(
        this.transformStats(pokemon1.stats), 
        this.transformStats(pokemon2.stats),
        pokemon3 ? this.transformStats(pokemon3.stats) : null
      ),
      abilities: [
        {
          name: `${pokemon3 ? "Tri" : "Dual"}-Fusion Power`,
          description: `Combines the strengths of ${pokemon3 ? "three" : "two"} Pokémon in unprecedented ways.`
        }
      ],
      image: pokemon1.sprites.other["official-artwork"].front_default,
    };
  }

  combineNames(name1, name2, name3 = '') {
    // Enhanced name combination logic for three Pokemon
    const parts = [name1, name2, name3].filter(Boolean);
    const halfLength = Math.ceil(parts.join('').length / parts.length);
    
    const firstPart = parts.map(name => 
      name.slice(0, Math.ceil(name.length / 2))
    ).join('').slice(0, halfLength);
    
    const secondPart = parts.map(name => 
      name.slice(Math.ceil(name.length / 2))
    ).join('').slice(0, halfLength);
    
    return (firstPart.charAt(0).toUpperCase() + firstPart.slice(1) + secondPart);
  }

  combineWords(words) {
    const filteredWords = words.filter(Boolean);
    
    // For just 1 word, return it
    if (filteredWords.length === 1) return filteredWords[0];
    
    // For 2+ words, combine parts
    const firstParts = filteredWords.map(word => word.slice(0, Math.ceil(word.length / filteredWords.length)));
    return firstParts.join('');
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

  transformStats(stats) {
    return stats.reduce((acc, stat) => {
      const statName = stat.stat.name.replace('-', '_');
      acc[statName] = stat.base_stat;
      return acc;
    }, {});
  }

  validateFusionData(fusionData) {
    // Default values in case of incomplete response
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

    // Merge default with response, giving priority to response
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

  // Add a method to generate image prompts
  generateImagePrompt(fusionData, parentPokemon) {
    const typeDesc = fusionData.type.join(' and ');
    
    return `A high-quality official artwork style image of a new Pokémon fusion named ${fusionData.name}, which is a combination of ${parentPokemon.pokemon1Name}${parentPokemon.pokemon2Name ? `, ${parentPokemon.pokemon2Name}` : ''}${parentPokemon.pokemon3Name ? ` and ${parentPokemon.pokemon3Name}` : ''}. It is a ${typeDesc} type Pokémon with unique characteristics from all parent Pokémon.`;
  }
}
