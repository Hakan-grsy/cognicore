import { useCallback, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';

export function useGameSounds() {
  const isSoundEnabled = useStore(state => state.isSoundEnabled);

  const clickAudio = useRef<HTMLAudioElement | null>(null);
  const successAudio = useRef<HTMLAudioElement | null>(null);
  const errorAudio = useRef<HTMLAudioElement | null>(null);
  const bgmAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Load local HTML5 audio files
    clickAudio.current = new Audio('/sounds/click.mp3');
    successAudio.current = new Audio('/sounds/correct.mp3');
    errorAudio.current = new Audio('/sounds/wrong.mp3');
    
    bgmAudio.current = new Audio('/sounds/bgm.mp3');
    bgmAudio.current.loop = true;
    bgmAudio.current.volume = 0.1;

    // Adjust success audio volume (it's too loud by default)
    if (successAudio.current) {
      successAudio.current.volume = 0.3;
    }

    // Optional preloading
    clickAudio.current.load();
    successAudio.current.load();
    errorAudio.current.load();
    bgmAudio.current.load();

    return () => {
      if (bgmAudio.current) {
        bgmAudio.current.pause();
        bgmAudio.current.currentTime = 0;
      }
    };
  }, []);

  const playClick = useCallback(() => {
    if (isSoundEnabled && clickAudio.current) {
      clickAudio.current.currentTime = 0;
      clickAudio.current.play().catch(() => {});
    }
  }, [isSoundEnabled]);

  const playSuccess = useCallback(() => {
    if (isSoundEnabled && successAudio.current) {
      successAudio.current.currentTime = 0;
      successAudio.current.play().catch(() => {});
    }
  }, [isSoundEnabled]);

  const playError = useCallback(() => {
    if (isSoundEnabled && errorAudio.current) {
      errorAudio.current.currentTime = 0;
      errorAudio.current.play().catch(() => {});
    }
  }, [isSoundEnabled]);

  const playBGM = useCallback(() => {
    if (!isSoundEnabled || !bgmAudio.current) return;
    if (bgmAudio.current.paused) {
      bgmAudio.current.play().catch(() => {});
    }
  }, [isSoundEnabled]);

  const stopBGM = useCallback(() => {
    if (bgmAudio.current) {
      bgmAudio.current.pause();
    }
  }, []);

  useEffect(() => {
    if (!isSoundEnabled && bgmAudio.current && !bgmAudio.current.paused) {
      bgmAudio.current.pause();
    }
  }, [isSoundEnabled]);

  return {
    playClick,
    playSuccess,
    playError,
    playBGM,
    stopBGM
  };
}
