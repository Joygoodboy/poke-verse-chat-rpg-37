
import { BattleFusionSystem, BattlePokemon, FusedPokemon } from "./battleFusion";
import { battleCommentary, CommentaryType } from "./battleCommentary";
import { playBattleAnimation, AnimationType } from "./battleAnimations";
import { toast } from "sonner";

// Enhanced battle system that incorporates animations, commentary, and fusion
export class EnhancedBattleSystem {
  private fusionSystem: BattleFusionSystem;
  
  // Player and opponent Pokemon teams
  private playerTeam: BattlePokemon[] = [];
  private opponentTeam: BattlePokemon[] = [];
  
  // Active Pokemon in battle
  private activePlayerPokemon: BattlePokemon | null = null;
  private activeOpponentPokemon: BattlePokemon | null = null;
  
  // Battle state
  private isBattleActive: boolean = false;
  private currentTurn: "player" | "opponent" = "player";
  private battleLog: string[] = [];
  
  constructor() {
    this.fusionSystem = new BattleFusionSystem();
  }
  
  /**
   * Initialize a new battle with player and opponent teams
   */
  public initBattle(playerTeam: BattlePokemon[], opponentTeam: BattlePokemon[]): void {
    // Setup teams
    this.playerTeam = [...playerTeam];
    this.opponentTeam = [...opponentTeam];
    
    // Set active Pokemon
    this.activePlayerPokemon = this.playerTeam[0];
    this.activeOpponentPokemon = this.opponentTeam[0];
    
    // Reset battle state
    this.isBattleActive = true;
    this.currentTurn = "player";
    this.battleLog = [];
    
    // Initialize HP for all Pokemon
    this.initializeTeamHp(this.playerTeam);
    this.initializeTeamHp(this.opponentTeam);
    
    // Announce battle start
    if (this.activePlayerPokemon && this.activeOpponentPokemon) {
      const startMessage = battleCommentary.comment(CommentaryType.BATTLE_START, {
        attacker: this.activePlayerPokemon.name,
        defender: this.activeOpponentPokemon.name
      });
      
      this.battleLog.push(startMessage);
    }
  }
  
  /**
   * Set initial HP values for all Pokemon in a team
   */
  private initializeTeamHp(team: BattlePokemon[]): void {
    for (const pokemon of team) {
      pokemon.currentHp = pokemon.stats.hp;
    }
  }
  
  /**
   * Execute an attack move
   */
  public async executeAttack(moveName: string): Promise<void> {
    if (!this.isBattleActive || !this.activePlayerPokemon || !this.activeOpponentPokemon) {
      toast.error("Cannot attack: No active battle");
      return;
    }
    
    // Determine attacker and defender based on current turn
    const attacker = this.currentTurn === "player" ? this.activePlayerPokemon : this.activeOpponentPokemon;
    const defender = this.currentTurn === "player" ? this.activeOpponentPokemon : this.activePlayerPokemon;
    
    // Check if move exists in attacker's move list
    if (!attacker.moves.includes(moveName)) {
      toast.error(`${attacker.name} doesn't know the move ${moveName}`);
      return;
    }
    
    // Calculate hit chance (90% base chance to hit)
    const hitChance = Math.random() < 0.9;
    
    if (!hitChance) {
      // Move missed
      const missMessage = battleCommentary.comment(CommentaryType.MISS, {
        attacker: attacker.name,
        defender: defender.name,
        move: moveName
      });
      
      this.battleLog.push(missMessage);
      await this.switchTurn();
      return;
    }
    
    // Calculate base damage
    const attackStat = attacker.stats.attack;
    const defenseStat = defender.stats.defense;
    const movePower = this.getMoveBasePower(moveName);
    const levelFactor = ((2 * (attacker.level || 50)) / 5) + 2;
    
    let baseDamage = ((levelFactor * movePower * attackStat) / defenseStat) / 50 + 2;
    
    // Calculate type effectiveness
    const moveType = this.getMoveType(moveName, attacker.types[0]);
    const effectiveness = this.calculateTypeEffectiveness(moveType, defender.types);
    baseDamage *= effectiveness;
    
    // Check for critical hit (10% chance)
    let isCritical = Math.random() < 0.1;
    if (isCritical) {
      baseDamage *= 1.5;
    }
    
    // Apply random factor (85-100%)
    const randomFactor = 0.85 + (Math.random() * 0.15);
    const finalDamage = Math.floor(baseDamage * randomFactor);
    
    // Apply damage
    defender.currentHp = Math.max(0, defender.currentHp! - finalDamage);
    
    // Determine animation type based on move power and critical
    let animationType: AnimationType;
    if (isCritical) {
      animationType = AnimationType.CRITICAL_HIT;
    } else if (movePower >= 100) {
      animationType = AnimationType.HEAVY_ATTACK;
    } else if (movePower >= 80) {
      animationType = AnimationType.SPECIAL_ATTACK;
    } else {
      animationType = AnimationType.NORMAL_ATTACK;
    }
    
    // Play animation
    await playBattleAnimation(animationType, {
      attacker: attacker.name,
      defender: defender.name,
      moveName: moveName,
      moveType: moveType,
      damage: finalDamage,
      effectiveness: effectiveness > 1 ? "super effective" : effectiveness < 1 ? "not very effective" : "normal"
    });
    
    // Generate commentary based on attack result
    let commentaryType: CommentaryType;
    
    if (isCritical) {
      commentaryType = CommentaryType.CRITICAL_HIT;
    } else if (effectiveness > 1) {
      commentaryType = CommentaryType.SUPER_EFFECTIVE;
    } else if (effectiveness < 1) {
      commentaryType = CommentaryType.NOT_EFFECTIVE;
    } else {
      commentaryType = CommentaryType.ATTACK;
    }
    
    const attackMessage = battleCommentary.comment(commentaryType, {
      attacker: attacker.name,
      defender: defender.name,
      move: moveName,
      damage: finalDamage
    });
    
    this.battleLog.push(attackMessage);
    
    // Check if defender is low on health (below 20%)
    if (defender.currentHp! > 0 && defender.currentHp! < defender.stats.hp * 0.2) {
      const lowHealthMessage = battleCommentary.comment(CommentaryType.LOW_HEALTH, {
        defender: defender.name,
        showToast: false // Don't show another toast for this
      });
      
      this.battleLog.push(lowHealthMessage);
    }
    
    // Check for fainted Pokemon
    if (defender.currentHp === 0) {
      await this.handleFaintedPokemon(defender);
    } else {
      await this.switchTurn();
    }
  }
  
