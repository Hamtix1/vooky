/**
 * useGameAudio - Sistema de audio con Howler.js
 * 
 * Características:
 * - Reproducción de audio de preguntas
 * - Efectos de sonido por eventos
 * - Música de fondo adaptativa
 * - Sistema de volumen y mute
 */

import { Howl, Howler } from 'howler';
import { ref } from 'vue';

export function useGameAudio() {
  const isPlaying = ref(false);
  const currentSound = ref<Howl | null>(null);
  const bgMusic = ref<Howl | null>(null);
  const isMuted = ref(false);
  const isInitialized = ref(false);
  
  // Inicializar Howler después de la primera interacción del usuario
  function initializeAudio() {
    if (!isInitialized.value) {
      isInitialized.value = true;
      // Desbloquear audio en navegadores
      Howler.autoUnlock = true;
      console.log('🔊 Audio system initialized');
    }
  }
  
  // Precarga de sonidos comunes
  const sounds = {
    correct: new Howl({
      src: ['/sounds/correct.mp3'],
      volume: 0.5,
      preload: true,
      onloaderror: (id, error) => console.warn('Error loading correct.mp3:', error)
    }),
    incorrect: new Howl({
      src: ['/sounds/incorrect.mp3'],
      volume: 0.4,
      preload: true,
      onloaderror: (id, error) => console.warn('Error loading incorrect.mp3:', error)
    }),
    combo2: new Howl({
      src: ['/sounds/combo-2.mp3'],
      volume: 0.6,
      preload: true,
      onloaderror: (id, error) => console.warn('Error loading combo-2.mp3:', error)
    }),
    combo3: new Howl({
      src: ['/sounds/combo-3.mp3'],
      volume: 0.7,
      preload: true,
      onloaderror: (id, error) => console.warn('Error loading combo-3.mp3:', error)
    }),
    combo5: new Howl({
      src: ['/sounds/combo-5.mp3'],
      volume: 0.8,
      preload: true,
      onloaderror: (id, error) => console.warn('Error loading combo-5.mp3:', error)
    }),
    powerup: new Howl({
      src: ['/sounds/powerup.mp3'],
      volume: 0.5,
      preload: true,
      onloaderror: (id, error) => console.warn('Error loading powerup.mp3:', error)
    }),
    uiClick: new Howl({
      src: ['/sounds/ui-click.mp3'],
      volume: 0.3,
      preload: true,
      onloaderror: (id, error) => console.warn('Error loading ui-click.mp3:', error)
    })
  };
  
  /**
   * Reproduce el audio de la pregunta
   */
  function playQuestionAudio(url: string) {
    initializeAudio(); // Asegurar que el audio esté inicializado
    
    if (currentSound.value) {
      currentSound.value.stop();
    }
    
    currentSound.value = new Howl({
      src: [url],
      volume: 0.7,
      onplay: () => { 
        isPlaying.value = true; 
      },
      onend: () => { 
        isPlaying.value = false; 
      },
      onplayerror: () => {
        console.warn('Error playing question audio');
        isPlaying.value = false;
      }
    });
    
    currentSound.value.play();
  }
  
  /**
   * Reproduce sonido de respuesta correcta
   * Varía según el nivel de combo
   * @param comboLevel - Nivel actual del combo (1 = primer acierto, 2 = segundo, etc.)
   */
  function playCorrectSound(comboLevel = 0) {
    initializeAudio(); // Inicializar audio
    try {
      // Cada sonido de combo suena SOLO en su nivel específico
      
      if (comboLevel === 5) {
        sounds.combo5.play();
        console.log(`🔊 Playing COMBO-5 sound (combo level: ${comboLevel})`);
      } else if (comboLevel === 3) {
        sounds.combo3.play();
        console.log(`🔊 Playing COMBO-3 sound (combo level: ${comboLevel})`);
      } else if (comboLevel === 2) {
        sounds.combo2.play();
        console.log(`🔊 Playing COMBO-2 sound (combo level: ${comboLevel})`);
      } else {
        // comboLevel = 0, 1, 4, 6, 7, 8... → sonido básico
        sounds.correct.play();
        console.log(`🔊 Playing CORRECT sound (combo level: ${comboLevel})`);
      }
    } catch (error) {
      console.warn('Error playing correct sound:', error);
    }
  }
  
  /**
   * Reproduce sonido de respuesta incorrecta
   */
  function playIncorrectSound() {
    initializeAudio(); // Inicializar audio
    try {
      sounds.incorrect.play();
      console.log('🔊 Playing incorrect sound');
    } catch (error) {
      console.warn('Error playing incorrect sound:', error);
    }
  }
  
  /**
   * Reproduce sonido de power-up activado
   */
  function playPowerupSound() {
    try {
      sounds.powerup.play();
    } catch (error) {
      console.warn('Error playing powerup sound:', error);
    }
  }
  
  /**
   * Reproduce sonido de UI (click)
   */
  function playUIClick() {
    try {
      sounds.uiClick.play();
    } catch (error) {
      console.warn('Error playing UI click sound:', error);
    }
  }
  
  /**
   * Inicia música de fondo
   */
  function startBackgroundMusic() {
    if (!bgMusic.value) {
      bgMusic.value = new Howl({
        src: ['/sounds/bgm-game.mp3'],
        loop: true,
        volume: 0,
        preload: false,
        onloaderror: () => console.warn('Background music file not found')
      });
    }
    
    try {
      bgMusic.value.play();
      bgMusic.value.fade(0, 0.25, 2000);
    } catch (error) {
      console.warn('Error starting background music:', error);
    }
  }
  
  /**
   * Detiene música de fondo con fade out
   */
  function stopBackgroundMusic() {
    if (bgMusic.value && bgMusic.value.playing()) {
      bgMusic.value.fade(bgMusic.value.volume(), 0, 1000);
      setTimeout(() => {
        bgMusic.value?.stop();
      }, 1000);
    }
  }
  
  /**
   * Ajusta la intensidad de la música según el combo
   */
  function adjustBGMIntensity(comboLevel: number) {
    if (bgMusic.value && bgMusic.value.playing()) {
      const baseVolume = 0.25;
      const targetVolume = Math.min(0.5, baseVolume + (comboLevel * 0.04));
      
      bgMusic.value.fade(bgMusic.value.volume(), targetVolume, 500);
    }
  }
  
  /**
   * Pausa música de fondo
   */
  function pauseBackgroundMusic() {
    if (bgMusic.value && bgMusic.value.playing()) {
      bgMusic.value.pause();
    }
  }
  
  /**
   * Resume música de fondo
   */
  function resumeBackgroundMusic() {
    if (bgMusic.value && !bgMusic.value.playing()) {
      bgMusic.value.play();
    }
  }
  
  /**
   * Establece volumen maestro
   */
  function setMasterVolume(volume: number) {
    Howler.volume(Math.max(0, Math.min(1, volume)));
  }
  
  /**
   * Mute/Unmute todo el audio
   */
  function toggleMute() {
    isMuted.value = !isMuted.value;
    Howler.mute(isMuted.value);
  }
  
  /**
   * Detiene todos los sonidos
   */
  function stopAll() {
    Howler.stop();
    isPlaying.value = false;
  }
  
  /**
   * Limpia todos los recursos de audio
   */
  function cleanup() {
    stopAll();
    
    if (currentSound.value) {
      currentSound.value.unload();
    }
    
    if (bgMusic.value) {
      bgMusic.value.unload();
    }
    
    Object.values(sounds).forEach(sound => {
      sound.unload();
    });
  }
  
  return {
    // State
    isPlaying,
    isMuted,
    isInitialized,
    
    // Initialization
    initializeAudio,
    
    // Question audio
    playQuestionAudio,
    
    // Sound effects
    playCorrectSound,
    playIncorrectSound,
    playPowerupSound,
    playUIClick,
    
    // Background music
    startBackgroundMusic,
    stopBackgroundMusic,
    pauseBackgroundMusic,
    resumeBackgroundMusic,
    adjustBGMIntensity,
    
    // Controls
    setMasterVolume,
    toggleMute,
    stopAll,
    cleanup
  };
}
