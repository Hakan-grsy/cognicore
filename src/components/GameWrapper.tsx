import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, Zap, RefreshCw, Home, Volume2, VolumeX } from 'lucide-react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameSounds } from '../hooks/useGameSounds';
import { SettingsModal } from './SettingsModal';

interface GameWrapperProps {
  children: React.ReactNode;
  gameName: string;
  initialTime?: number; // in seconds
  onTimeUp?: () => void;
}

const TIPS = [
  "Kullanıcıların %72'si bu oyunda 4. kombodan sonra hız kaybediyor. Ritmini koru!",
  "Sabah saatlerinde oynayan oyuncular %15 daha yüksek skor elde ediyor.",
  "İlk 10 saniyede hata yapmayanların genel başarı oranı %85.",
  "Acele etme! Doğruluk, hızdan daha çok puan kazandırır.",
  "Bu oyunda en çok zorlanılan aşama 3. seviye. Dikkatini topla!"
];

export const GameWrapper: React.FC<GameWrapperProps> = ({ children, gameName, initialTime = 60, onTimeUp }) => {
  const navigate = useNavigate();
  const { totalScore, activeCombo, isHighContrast, addXp, isSoundEnabled, toggleSound } = useStore();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [showSettings, setShowSettings] = useState(false);
  const [randomTip, setRandomTip] = useState("");

  // Track session score for XP calculation
  const [initialScore] = useState(totalScore);
  const [isGameOver, setIsGameOver] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);

  // Sound Integration
  const { playSuccess, playError, playClick, playBGM, stopBGM } = useGameSounds();
  const prevScore = useRef(totalScore);
  const prevCombo = useRef(activeCombo);

  useEffect(() => {
    setRandomTip(TIPS[Math.floor(Math.random() * TIPS.length)]);
  }, []);

  // Auto-play sound on score or combo change (avoids modifying 15 child games)
  useEffect(() => {
    if (isPlaying && !isGameOver) {
      if (totalScore > prevScore.current) {
        playSuccess();
      }
      if (activeCombo === 0 && prevCombo.current > 0) {
        playError();
      }
    }
    prevScore.current = totalScore;
    prevCombo.current = activeCombo;
  }, [totalScore, activeCombo, isPlaying, isGameOver, playSuccess, playError]);

  // Start playing on first interaction (click or keypress anywhere)
  useEffect(() => {
    if (isPlaying || isGameOver) return;
    
    const handleStart = () => {
      setIsPlaying(true);
    };

    document.addEventListener('pointerdown', handleStart, { once: true });
    document.addEventListener('keydown', handleStart, { once: true });

    return () => {
      document.removeEventListener('pointerdown', handleStart);
      document.removeEventListener('keydown', handleStart);
    };
  }, [isPlaying, isGameOver]);

  // BGM Logic
  useEffect(() => {
    if (isPlaying && !isGameOver) {
      playBGM();
    } else {
      stopBGM();
    }
    return () => stopBGM(); // Cleanup on unmount
  }, [isPlaying, isGameOver, playBGM, stopBGM]);

  useEffect(() => {
    if (isPlaying && timeLeft > 0 && !isGameOver) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
    
    if (isPlaying && timeLeft <= 0 && !isGameOver) {
      setIsGameOver(true);
      setIsPlaying(false);
      stopBGM();
      
      const scoreDiff = totalScore - initialScore;
      const calculatedXp = Math.max(10, Math.floor(scoreDiff / 2));
      setEarnedXp(calculatedXp);
      addXp(calculatedXp);

      if (onTimeUp) onTimeUp();
    }
  }, [isPlaying, timeLeft, isGameOver, totalScore, initialScore, addXp, onTimeUp, stopBGM]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const contrastClass = isHighContrast ? 'contrast-125' : '';

  return (
    <div className={`min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 ${contrastClass} transition-colors duration-300 font-sans relative`}>
      {/* Header */}
      <header className={`flex items-center justify-between p-4 bg-white/80 dark:bg-slate-900/80 shadow-md backdrop-blur-md sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300`}>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => { playClick(); navigate('/dashboard'); }} 
            className={`p-2 rounded-full transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white`} 
            title="Geri"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">{gameName}</h1>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-xs opacity-70 font-bold tracking-widest uppercase">Skor</span>
            <span className="font-bold text-xl leading-none text-blue-600 dark:text-blue-500">{totalScore}</span>
          </div>
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-xs opacity-70 font-bold tracking-widest uppercase">Kombo</span>
            <span className="font-bold text-xl leading-none text-orange-600 dark:text-orange-500">x{activeCombo}</span>
          </div>
          <div className={`text-3xl font-black font-mono ml-2 sm:ml-4 ${timeLeft <= 10 && isPlaying ? 'text-red-500 animate-pulse' : ''}`}>
            {formatTime(timeLeft)}
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => { playClick(); toggleSound(); }} 
              className={`p-2 rounded-full transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white`} 
              title="Ses"
            >
              {isSoundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} className="text-red-400" />}
            </button>
            <button 
              onClick={() => { playClick(); setShowSettings(!showSettings); }} 
              className={`p-2 rounded-full transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white`} 
              title="Ayarlar"
            >
              <Settings size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Settings Modal (Overlay) */}
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
        showLogout={false} 
      />

      {/* Game Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 relative z-0 w-full h-full">
        {children}

        {/* Community Tip Overlay before starting */}
        <AnimatePresence>
          {!isPlaying && !isGameOver && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-12 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 p-4 rounded-2xl shadow-xl pointer-events-none text-center z-10 transition-colors duration-300"
            >
              <div className="flex items-start gap-3">
                <div className="text-xl">💡</div>
                <div className="text-left">
                  <span className="text-xs font-bold text-blue-500 dark:text-blue-400 uppercase tracking-wider block mb-1">Topluluk Analizi (50.000+ Oyuncu)</span>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                    {randomTip}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Game Over Modal */}
      <AnimatePresence>
        {isGameOver && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-md p-4 transition-colors duration-300"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl rounded-3xl p-8 max-w-sm w-full flex flex-col items-center text-center transition-colors duration-300"
            >
               <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2">Süre Doldu!</h2>
               <p className="text-slate-600 dark:text-slate-400 mb-8">Antrenman tamamlandı.</p>

               <div className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 mb-8 border border-slate-200 dark:border-slate-700">
                  <div className="flex flex-col gap-1 mb-4">
                     <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Kazanılan Skor</span>
                     <span className="text-3xl font-black text-blue-600 dark:text-blue-500">{totalScore - initialScore}</span>
                  </div>
                  <div className="w-full h-px bg-slate-200 dark:bg-slate-700 my-4"></div>
                  <div className="flex flex-col gap-1">
                     <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Kazanılan XP</span>
                     <span className="text-4xl font-black text-yellow-500 dark:text-yellow-400 flex items-center justify-center gap-2">
                       <Zap size={28} fill="currentColor" /> {earnedXp}
                     </span>
                  </div>
               </div>

               <div className="flex flex-col gap-3 w-full">
                 <button 
                   onClick={() => { playClick(); window.location.reload(); }} 
                   className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg transition flex justify-center items-center gap-2"
                 >
                   <RefreshCw size={20} /> Tekrar Oyna
                 </button>
                 <button 
                   onClick={() => { playClick(); navigate('/dashboard'); }} 
                   className="w-full py-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white rounded-xl font-bold text-lg transition flex justify-center items-center gap-2 border border-slate-200 dark:border-slate-700"
                 >
                   <Home size={20} /> Dashboard'a Dön
                 </button>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
