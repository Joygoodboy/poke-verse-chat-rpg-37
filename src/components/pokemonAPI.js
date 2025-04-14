export class PokemonAPI {
  constructor() {
    this.baseUrl = 'https://pokeapi.co/api/v2';
    this.regions = {
      kanto: { offset: 0, limit: 151 },
      johto: { offset: 151, limit: 100 },
      hoenn: { offset: 251, limit: 135 },
      sinnoh: { offset: 386, limit: 107 },
      unova: { offset: 493, limit: 156 },
      kalos: { offset: 649, limit: 72 },
      alola: { offset: 721, limit: 88 },
      galar: { offset: 809, limit: 89 },
      paldea: { offset: 905, limit: 105 },
      tealMask: { offset: 1010, limit: 4 },
      indigoDisk: { offset: 1014, limit: 6 }
    };
    
    this.legendaryPokemon = {
      kanto: ["articuno", "zapdos", "moltres", "mewtwo", "mew"],
      johto: ["raikou", "entei", "suicune", "lugia", "ho-oh", "celebi"],
      hoenn: ["regirock", "regice", "registeel", "latias", "latios", "kyogre", "groudon", "rayquaza", "jirachi", "deoxys"],
      sinnoh: ["uxie", "mesprit", "azelf", "dialga", "palkia", "heatran", "regigigas", "giratina", "cresselia", "phione", "manaphy", "darkrai", "shaymin", "arceus"],
      unova: ["victini", "cobalion", "terrakion", "virizion", "tornadus", "thundurus", "reshiram", "zekrom", "landorus", "kyurem", "keldeo", "meloetta", "genesect"],
      kalos: ["xerneas", "yveltal", "zygarde", "diancie", "hoopa", "volcanion"],
      alola: ["tapu-koko", "tapu-lele", "tapu-bulu", "tapu-fini", "cosmog", "cosmoem", "solgaleo", "lunala", "nihilego", "buzzwole", "pheromosa", "xurkitree", "celesteela", "kartana", "guzzlord", "necrozma", "magearna", "marshadow", "poipole", "naganadel", "stakataka", "blacephalon", "zeraora", "meltan", "melmetal"],
      galar: ["zacian", "zamazenta", "eternatus", "kubfu", "urshifu", "regieleki", "regidrago", "glastrier", "spectrier", "calyrex"],
      paldea: ["koraidon", "miraidon", "wo-chien", "chien-pao", "ting-lu", "chi-yu", "walking-wake", "iron-leaves"]
    };

    this.regionalForms = {
      alola: [
        "rattata-alola", "raticate-alola", "raichu-alola", "sandshrew-alola", 
        "sandslash-alola", "vulpix-alola", "ninetales-alola", "diglett-alola",
        "dugtrio-alola", "meowth-alola", "persian-alola", "geodude-alola",
        "graveler-alola", "golem-alola", "grimer-alola", "muk-alola",
        "exeggutor-alola", "marowak-alola"
      ],
      galar: [
        "meowth-galar", "ponyta-galar", "rapidash-galar", "slowpoke-galar",
        "slowbro-galar", "farfetchd-galar", "weezing-galar", "mr-mime-galar",
        "articuno-galar", "zapdos-galar", "moltres-galar", "slowking-galar",
        "corsola-galar", "zigzagoon-galar", "linoone-galar", "darumaka-galar",
        "darmanitan-galar", "yamask-galar", "stunfisk-galar"
      ],
      hisui: [
        "growlithe-hisui", "arcanine-hisui", "voltorb-hisui", "electrode-hisui",
        "typhlosion-hisui", "qwilfish-hisui", "sneasel-hisui", "samurott-hisui",
        "lilligant-hisui", "zorua-hisui", "zoroark-hisui", "braviary-hisui",
        "sliggoo-hisui", "goodra-hisui", "avalugg-hisui", "decidueye-hisui",
        "wyrdeer", "kleavor", "ursaluna", "basculegion", "sneasler", 
        "overqwil", "enamorus"
      ],
      paldea: [
        "tauros-paldea-combat", "tauros-paldea-blaze", "tauros-paldea-aqua",
        "wooper-paldea"
      ],
      dlc: [
        "okidogi", "munkidori", "fezandipiti", "ogerpon", 
        "ogerpon-wellspring", "ogerpon-hearthflame", "ogerpon-cornerstone",
        "terapagos", "archaludon", "raging-bolt", "iron-crown",
        "iron-boulder", "iron-bundle", "iron-hands", "iron-jugulis",
        "iron-moth", "iron-thorns", "iron-treads", "iron-valiant",
        "walking-wake", "gouging-fire", "iron-leaves", "iron-butterfly"
      ]
    };

    this.detailsCache = {};
  }

  async getPokemonList() {
    try {
      const allPokemonPromises = Object.entries(this.regions).map(async ([region, { offset, limit }]) => {
        const response = await fetch(`${this.baseUrl}/pokemon?offset=${offset}&limit=${limit}`);
        const data = await response.json();
        return data.results.map(pokemon => ({
          ...pokemon,
          region: region === 'tealMask' ? 'Teal Mask DLC' :
                  region === 'indigoDisk' ? 'Indigo Disk DLC' :
                  region.charAt(0).toUpperCase() + region.slice(1),
          isLegendary: this.legendaryPokemon[region]?.includes(pokemon.name) || false
        }));
      });

      let allPokemon = (await Promise.all(allPokemonPromises)).flat();

      const batchSize = 5;
      const allRegionalForms = [];
      
      for (const [region, forms] of Object.entries(this.regionalForms)) {
        for (let i = 0; i < forms.length; i += batchSize) {
          const batch = forms.slice(i, i + batchSize);
          const formPromises = batch.map(async (formName) => {
            try {
              await new Promise(resolve => setTimeout(resolve, 100));
              
              const response = await fetch(`${this.baseUrl}/pokemon/${formName}`);
              if (!response.ok) {
                console.warn(`Failed to fetch ${formName}: ${response.status}`);
                return null;
              }
              
              return {
                name: formName,
                url: `${this.baseUrl}/pokemon/${formName}`,
                region: region === 'dlc' ? 'DLC Forms' :
                        `${region.charAt(0).toUpperCase()}${region.slice(1)} Forms`,
                isLegendary: false
              };
            } catch (error) {
              console.warn(`Failed to fetch ${formName}:`, error);
              return null;
            }
          });

          const batchResults = await Promise.all(formPromises);
          allRegionalForms.push(...batchResults.filter(p => p !== null));
          
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }

      allPokemon = [...allPokemon, ...allRegionalForms];

      const regionOrder = [
        'Kanto', 'Kanto Legendaries',
        'Johto', 'Johto Legendaries',
        'Hoenn', 'Hoenn Legendaries',
        'Sinnoh', 'Sinnoh Legendaries',
        'Unova', 'Unova Legendaries',
        'Kalos', 'Kalos Legendaries',
        'Alola', 'Alola Legendaries',
        'Galar', 'Galar Legendaries',
        'Paldea', 'Paldea Legendaries',
        'Teal Mask DLC', 'Indigo Disk DLC',
        'Alola Forms', 'Galar Forms', 'Hisui Forms', 'Paldea Forms', 'DLC Forms'
      ];

      allPokemon = allPokemon.map(pokemon => {
        if (pokemon.isLegendary) {
          pokemon.region = `${pokemon.region} Legendaries`;
        }
        return pokemon;
      });

      allPokemon.sort((a, b) => {
        const regionA = regionOrder.indexOf(a.region);
        const regionB = regionOrder.indexOf(b.region);
        
        if (regionA !== regionB) {
          return regionA - regionB;
        }
        
        return a.name.localeCompare(b.name);
      });

      return allPokemon;
    } catch (error) {
      console.error('Failed to fetch pokemon list:', error);
      throw error;
    }
  }

  async getPokemonDetails(nameOrId) {
    if (this.detailsCache[nameOrId]) {
      return this.detailsCache[nameOrId];
    }
    try {
      let retries = 3;
      let lastError;
      
      while (retries > 0) {
        try {
          const response = await fetch(`${this.baseUrl}/pokemon/${nameOrId}`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          this.detailsCache[nameOrId] = data;
          return data;
        } catch (error) {
          lastError = error;
          retries--;
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
      
      throw lastError;
    } catch (error) {
      console.error(`Failed to fetch pokemon details for ${nameOrId}:`, error);
      throw error;
    }
  }
}