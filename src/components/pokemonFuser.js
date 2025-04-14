
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

      // In a real implementation, this would call the AI API
      // For now, we'll create a fusion based on the Pokemon data
      return this.createDefaultFusion(pokemon1, pokemon2, pokemon3);
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
}
