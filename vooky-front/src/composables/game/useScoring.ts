/**
 * useScoring - Sistema avanzado de puntuación con combos y multiplicadores
 * 
 * Características:
 * - Puntos base por respuesta correcta
 * - Sistema de combos (x2, x3, x4, x5+)
 * - Multiplicadores de velocidad
 * - Bonificaciones especiales
 */

import { ref, computed } from 'vue';

export interface ScoringResult {
  points: number;
  basePoints: number;
  timeMultiplier: number;
  comboMultiplier: number;
  comboLevel: number;
  bonuses: string[];
}

export function useScoring() {
  // Estado de puntuación
  const score = ref(0);
  const correctAnswers = ref(0);
  const incorrectAnswers = ref(0);
  const currentCombo = ref(0);
  const maxCombo = ref(0);
  const totalQuestions = ref(0);
  const consecutiveErrors = ref(0); // NUEVO: Contador de errores consecutivos
  
  // Control de tiempo
  const questionStartTime = ref(0);
  
  // Historial para bonificaciones
  const perfectStreak = ref(true); // Si nunca ha fallado
  const speedAnswers = ref(0); // Respuestas rápidas consecutivas
  
  // Multiplicador de combo calculado
  const comboMultiplier = computed(() => {
    if (currentCombo.value >= 5) return 3.0;
    if (currentCombo.value >= 4) return 2.5;
    if (currentCombo.value >= 3) return 2.0;
    if (currentCombo.value >= 2) return 1.5;
    return 1.0;
  });
  
  // Accuracy (precisión)
  const accuracy = computed(() => {
    const total = correctAnswers.value + incorrectAnswers.value;
    return total > 0 ? (correctAnswers.value / total) * 100 : 0;
  });
  
  /**
   * Inicia el temporizador para la pregunta actual
   */
  function startQuestionTimer() {
    questionStartTime.value = Date.now();
  }
  
  /**
   * Calcula el multiplicador de tiempo basado en velocidad de respuesta
   */
  function calculateTimeBonus(): { multiplier: number; label: string } {
    const elapsed = (Date.now() - questionStartTime.value) / 1000;
    
    if (elapsed < 1.5) {
      speedAnswers.value++;
      return { multiplier: 2.0, label: '⚡ MUY RÁPIDO' };
    }
    if (elapsed < 3) {
      speedAnswers.value++;
      return { multiplier: 1.5, label: '✨ RÁPIDO' };
    }
    if (elapsed < 5) {
      speedAnswers.value = 0;
      return { multiplier: 1.0, label: 'NORMAL' };
    }
    
    speedAnswers.value = 0;
    return { multiplier: 0.8, label: 'LENTO' };
  }
  
  /**
   * Calcula y agrega puntos por respuesta correcta
   */
  function addCorrect(): ScoringResult {
    correctAnswers.value++;
    currentCombo.value++;
    totalQuestions.value++;
    consecutiveErrors.value = 0; // Resetear errores consecutivos al acertar
    
    // Actualizar combo máximo
    if (currentCombo.value > maxCombo.value) {
      maxCombo.value = currentCombo.value;
    }
    
    // Calcular puntos
    const basePoints = 100;
    const timeBonus = calculateTimeBonus();
    const comboMult = comboMultiplier.value;
    
    // Bonificaciones especiales
    const bonuses: string[] = [];
    let bonusMultiplier = 1.0;
    
    // Bonus por primera vez perfecta
    if (correctAnswers.value === 1) {
      bonuses.push('🎯 FIRST BLOOD');
      bonusMultiplier += 0.25;
    }
    
    // Bonus por combo alto
    if (currentCombo.value === 5) {
      bonuses.push('🔥 COMBO x5!');
      bonusMultiplier += 0.5;
    } else if (currentCombo.value === 10) {
      bonuses.push('💥 MEGA COMBO x10!');
      bonusMultiplier += 1.0;
    }
    
    // Bonus por racha rápida
    if (speedAnswers.value >= 3) {
      bonuses.push('⚡ SPEED DEMON');
      bonusMultiplier += 0.3;
    }
    
    // Calcular puntos finales
    const points = Math.floor(
      basePoints * timeBonus.multiplier * comboMult * bonusMultiplier
    );
    
    score.value += points;
    
    return {
      points,
      basePoints,
      timeMultiplier: timeBonus.multiplier,
      comboMultiplier: comboMult,
      comboLevel: currentCombo.value,
      bonuses
    };
  }
  
  /**
   * Registra respuesta incorrecta
   */
  function addIncorrect() {
    incorrectAnswers.value++;
    totalQuestions.value++;
    currentCombo.value = 0; // Reset combo
    speedAnswers.value = 0; // Reset speed streak
    perfectStreak.value = false;
    consecutiveErrors.value++; // Incrementar errores consecutivos
  }
  
  /**
   * Calcula bonificaciones finales al terminar el juego
   */
  function calculateFinalBonuses(): { bonus: number; achievements: string[] } {
    let bonus = 0;
    const achievements: string[] = [];
    
    // Perfect Run - Sin errores
    if (perfectStreak.value && totalQuestions.value > 0) {
      bonus += 1000;
      achievements.push('🏆 PERFECT RUN');
    }
    
    // Speed Master - Promedio < 2 segundos
    if (speedAnswers.value >= totalQuestions.value * 0.7) {
      bonus += 500;
      achievements.push('⚡ SPEED MASTER');
    }
    
    // Combo King - Combo máximo >= 5
    if (maxCombo.value >= 5) {
      bonus += 300;
      achievements.push('🔥 COMBO KING');
    }
    
    // High Accuracy - > 90% de aciertos
    if (accuracy.value >= 90) {
      bonus += 200;
      achievements.push('🎯 SHARPSHOOTER');
    }
    
    score.value += bonus;
    
    return { bonus, achievements };
  }
  
  /**
   * Resetea todos los valores
   */
  function reset() {
    score.value = 0;
    correctAnswers.value = 0;
    incorrectAnswers.value = 0;
    currentCombo.value = 0;
    maxCombo.value = 0;
    totalQuestions.value = 0;
    questionStartTime.value = 0;
    perfectStreak.value = true;
    speedAnswers.value = 0;
    consecutiveErrors.value = 0; // Resetear errores consecutivos
  }
  
  return {
    // State
    score,
    correctAnswers,
    incorrectAnswers,
    currentCombo,
    maxCombo,
    comboMultiplier,
    accuracy,
    perfectStreak,
    consecutiveErrors, // NUEVO: Exportar errores consecutivos
    
    // Methods
    startQuestionTimer,
    calculateTimeBonus,
    addCorrect,
    addIncorrect,
    calculateFinalBonuses,
    reset
  };
}
