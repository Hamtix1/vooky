/**
 * useGameEffects - Sistema de efectos visuales con GSAP
 * 
 * Características:
 * - Animaciones de respuestas correctas/incorrectas
 * - Screen shake
 * - Floating text (números de puntos)
 * - Combo explosions
 * - Flash effects
 * - Animated score counters
 */

import { gsap } from 'gsap';
import confetti from 'canvas-confetti';

export function useGameEffects() {
  
  /**
   * Animación de respuesta correcta
   * Scale up con bounce
   */
  function playCorrectAnimation(element: HTMLElement) {
    const tl = gsap.timeline();
    
    return tl
      // Pulse inicial
      .to(element, {
        scale: 1.15,
        duration: 0.2,
        ease: 'back.out(3)',
        boxShadow: '0 0 30px 10px rgba(76, 217, 100, 0.8)'
      })
      // Bounce back
      .to(element, {
        scale: 1,
        duration: 0.4,
        ease: 'elastic.out(1, 0.4)',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
      })
      // Glow effect
      .to(element, {
        boxShadow: '0 0 20px 5px rgba(76, 217, 100, 0.6)',
        duration: 0.3,
        yoyo: true,
        repeat: 1
      }, '-=0.2');
  }
  
  /**
   * Animación de respuesta incorrecta
   * Shake horizontal + fade
   */
  function playIncorrectAnimation(element: HTMLElement) {
    return gsap.timeline()
      // Shake agresivo
      .to(element, {
        x: -15,
        duration: 0.08
      })
      .to(element, {
        x: 15,
        duration: 0.08
      })
      .to(element, {
        x: -10,
        duration: 0.08
      })
      .to(element, {
        x: 10,
        duration: 0.08
      })
      .to(element, {
        x: 0,
        duration: 0.08
      })
      // Desaturar
      .to(element, {
        filter: 'grayscale(50%) brightness(0.7)',
        opacity: 0.5,
        duration: 0.3
      }, '-=0.2');
  }
  
  /**
   * Screen shake effect
   * Sacude todo el contenedor del juego
   */
  function screenShake(intensity = 10, duration = 0.4) {
    const container = document.querySelector('.game-container, .matching-game-v2, .lesson-game') as HTMLElement;
    if (!container) return Promise.resolve();
    
    const repeats = Math.floor(duration / 0.05);
    
    return gsap.timeline()
      .to(container, {
        x: intensity,
        y: intensity * 0.5,
        duration: 0.05,
        yoyo: true,
        repeat: repeats,
        ease: 'power1.inOut'
      })
      .to(container, {
        x: 0,
        y: 0,
        duration: 0.05
      });
  }
  
  /**
   * Muestra números flotantes de puntos ganados
   */
  function showFloatingPoints(x: number, y: number, points: number, color = '#FFD700') {
    const floatingText = document.createElement('div');
    floatingText.className = 'floating-points';
    floatingText.textContent = `+${points}`;
    
    // Estilos inline
    Object.assign(floatingText.style, {
      position: 'fixed',
      left: `${x}px`,
      top: `${y}px`,
      fontSize: '2.5rem',
      fontWeight: '900',
      color: color,
      textShadow: '0 0 20px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 215, 0, 0.4)',
      pointerEvents: 'none',
      zIndex: '9999',
      fontFamily: 'Arial Black, sans-serif',
      userSelect: 'none'
    });
    
    document.body.appendChild(floatingText);
    
    // Animación de subida y desvanecimiento
    gsap.timeline()
      .fromTo(floatingText, 
        { 
          opacity: 0,
          scale: 0.5,
          y: 0
        },
        {
          opacity: 1,
          scale: 1.2,
          y: -50,
          duration: 0.4,
          ease: 'back.out(2)'
        }
      )
      .to(floatingText, {
        y: -120,
        opacity: 0,
        scale: 0.8,
        duration: 0.5,
        ease: 'power2.in',
        onComplete: () => {
          document.body.removeChild(floatingText);
        }
      });
  }
  
  /**
   * Explosión de confetti para combos
   */
  function playComboExplosion(comboLevel: number) {
    const particleCount = 50 + (comboLevel * 25);
    const spread = 60 + (comboLevel * 15);
    const scalar = 1 + (comboLevel * 0.15);
    
    // Colores según nivel de combo
    const colorSets = [
      ['#FFD700', '#FFA500'], // x2 - Dorado
      ['#FF6B6B', '#FF8E53'], // x3 - Rojo/Naranja
      ['#4ECDC4', '#45B7D1'], // x4 - Cyan
      ['#9D50BB', '#6E48AA', '#FF6B6B'] // x5+ - Morado/Rosa
    ];
    
    const colorIndex = Math.min(comboLevel - 2, colorSets.length - 1);
    const colors = colorSets[colorIndex] || colorSets[0];
    
    confetti({
      particleCount,
      spread,
      origin: { y: 0.6 },
      colors,
      scalar,
      gravity: 1.2,
      drift: 0,
      ticks: 200
    });
    
    // Si es combo x5 o mayor, explosión doble
    if (comboLevel >= 5) {
      setTimeout(() => {
        confetti({
          particleCount: particleCount * 0.7,
          spread: spread + 20,
          origin: { x: 0.3, y: 0.5 },
          colors,
          scalar: scalar * 1.2
        });
      }, 150);
      
      setTimeout(() => {
        confetti({
          particleCount: particleCount * 0.7,
          spread: spread + 20,
          origin: { x: 0.7, y: 0.5 },
          colors,
          scalar: scalar * 1.2
        });
      }, 300);
    }
  }
  
  /**
   * Flash de pantalla
   */
  function flashScreen(color = 'rgba(255, 255, 255, 0.4)', duration = 0.3) {
    const flash = document.createElement('div');
    
    Object.assign(flash.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      backgroundColor: color,
      pointerEvents: 'none',
      zIndex: '9998',
      opacity: '0'
    });
    
    document.body.appendChild(flash);
    
    gsap.timeline()
      .to(flash, {
        opacity: 1,
        duration: duration * 0.3
      })
      .to(flash, {
        opacity: 0,
        duration: duration * 0.7,
        onComplete: () => {
          document.body.removeChild(flash);
        }
      });
  }
  
  /**
   * Anima el contador de puntos (rolling numbers)
   */
  function animateScore(element: HTMLElement, from: number, to: number, duration = 0.8) {
    const obj = { value: from };
    
    return gsap.to(obj, {
      value: to,
      duration,
      ease: 'power2.out',
      onUpdate: function() {
        element.textContent = Math.round(obj.value).toLocaleString();
      }
    });
  }
  
  /**
   * Animación de pulso continuo (para elementos que necesitan atención)
   */
  function createPulseAnimation(element: HTMLElement, scale = 1.1) {
    return gsap.to(element, {
      scale: scale,
      duration: 0.8,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut'
    });
  }
  
  /**
   * Animación de entrada de pregunta
   */
  function questionEnterAnimation(element: HTMLElement) {
    return gsap.timeline()
      // Preparar estado inicial
      .fromTo(element,
        {
          opacity: 0,
          y: 50,
          scale: 0.9
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          ease: 'back.out(1.5)'
        }
      );
  }
  
  /**
   * Animación de salida de pregunta
   */
  function questionExitAnimation(element: HTMLElement) {
    return gsap.timeline()
      .to(element, {
        opacity: 0,
        y: -50,
        scale: 0.9,
        duration: 0.3,
        ease: 'power2.in'
      });
  }
  
  /**
   * Ondas expansivas (para combos especiales)
   */
  function createRippleWave(x: number, y: number, color = 'rgba(255, 215, 0, 0.6)') {
    const ripple = document.createElement('div');
    
    Object.assign(ripple.style, {
      position: 'fixed',
      left: `${x}px`,
      top: `${y}px`,
      width: '50px',
      height: '50px',
      borderRadius: '50%',
      border: `3px solid ${color}`,
      transform: 'translate(-50%, -50%)',
      pointerEvents: 'none',
      zIndex: '9997'
    });
    
    document.body.appendChild(ripple);
    
    gsap.timeline()
      .to(ripple, {
        width: '400px',
        height: '400px',
        opacity: 0,
        duration: 1,
        ease: 'power2.out',
        onComplete: () => {
          document.body.removeChild(ripple);
        }
      });
  }
  
  /**
   * Efecto de vignette (oscurecimiento de bordes)
   */
  function showVignette(color = 'rgba(0, 0, 0, 0.5)', duration = 0.5) {
    const vignette = document.createElement('div');
    
    Object.assign(vignette.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      background: `radial-gradient(circle at center, transparent 30%, ${color} 100%)`,
      pointerEvents: 'none',
      zIndex: '9996',
      opacity: '0'
    });
    
    document.body.appendChild(vignette);
    
    gsap.timeline()
      .to(vignette, {
        opacity: 1,
        duration: duration * 0.4
      })
      .to(vignette, {
        opacity: 0,
        duration: duration * 0.6,
        delay: duration * 0.3,
        onComplete: () => {
          document.body.removeChild(vignette);
        }
      });
  }
  
  return {
    // Animaciones de respuesta
    playCorrectAnimation,
    playIncorrectAnimation,
    
    // Efectos de pantalla
    screenShake,
    flashScreen,
    showVignette,
    
    // Efectos de puntos
    showFloatingPoints,
    animateScore,
    
    // Efectos de combo
    playComboExplosion,
    createRippleWave,
    
    // Animaciones de transición
    questionEnterAnimation,
    questionExitAnimation,
    
    // Utilidades
    createPulseAnimation
  };
}