  /**
   * Handle a Pokemon that has fainted
   */
  private async handleFaintedPokemon(faintedPokemon: BattlePokemon): Promise<void> {
    const isPlayerPokemon = faintedPokemon === this.activePlayerPokemon;
    const victor = isPlayerPokemon ? this.activeOpponentPokemon! : this.activePlayerPokemon!;
    const defeated = faintedPokemon;
    
    // Play victory animation
    await playBattleAnimation(AnimationType.VICTORY, {
      attacker: victor.name,
      defender: defeated.name,
      moveName: "Final Strike"
    });
    
    // Generate victory/defeat commentary
    const commentaryType = isPlayerPokemon ? CommentaryType.DEFEAT : CommentaryType.VICTORY;
    const battleResultMessage = battleCommentary.comment(commentaryType, {
      attacker: defeated.name,
      defender: victor.name
    });
    
    this.battleLog.push(battleResultMessage);
    
    // Remove fainted Pokemon from its team
    if (isPlayerPokemon) {
      this.playerTeam = this.playerTeam.filter(p => p !== faintedPokemon);
      
      // Check if player has more Pokemon
      if (this.playerTeam.length > 0) {
        toast.info("Choose another Pokemon to send out!", { duration: 4000 });
        // The switchPokemon method will be called by the player
      } else {
        // Player has lost the battle
        this.isBattleActive = false;
        toast.error("You have no more Pokemon! You lost the battle.", { duration: 5000 });
      }
    } else {
      this.opponentTeam = this.opponentTeam.filter(p => p !== faintedPokemon);
      
      // Check if opponent has more Pokemon
      if (this.opponentTeam.length > 0) {
        // Auto-select next opponent Pokemon
        const nextOpponentPokemon = this.opponentTeam[0];
        this.activeOpponentPokemon = nextOpponentPokemon;
        
        const switchMessage = battleCommentary.comment(CommentaryType.SWITCH, {
          attacker: "Opponent",
          switchedFrom: defeated.name,
          switchedTo: nextOpponentPokemon.name
        });
        
        this.battleLog.push(switchMessage);
        this.currentTurn = "player"; // Player gets to move after opponent switches
      } else {
        // Opponent has lost the battle
        this.isBattleActive = false;
        toast.success("You defeated all opponent Pokemon! You won the battle!", { duration: 5000 });
      }
    }
  }
  
