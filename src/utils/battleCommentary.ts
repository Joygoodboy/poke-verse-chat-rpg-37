
import { toast } from "sonner";

// Message types for different battle scenarios
export enum CommentaryType {
  BATTLE_START,
  TURN_START,
  ATTACK,
  SUPER_EFFECTIVE,
  NOT_EFFECTIVE,
  CRITICAL_HIT,
  MISS,
  SWITCH,
  FUSION,
  LOW_HEALTH,
  VICTORY,
  DEFEAT
}

// Options for customizing commentary
export interface CommentaryOptions {
  attacker?: string;
  defender?: string;
  move?: string;
  damage?: number;
  effectiveness?: string;
  fusedPokemon?: string;
  switchedFrom?: string;
  switchedTo?: string;
  [key: string]: any;
}

// Main commentary class
export class BattleCommentary {
  private messages: Map<CommentaryType, string[]>;
  
  constructor() {
    this.messages = this.initializeMessages();
  }
  
  /**
   * Deliver commentary message based on battle event
   */
  public comment(type: CommentaryType, options: CommentaryOptions = {}): string {
    // Get relevant messages for this commentary type
    const messagesForType = this.messages.get(type) || [];
    
    if (messagesForType.length === 0) {
      return "The battle continues...";
    }
    
    // Select a random message from the available options
    const messageTemplate = messagesForType[Math.floor(Math.random() * messagesForType.length)];
    
    // Replace template variables with actual values
    let finalMessage = this.formatMessage(messageTemplate, options);
    
    // Show as toast unless specifically requested not to
    if (options.showToast !== false) {
      this.showCommentaryToast(finalMessage, type);
    }
    
    return finalMessage;
  }
  
  /**
   * Format message template with provided options
   */
  private formatMessage(template: string, options: CommentaryOptions): string {
    return template.replace(/{(\w+)}/g, (match, key) => {
      return options[key] !== undefined ? options[key] : match;
    });
  }
  
  /**
   * Show commentary message as toast
   */
  private showCommentaryToast(message: string, type: CommentaryType): void {
    let duration = 3000;
    let position: "top-right" | "top-center" | "bottom-center" = "top-center";
    
    switch (type) {
      case CommentaryType.BATTLE_START:
      case CommentaryType.VICTORY:
      case CommentaryType.DEFEAT:
        duration = 5000;
        position = "top-center";
        toast.info(message, { duration, position });
        break;
        
      case CommentaryType.CRITICAL_HIT:
      case CommentaryType.SUPER_EFFECTIVE:
        toast.success(message, { duration, position: "top-right" });
        break;
        
      case CommentaryType.MISS:
      case CommentaryType.NOT_EFFECTIVE:
      case CommentaryType.LOW_HEALTH:
        toast.warning(message, { duration, position: "top-right" });
        break;
        
      case CommentaryType.FUSION:
        toast.info(message, { duration: 4000, position: "bottom-center" });
        break;
        
      default:
        toast(message, { duration, position: "top-right" });
    }
  }
  
  /**
   * Initialize all possible commentary messages
   */
  private initializeMessages(): Map<CommentaryType, string[]> {
    const messages = new Map<CommentaryType, string[]>();
    
    // Battle start messages
    messages.set(CommentaryType.BATTLE_START, [
      "A wild {defender} appears! {attacker} is ready for battle!",
      "The battle between {attacker} and {defender} is about to begin!",
      "{attacker} faces off against {defender}. Let the battle commence!",
      "The arena is set for an epic showdown between {attacker} and {defender}!"
    ]);
    
    // Turn start messages
    messages.set(CommentaryType.TURN_START, [
      "What will {attacker} do next?",
      "{attacker} prepares for the next move!",
      "The tension builds as {attacker} plans their strategy!",
      "It's {attacker}'s turn to make a move!"
    ]);
    
    // Attack messages
    messages.set(CommentaryType.ATTACK, [
      "{attacker} uses {move} against {defender}!",
      "{attacker} launches {move}!",
      "{move} strikes {defender} for {damage} damage!",
      "{attacker} executes {move} with precision!"
    ]);
    
    // Super effective messages
    messages.set(CommentaryType.SUPER_EFFECTIVE, [
      "It's super effective! {defender} takes {damage} damage!",
      "{move} is super effective against {defender}!",
      "A devastating hit! {move} is extremely effective!",
      "{attacker}'s {move} exploits {defender}'s weakness perfectly!"
    ]);
    
    // Not effective messages
    messages.set(CommentaryType.NOT_EFFECTIVE, [
      "It's not very effective... {defender} only takes {damage} damage.",
      "{move} doesn't seem to do much against {defender}.",
      "{defender} resists {attacker}'s {move}!",
      "{attacker}'s {move} has little effect on {defender}."
    ]);
    
    // Critical hit messages
    messages.set(CommentaryType.CRITICAL_HIT, [
      "A critical hit! {defender} takes {damage} damage!",
      "{attacker} lands a critical hit with {move}!",
      "Critical strike! {move} hits a vulnerable spot for {damage} damage!",
      "An extraordinary blow! {attacker}'s {move} critically strikes {defender}!"
    ]);
    
    // Miss messages
    messages.set(CommentaryType.MISS, [
      "{attacker}'s {move} misses!",
      "{defender} evades {attacker}'s {move}!",
      "{attacker} attempts {move}, but {defender} dodges!",
      "The attack fails! {attacker}'s {move} doesn't connect!"
    ]);
    
    // Switch messages
    messages.set(CommentaryType.SWITCH, [
      "{attacker} withdraws {switchedFrom} and sends out {switchedTo}!",
      "{attacker} switches from {switchedFrom} to {switchedTo}!",
      "{switchedFrom} returns to {attacker}. Go, {switchedTo}!",
      "{attacker} calls back {switchedFrom} and chooses {switchedTo}!"
    ]);
    
    // Fusion messages
    messages.set(CommentaryType.FUSION, [
      "The Pokemon are fusing! {fusedPokemon} is born!",
      "An incredible transformation! {attacker}'s Pokemon have fused into {fusedPokemon}!",
      "The fusion is complete! {fusedPokemon} enters the battle!",
      "The power of multiple Pokemon joins together to create {fusedPokemon}!"
    ]);
    
    // Low health messages
    messages.set(CommentaryType.LOW_HEALTH, [
      "{defender} is looking weak! It's in the red zone!",
      "{defender} is barely standing! One more hit might finish it!",
      "{defender} is holding on by a thread!",
      "{defender} is in critical condition after that attack!"
    ]);
    
    // Victory messages
    messages.set(CommentaryType.VICTORY, [
      "{attacker} defeats {defender}! Victory is yours!",
      "{defender} faints! {attacker} wins the battle!",
      "The battle is over! {attacker} emerges victorious over {defender}!",
      "An impressive performance by {attacker}! {defender} has been defeated!"
    ]);
    
    // Defeat messages
    messages.set(CommentaryType.DEFEAT, [
      "{attacker} has fainted! {defender} wins this round.",
      "Your {attacker} has been defeated by {defender}!",
      "{defender} proves too strong for {attacker} this time.",
      "The battle ends with {attacker}'s defeat. {defender} stands triumphant!"
    ]);
    
    return messages;
  }
}

// Create singleton instance
export const battleCommentary = new BattleFeedbackSingleton();

// Singleton implementation for global access
class BattleFeedbackSingleton {
  private commentary: BattleCommentary;
  
  constructor() {
    this.commentary = new BattleCommentary();
  }
  
  public comment(type: CommentaryType, options: CommentaryOptions = {}): string {
    return this.commentary.comment(type, options);
  }
}
