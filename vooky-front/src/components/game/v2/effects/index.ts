// Game Effects Components
export { default as ParticleExplosion } from './ParticleExplosion.vue';
export { default as FloatingText } from './FloatingText.vue';
export { default as RippleEffect } from './RippleEffect.vue';
export { default as ScreenFlash } from './ScreenFlash.vue';
export { default as Confetti } from './Confetti.vue';
export { default as EffectsManager } from './EffectsManager.vue';

// Re-export types if needed
export type EffectType = 'success' | 'error' | 'info' | 'combo' | 'score';
export type FlashType = 'success' | 'error' | 'white' | 'gold';
export type RippleVariant = 'success' | 'error' | 'neutral' | 'combo';
export type TextSize = 'small' | 'medium' | 'large';