  /**
   * Switch to a different Pokemon in player's team
   */
  public async switchPokemon(pokemonIndex: number): Promise<void> {
    if (!this.isBattleActive || pokemonIndex < 0 || pokemonIndex >= this.playerTeam.length) {
      toast.error("Cannot switch: Invalid Pokemon selection");
      return;
    }
    
    const newPokemon = this.playerTeam[pokemonIndex];
    
    // Check if this Pokemon is already active
    if (newPokemon === this.activePlayerPokemon) {
      toast.info(`${newPokemon.name} is already in battle!`);
      return;
    }
    
    const oldPokemon = this.activePlayerPokemon;
    this.activePlayerPokemon = newPokemon;
    
    const switchMessage = battleCommentary.comment(CommentaryType.SWITCH, {
      attacker: "You",
      switchedFrom: oldPokemon?.name || "Unknown",
      switchedTo: newPokemon.name
    });
    
    this.battleLog.push(switchMessage);
    
    // Opponent gets a free turn after player switches
    this.currentTurn = "opponent";
    await this.executeOpponentTurn();
  }
  
  /**
   * Fuse two or three Pokemon from player's team
   */
  public async fusePokemon(pokemonIndices: number[]): Promise<void> {
    if (!this.isBattleActive || pokemonIndices.length < 2 || pokemonIndices.length > 3) {
      toast.error("Fusion requires 2 or 3 Pokemon");
      return;
    }
    
    // Validate indices
    for (const index of pokemonIndices) {
      if (index < 0 || index >= this.playerTeam.length) {
        toast.error("Cannot fuse: Invalid Pokemon selection");
        return;
      }
    }
    
    // Get Pokemon to fuse
    const pokemonsToFuse = pokemonIndices.map(index => this.playerTeam[index]);
    
    try {
      // Create fusion
      const fusedPokemon = await this.fusionSystem.fusePokemonInBattle(pokemonsToFuse);
      
      // Remove fused Pokemon from team
      this.playerTeam = this.playerTeam.filter(p => !pokemonsToFuse.includes(p));
      
      // Add fused Pokemon to team and set as active
      this.playerTeam.push(fusedPokemon);
      this.activePlayerPokemon = fusedPokemon;
      
      // Generate fusion commentary
      const fusionMessage = battleCommentary.comment(CommentaryType.FUSION, {
        attacker: "You",
        fusedPokemon: fusedPokemon.name
      });
      
      this.battleLog.push(fusionMessage);
      
      // Opponent gets a turn after fusion
      this.currentTurn = "opponent";
      await this.executeOpponentTurn();
    } catch (error) {
      console.error("Fusion failed:", error);
      toast.error("Pokemon fusion failed. Please try again.");
    }
  }
  
  /**
   * Handle opponent's turn
   */
  private async executeOpponentTurn(): Promise<void> {
    if (!this.isBattleActive || this.currentTurn !== "opponent" || !this.activeOpponentPokemon) {
      return;
    }
    
    // Simple AI: Randomly choose a move
    const availableMoves = this.activeOpponentPokemon.moves;
    const randomMoveIndex = Math.floor(Math.random() * availableMoves.length);
    const selectedMove = availableMoves[randomMoveIndex];
    
    // Execute attack
    await this.executeAttack(selectedMove);
  }
  
  /**
   * Switch turns between player and opponent
   */
  private async switchTurn(): Promise<void> {
    if (!this.isBattleActive) {
      return;
    }
    
    this.currentTurn = this.currentTurn === "player" ? "opponent" : "player";
    
    // If it's opponent's turn, execute it automatically
    if (this.currentTurn === "opponent") {
      await this.executeOpponentTurn();
    } else {
      // Announce player's turn
      const turnMessage = battleCommentary.comment(CommentaryType.TURN_START, {
        attacker: this.activePlayerPokemon?.name || "Your Pokemon"
      });
      
      this.battleLog.push(turnMessage);
    }
  }
  
  /**
   * Get the base power for a move
   */
  private getMoveBasePower(moveName: string): number {
    // For most standard moves, return a value between 40-120
    if (moveName.includes("Scratch") || moveName.includes("Tackle")) {
      return 40;
    } else if (moveName.includes("Slam") || moveName.includes("Strike")) {
      return 80;
    } else if (moveName.includes("Blast") || moveName.includes("Beam")) {
      return 90;
    } else if (moveName.includes("Hyper") || moveName.includes("Fusion")) {
      return 120;
    }
    
    // For unknown moves, use a default power
    return 60;
  }
  
