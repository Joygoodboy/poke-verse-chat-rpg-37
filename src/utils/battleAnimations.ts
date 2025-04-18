
import { toast } from "sonner";

// Animation types
export enum AnimationType {
  NORMAL_ATTACK = "normal",
  HEAVY_ATTACK = "heavy",
  SPECIAL_ATTACK = "special",
  CRITICAL_HIT = "critical",
  VICTORY = "victory",
  FUSION = "fusion",
}

// Interface for animation options
export interface AnimationOptions {
  attacker: string;
  defender?: string;
  moveName: string;
  moveType?: string;
  damage?: number;
  effectiveness?: string;
}

// CSS animation classes
const ANIMATION_CLASSES = {
  [AnimationType.NORMAL_ATTACK]: "battle-animation-normal",
  [AnimationType.HEAVY_ATTACK]: "battle-animation-heavy",
  [AnimationType.SPECIAL_ATTACK]: "battle-animation-special",
  [AnimationType.CRITICAL_HIT]: "battle-animation-critical",
  [AnimationType.VICTORY]: "battle-animation-victory",
  [AnimationType.FUSION]: "battle-animation-fusion",
};

/**
 * Creates a visual battle animation for attacks
 */
export function playBattleAnimation(type: AnimationType, options: AnimationOptions): Promise<void> {
  return new Promise((resolve) => {
    // Create animation overlay
    const overlay = document.createElement("div");
    overlay.className = `battle-animation-overlay ${ANIMATION_CLASSES[type]}`;
    
    // Create animation content based on type
    let content = "";
    let duration = 2000; // Default duration
    
    switch (type) {
      case AnimationType.HEAVY_ATTACK:
      case AnimationType.SPECIAL_ATTACK:
        content = createAttackAnimation(options, type);
        duration = 3000;
        break;
      case AnimationType.CRITICAL_HIT:
        content = createCriticalHitAnimation(options);
        duration = 3200;
        break;
      case AnimationType.VICTORY:
        content = createVictoryAnimation(options);
        duration = 4000;
        break;
      case AnimationType.FUSION:
        content = createFusionAnimation(options);
        duration = 5000;
        break;
      default:
        content = createSimpleAttackAnimation(options);
        break;
    }
    
    overlay.innerHTML = content;
    document.body.appendChild(overlay);
    
    // Announce the move with toast
    announceMove(type, options);
    
    // Remove overlay after animation completes
    setTimeout(() => {
      overlay.classList.add("battle-animation-fade");
      setTimeout(() => {
        document.body.removeChild(overlay);
        resolve();
      }, 500);
    }, duration);
  });
}

// Helper functions for creating animation content
function createSimpleAttackAnimation(options: AnimationOptions): string {
  return `
    <div class="battle-animation-wrapper">
      <div class="battle-animation-attacker">${options.attacker}</div>
      <div class="battle-animation-move">${options.moveName}</div>
      <div class="battle-animation-defender">${options.defender}</div>
    </div>
  `;
}

function createAttackAnimation(options: AnimationOptions, type: AnimationType): string {
  const isSpecial = type === AnimationType.SPECIAL_ATTACK;
  const effectivenessClass = options.effectiveness === "super effective" 
    ? "battle-super-effective" 
    : options.effectiveness === "not very effective" 
      ? "battle-not-effective" 
      : "";

  return `
    <div class="battle-animation-wrapper ${isSpecial ? 'special-attack-bg' : 'heavy-attack-bg'}">
      <div class="battle-animation-cutscene">
        <div class="battle-animation-attacker attacking">${options.attacker}</div>
        <div class="battle-animation-move-special">
          <div class="move-name">${options.moveName}!</div>
          <div class="move-effect ${isSpecial ? 'special-effect' : 'heavy-effect'}"></div>
        </div>
        <div class="battle-animation-defender receiving-hit ${effectivenessClass}">${options.defender}</div>
        ${options.damage ? `<div class="damage-indicator">-${options.damage} HP</div>` : ''}
      </div>
    </div>
  `;
}

function createCriticalHitAnimation(options: AnimationOptions): string {
  return `
    <div class="battle-animation-wrapper critical-hit-bg">
      <div class="battle-animation-cutscene">
        <div class="critical-flash"></div>
        <div class="battle-animation-attacker critical-attacker">${options.attacker}</div>
        <div class="battle-animation-move-critical">
          <div class="move-name">${options.moveName}!</div>
          <div class="critical-text">CRITICAL HIT!</div>
        </div>
        <div class="battle-animation-defender critical-hit">${options.defender}</div>
        ${options.damage ? `<div class="critical-damage">-${options.damage} HP!</div>` : ''}
      </div>
    </div>
  `;
}

function createVictoryAnimation(options: AnimationOptions): string {
  return `
    <div class="battle-animation-wrapper victory-bg">
      <div class="battle-animation-cutscene">
        <div class="victory-flash"></div>
        <div class="battle-animation-attacker victory-pose">${options.attacker}</div>
        <div class="battle-animation-defender fainted">${options.defender}</div>
        <div class="victory-text">
          <div class="victory-move">${options.moveName}!</div>
          <div class="victory-announcement">${options.defender} fainted!</div>
          <div class="victory-winner">${options.attacker} wins the battle!</div>
        </div>
      </div>
    </div>
  `;
}

function createFusionAnimation(options: AnimationOptions): string {
  return `
    <div class="battle-animation-wrapper fusion-bg">
      <div class="battle-animation-cutscene">
        <div class="fusion-glow"></div>
        <div class="fusion-pokemon left">${options.attacker}</div>
        <div class="fusion-pokemon right">${options.defender}</div>
        <div class="fusion-energy"></div>
        <div class="fusion-result">
          <div class="fusion-name">${options.moveName}</div>
          <div class="fusion-tagline">A new pokemon is born!</div>
        </div>
      </div>
    </div>
  `;
}

// Toast notifications for move announcements
function announceMove(type: AnimationType, options: AnimationOptions): void {
  let message = "";
  let duration = 4000;

  switch (type) {
    case AnimationType.HEAVY_ATTACK:
      message = `${options.attacker} unleashes a powerful ${options.moveName}!`;
      break;
    case AnimationType.SPECIAL_ATTACK:
      message = `${options.attacker} uses the special move ${options.moveName}!`;
      break;
    case AnimationType.CRITICAL_HIT:
      message = `Critical hit! ${options.attacker}'s ${options.moveName} strikes a weak point!`;
      break;
    case AnimationType.VICTORY:
      message = `${options.attacker} defeats ${options.defender} with ${options.moveName}!`;
      duration = 5000;
      break;
    case AnimationType.FUSION:
      message = `A new Pokemon is being formed through fusion!`;
      duration = 5000;
      break;
    default:
      message = `${options.attacker} uses ${options.moveName} on ${options.defender}!`;
  }

  toast.info(message, {
    duration: duration,
    position: "top-center",
    className: `battle-toast ${type}-toast`,
  });
}
