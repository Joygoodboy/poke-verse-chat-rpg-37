
// Let's update the battle image generator to include animations and effects

export const generateBattleImage = (battle: any, lastAttack: any = null) => {
  const { challengerPokemon, opponentPokemon, winner } = battle;
  
  if (!challengerPokemon || !opponentPokemon) {
    return '<div class="text-center">Loading battle...</div>';
  }
  
  const challengerHealthPercent = (challengerPokemon.health / challengerPokemon.maxHealth) * 100;
  const opponentHealthPercent = (opponentPokemon.health / opponentPokemon.maxHealth) * 100;
  
  const getHealthColor = (percent: number) => {
    if (percent > 50) return "bg-green-500";
    if (percent > 20) return "bg-yellow-500";
    return "bg-red-500";
  };
  
  const challengerHealthColor = getHealthColor(challengerHealthPercent);
  const opponentHealthColor = getHealthColor(opponentHealthPercent);
  
  // Generate attack effects
  let effectsHtml = '';
  if (lastAttack) {
    const { attacker, defender, moveName, damage, isCritical, effectiveness } = lastAttack;
    
    // Determine effect class based on attack properties
    let effectClass = '';
    if (moveName.toLowerCase().includes('fire') || moveName.toLowerCase().includes('burn')) {
      effectClass = 'fire-effect';
    } else if (moveName.toLowerCase().includes('water') || moveName.toLowerCase().includes('bubble')) {
      effectClass = 'water-effect';
    } else if (moveName.toLowerCase().includes('thunder') || moveName.toLowerCase().includes('electric')) {
      effectClass = 'electric-effect';
    } else if (damage > 30 || isCritical) {
      effectClass = 'critical-effect';
    } else {
      effectClass = 'normal-effect';
    }
    
    effectsHtml = `
      <div class="${effectClass} absolute inset-0 pointer-events-none flex items-center justify-center z-10">
        <div class="text-4xl font-bold attack-text">${moveName}!</div>
        ${isCritical ? '<div class="critical-hit">CRITICAL HIT!</div>' : ''}
        ${effectiveness > 1 ? '<div class="super-effective">SUPER EFFECTIVE!</div>' : ''}
        ${effectiveness < 1 ? '<div class="not-effective">NOT VERY EFFECTIVE...</div>' : ''}
      </div>
    `;
  }
  
  // Generate the winner effects
  let winnerEffectsHtml = '';
  if (winner) {
    const winnerPokemon = winner === battle.challenger ? challengerPokemon : opponentPokemon;
    winnerEffectsHtml = `
      <div class="victory-effect absolute inset-0 flex items-center justify-center z-20">
        <div class="text-4xl font-bold text-yellow-400 animate-bounce victory-text">
          ${winnerPokemon.name} WINS!
        </div>
      </div>
    `;
  }
  
  // Generate CSS for the animations
  const animationStyles = `
    <style>
      /* Battle scene base */
      .battle-scene {
        position: relative;
        overflow: hidden;
        background: linear-gradient(to bottom, #4a83b2, #7abeed);
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
      }
      
      /* Pokemon animations */
      .pokemon-sprite {
        transition: all 0.3s ease;
      }
      
      .pokemon-sprite.attack {
        animation: attack-animation 0.5s ease;
      }
      
      .challenger-pokemon {
        animation: float 3s ease-in-out infinite;
      }
      
      .opponent-pokemon {
        animation: float 3s ease-in-out infinite;
        animation-delay: 1.5s;
      }
      
      @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
      
      @keyframes attack-animation {
        0% { transform: translateX(0); }
        25% { transform: translateX(20px) rotate(5deg); }
        50% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
        100% { transform: translateX(0); }
      }
      
      /* Attack effects */
      .fire-effect {
        background: radial-gradient(circle, rgba(255,100,0,0.4) 0%, rgba(255,0,0,0) 70%);
        animation: pulse 1s ease-in-out;
      }
      
      .water-effect {
        background: radial-gradient(circle, rgba(0,100,255,0.4) 0%, rgba(0,0,255,0) 70%);
        animation: pulse 1s ease-in-out;
      }
      
      .electric-effect {
        background: radial-gradient(circle, rgba(255,255,0,0.4) 0%, rgba(255,255,0,0) 70%);
        animation: zap 0.8s ease-in-out;
      }
      
      .critical-effect {
        background: radial-gradient(circle, rgba(255,0,0,0.3) 0%, rgba(255,0,0,0) 70%);
        animation: shake 0.5s ease-in-out;
      }
      
      .normal-effect {
        animation: flash 0.5s ease-in-out;
      }
      
      .attack-text {
        color: white;
        text-shadow: 2px 2px 5px rgba(0,0,0,0.7);
        animation: zoom-in 0.3s ease-out forwards;
        opacity: 0;
        transform: scale(0.5);
      }
      
      .critical-hit {
        color: #ff3333;
        font-weight: bold;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        position: absolute;
        bottom: 30%;
        animation: slide-up 0.5s ease-out forwards;
        opacity: 0;
        transform: translateY(20px);
      }
      
      .super-effective, .not-effective {
        color: white;
        font-weight: bold;
        position: absolute;
        bottom: 20%;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        animation: slide-up 0.5s ease-out 0.3s forwards;
        opacity: 0;
        transform: translateY(20px);
      }
      
      .super-effective {
        color: #33ff33;
      }
      
      .not-effective {
        color: #aaaaaa;
      }
      
      /* Victory effects */
      .victory-effect {
        background: radial-gradient(circle, rgba(255,215,0,0.3) 0%, rgba(255,215,0,0) 70%);
        animation: victory-pulse 2s ease-in-out infinite;
      }
      
      .victory-text {
        text-shadow: 2px 2px 10px #ff9900, -2px -2px 10px #ff9900;
        animation: victory-bounce 1s ease infinite;
      }
      
      /* Animation keyframes */
      @keyframes pulse {
        0% { opacity: 0; }
        50% { opacity: 1; }
        100% { opacity: 0; }
      }
      
      @keyframes zap {
        0%, 100% { opacity: 0; }
        10%, 30%, 50%, 70%, 90% { opacity: 0.8; }
        20%, 40%, 60%, 80% { opacity: 0.2; }
      }
      
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        20%, 60% { transform: translateX(-10px); }
        40%, 80% { transform: translateX(10px); }
      }
      
      @keyframes flash {
        0%, 100% { opacity: 0; }
        50% { opacity: 0.5; }
      }
      
      @keyframes zoom-in {
        0% { opacity: 0; transform: scale(0.5); }
        100% { opacity: 1; transform: scale(1); }
      }
      
      @keyframes slide-up {
        0% { opacity: 0; transform: translateY(20px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes victory-pulse {
        0%, 100% { opacity: 0.3; }
        50% { opacity: 0.6; }
      }
      
      @keyframes victory-bounce {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }
      
      /* Health bars */
      .health-bar {
        height: 10px;
        border-radius: 5px;
        transition: width 0.5s ease;
      }
      
      .health-text {
        font-size: 0.8rem;
        font-weight: bold;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
      }
      
      /* Background elements */
      .battle-ground {
        background: url('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/grass-memory.png') repeat-x bottom;
        height: 20px;
        opacity: 0.7;
      }
      
      .battle-sky {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 100%;
        background: linear-gradient(to bottom, #7abeed 0%, #4a83b2 100%);
        z-index: -1;
      }
      
      .battle-clouds {
        position: absolute;
        top: 20%;
        left: 0;
        right: 0;
        height: 40px;
        background: url('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/air-balloon.png') repeat-x;
        background-size: contain;
        opacity: 0.3;
        animation: clouds-move 30s linear infinite;
      }
      
      @keyframes clouds-move {
        0% { background-position: 0 0; }
        100% { background-position: 100% 0; }
      }
    </style>
  `;
  
  // HTML for the battle scene
  return `
    ${animationStyles}
    <div class="battle-scene w-full h-64 relative p-4">
      <!-- Sky background with clouds -->
      <div class="battle-sky"></div>
      <div class="battle-clouds"></div>
      
      <!-- Opponent's Pokemon -->
      <div class="flex flex-col items-center absolute right-8 top-4">
        <div class="mb-2 text-center">
          <div class="text-white text-sm font-bold mb-1">${opponentPokemon.name} Lv.${opponentPokemon.level}</div>
          <div class="w-32 bg-gray-700 rounded-full">
            <div class="health-bar ${opponentHealthColor}" style="width: ${opponentHealthPercent}%"></div>
          </div>
          <div class="health-text text-white">${opponentPokemon.health}/${opponentPokemon.maxHealth}</div>
        </div>
        <img 
          src="${opponentPokemon.image}" 
          alt="${opponentPokemon.name}" 
          class="w-24 h-24 opponent-pokemon pokemon-sprite ${lastAttack && lastAttack.defender === opponentPokemon.name ? 'hurt-animation' : ''}"
        />
      </div>
      
      <!-- Challenger's Pokemon -->
      <div class="flex flex-col items-center absolute left-8 bottom-8">
        <img 
          src="${challengerPokemon.image}" 
          alt="${challengerPokemon.name}" 
          class="w-24 h-24 challenger-pokemon pokemon-sprite ${lastAttack && lastAttack.defender === challengerPokemon.name ? 'hurt-animation' : ''}"
        />
        <div class="mt-2 text-center">
          <div class="text-white text-sm font-bold mb-1">${challengerPokemon.name} Lv.${challengerPokemon.level}</div>
          <div class="w-32 bg-gray-700 rounded-full">
            <div class="health-bar ${challengerHealthColor}" style="width: ${challengerHealthPercent}%"></div>
          </div>
          <div class="health-text text-white">${challengerPokemon.health}/${challengerPokemon.maxHealth}</div>
        </div>
      </div>
      
      <!-- Battle ground -->
      <div class="battle-ground absolute bottom-0 left-0 right-0"></div>
      
      <!-- Effects animation layer -->
      ${effectsHtml}
      
      <!-- Winner effects -->
      ${winnerEffectsHtml}
    </div>
  `;
};

