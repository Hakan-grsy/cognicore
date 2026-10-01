import { useState, useEffect, useCallback } from 'react';
import { GameWrapper } from '../../components/GameWrapper';
import { useStore } from '../../store/useStore';

type GameState = 'waiting' | 'playing' | 'gameOver';

const REAL_WORDS = ['KİTAP', 'KALEM', 'BİLGİ', 'DENİZ', 'GÜNEŞ', 'MASA', 'ORMAN', 'ÇİÇEK', 'BULUT', 'YILDIZ', 'BİLGİSAYAR', 'TELEFON', 'GÖZLÜK'];
const FAKE_WORDS = ['KİPAT', 'KEMAL', 'BİGLİ', 'NİDEZ', 'ŞÜNEG', 'SAMA', 'ROMAN', 'ÇEKİÇ', 'LUTUB', 'ZIYDIL', 'BİLSİGAYAR', 'FENOLOT', 'ZÖGLÜK'];

export default function WordValidator() {
  const { addScore, incrementCombo, resetCombo, activeCombo, isDarkMode } = useStore();
  
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  
  const [currentWord, setCurrentWord] = useState('');
  const [isReal, setIsReal] = useState(true);

  const generateWord = useCallback(() => {
    const real = Math.random() > 0.5;
    setIsReal(real);
    if (real) {
      setCurrentWord(REAL_WORDS[Math.floor(Math.random() * REAL_WORDS.length)]);
    } else {
      setCurrentWord(FAKE_WORDS[Math.floor(Math.random() * FAKE_WORDS.length)]);
    }
  }, []);

  const startGame = useCallback(() => {
    resetCombo();
    generateWord();
    setGameState('playing');
    setFeedback(null);
  }, [resetCombo, generateWord]);

  const handleChoice = useCallback((choiceIsReal: boolean) => {
    if (gameState !== 'playing') return;

    if (choiceIsReal === isReal) {
      addScore(60 + activeCombo * 10);
      incrementCombo();
      setFeedback('correct');
    } else {
      resetCombo();
      setFeedback('wrong');
    }

    generateWord();
    setTimeout(() => setFeedback(null), 250);
  }, [gameState, isReal, addScore, activeCombo, incrementCombo, resetCombo, generateWord]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      if (e.key === 'ArrowLeft') handleChoice(false); // Sahte
      else if (e.key === 'ArrowRight') handleChoice(true); // Gerçek
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, handleChoice]);

  const cardBgClass = isDarkMode ? 'bg-gray-800' : 'bg-white';

  return (
    <GameWrapper gameName="Kelime Avı" onTimeUp={() => setGameState('gameOver')}>
      <div className="flex flex-col items-center justify-center w-full max-w-md">
        {gameState === 'gameOver' ? (
           <div className="text-center">
             <h2 className="text-3xl font-bold text-red-500 mb-4">Süre Doldu!</h2>
             <button onClick={startGame} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold">Yeniden Oyna</button>
           </div>
        ) : gameState === 'waiting' ? (
           <div className={`p-8 rounded-2xl shadow-xl text-center border-2 ${cardBgClass} border-slate-200 dark:border-gray-700`}>
             <h2 className="text-2xl font-bold mb-4">Nasıl Oynanır?</h2>
             <p className="opacity-80 mb-6">Ekranda beliren kelime Türkçe sözlükte var olan <strong>GERÇEK</strong> bir kelime mi, yoksa <strong>SAHTE</strong> mi?</p>
             <button onClick={startGame} className="px-8 py-4 bg-green-600 text-white rounded-xl font-bold text-lg w-full">Oyuna Başla</button>
           </div>
        ) : (
           <div className="w-full flex flex-col items-center">
              <div className="h-8 mb-4 text-center font-bold text-lg">
                 {feedback === 'correct' && <span className="text-green-500">Doğru!</span>}
                 {feedback === 'wrong' && <span className="text-red-500">Yanlış!</span>}
              </div>

              <div className={`flex items-center justify-center w-full h-48 rounded-3xl shadow-xl border-4 transition-all duration-150 ${cardBgClass} ${feedback === 'correct' ? 'border-green-500' : feedback === 'wrong' ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}>
                 <span className="text-4xl sm:text-5xl font-black tracking-widest">{currentWord}</span>
              </div>

              <div className="flex w-full gap-4 mt-8">
                <button onClick={() => handleChoice(false)} className="flex-1 py-5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-xl shadow-lg">
                  SAHTE <br/><span className="text-xs opacity-70">(Sol Ok)</span>
                </button>
                <button onClick={() => handleChoice(true)} className="flex-1 py-5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-xl shadow-lg">
                  GERÇEK <br/><span className="text-xs opacity-70">(Sağ Ok)</span>
                </button>
              </div>
           </div>
        )}
      </div>
    </GameWrapper>
  );
}