  /**
   * Get the type of a move based on name and Pokemon's primary type
   */
  private getMoveType(moveName: string, pokemonType: string): string {
    // Check if move name contains a type
    const typeKeywords: { [key: string]: string } = {
      "Fire": "fire",
      "Water": "water",
      "Grass": "grass",
      "Electric": "electric",
      "Psychic": "psychic",
      "Ice": "ice",
      "Dragon": "dragon",
      "Dark": "dark",
      "Fairy": "fairy",
      "Fighting": "fighting",
      "Flying": "flying",
      "Bug": "bug",
      "Poison": "poison",
      "Ground": "ground",
      "Rock": "rock",
      "Steel": "steel",
      "Ghost": "ghost",
      "Normal": "normal"
    };
    
    // Check if move name contains a type keyword
    for (const [keyword, type] of Object.entries(typeKeywords)) {
      if (moveName.includes(keyword)) {
        return type;
      }
    }
    
    // Default to Pokemon's primary type
    return pokemonType.toLowerCase();
  }
  
  /**
   * Calculate type effectiveness
   */
  private calculateTypeEffectiveness(moveType: string, defenderTypes: string[]): number {
    // Simplified type effectiveness chart
    const typeEffectiveness: { [key: string]: { [key: string]: number } } = {
      "normal": { "rock": 0.5, "ghost": 0, "steel": 0.5 },
      "fire": { "fire": 0.5, "water": 0.5, "grass": 2, "ice": 2, "bug": 2, "rock": 0.5, "dragon": 0.5, "steel": 2 },
      "water": { "fire": 2, "water": 0.5, "grass": 0.5, "ground": 2, "rock": 2, "dragon": 0.5 },
      "electric": { "water": 2, "electric": 0.5, "grass": 0.5, "ground": 0, "flying": 2, "dragon": 0.5 },
      "grass": { "fire": 0.5, "water": 2, "grass": 0.5, "poison": 0.5, "ground": 2, "flying": 0.5, "bug": 0.5, "rock": 2, "dragon": 0.5, "steel": 0.5 },
      "ice": { "fire": 0.5, "water": 0.5, "grass": 2, "ice": 0.5, "ground": 2, "flying": 2, "dragon": 2, "steel": 0.5 },
      "fighting": { "normal": 2, "ice": 2, "poison": 0.5, "flying": 0.5, "psychic": 0.5, "bug": 0.5, "rock": 2, "ghost": 0, "dark": 2, "steel": 2, "fairy": 0.5 },
      "poison": { "grass": 2, "poison": 0.5, "ground": 0.5, "rock": 0.5, "ghost": 0.5, "steel": 0, "fairy": 2 },
      "ground": { "fire": 2, "electric": 2, "grass": 0.5, "poison": 2, "flying": 0, "bug": 0.5, "rock": 2, "steel": 2 },
      "flying": { "electric": 0.5, "grass": 2, "fighting": 2, "bug": 2, "rock": 0.5, "steel": 0.5 },
      "psychic": { "fighting": 2, "poison": 2, "psychic": 0.5, "dark": 0, "steel": 0.5 },
      "bug": { "fire": 0.5, "grass": 2, "fighting": 0.5, "poison": 0.5, "flying": 0.5, "psychic": 2, "ghost": 0.5, "dark": 2, "steel": 0.5, "fairy": 0.5 },
      "rock": { "fire": 2, "ice": 2, "fighting": 0.5, "ground": 0.5, "flying": 2, "bug": 2, "steel": 0.5 },
      "ghost": { "normal": 0, "psychic": 2, "ghost": 2, "dark": 0.5 },
      "dragon": { "dragon": 2, "steel": 0.5, "fairy": 0 },
      "dark": { "fighting": 0.5, "psychic": 2, "ghost": 2, "dark": 0.5, "fairy": 0.5 },
      "steel": { "fire": 0.5, "water": 0.5, "electric": 0.5, "ice": 2, "rock": 2, "steel": 0.5, "fairy": 2 },
      "fairy": { "fire": 0.5, "fighting": 2, "poison": 0.5, "dragon": 2, "dark": 2, "steel": 0.5 }
    };
    
    let effectiveness = 1.0;
    
    // Calculate effectiveness against each defender type
    defenderTypes.forEach(defenderType => {
      const typeEffects = typeEffectiveness[moveType.toLowerCase()];
      if (typeEffects && typeEffects[defenderType.toLowerCase()]) {
        effectiveness *= typeEffects[defenderType.toLowerCase()];
      }
    });
    
    return effectiveness;
  }
  
  /**
   * Getters for battle state
   */
  public getBattleState() {
    return {
      isActive: this.isBattleActive,
      currentTurn: this.currentTurn,
      playerTeam: this.playerTeam,
      opponentTeam: this.opponentTeam,
      activePlayerPokemon: this.activePlayerPokemon,
      activeOpponentPokemon: this.activeOpponentPokemon,
      battleLog: this.battleLog
    };
  }
}