export const generatePokedexEntry = (pokemon: any) => {
  if (!pokemon) {
    return '<div class="text-center">No Pokémon selected</div>';
  }
  
  return `
    <div class="bg-slate-800 rounded-lg p-4 relative overflow-hidden">
      <div class="absolute top-0 right-0 w-32 h-32 bg-slate-700 rounded-full -mt-16 -mr-16 opacity-20"></div>
      
      <div class="flex flex-col sm:flex-row gap-4 items-center mb-4">
        <div class="w-32 h-32 bg-slate-700 rounded-full flex items-center justify-center p-2 border-4 border-slate-600">
          <img src="${pokemon.image}" alt="${pokemon.name}" class="w-20 h-20 object-contain animate-pulse" />
        </div>
        
        <div class="flex-1">
          <h3 class="text-xl font-bold text-white">${pokemon.name}</h3>
          <p class="text-slate-300">Level ${pokemon.level}</p>
          <p class="text-slate-300">Type: ${pokemon.type || 'Normal'}</p>
          <div class="w-full bg-slate-700 h-2 rounded-full mt-2">
            <div class="bg-blue-500 h-2 rounded-full" style="width: ${(pokemon.xp || 0) / (pokemon.level * 100) * 100}%"></div>
          </div>
          <p class="text-xs text-slate-400">XP: ${pokemon.xp || 0}/${pokemon.level * 100}</p>
        </div>
      </div>
      
      <div class="space-y-2">
        <h4 class="text-white font-bold">Battle Moves:</h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          ${pokemon.moves ? pokemon.moves.map((move: any, index: number) => `
            <div class="bg-slate-700 p-2 rounded flex justify-between items-center">
              <div>
                <span class="text-white font-medium">${move.name}</span>
                <span class="text-xs text-slate-400 block">Type: ${move.type}</span>
              </div>
              <div class="flex flex-col items-end">
                <span class="text-yellow-400">${move.power} PWR</span>
                <span class="text-xs text-slate-400">${move.accuracy}% ACC</span>
              </div>
            </div>
          `).join('') : 'No moves available'}
        </div>
      </div>
    </div>
  `;
};
