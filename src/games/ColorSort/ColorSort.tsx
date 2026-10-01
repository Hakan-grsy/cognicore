import { useState, useEffect, useCallback } from 'react';
import { GameWrapper } from '../../components/GameWrapper';
import { useStore } from '../../store/useStore';
import { ArrowLeft, ArrowRight } from 'lucide-react';

type GameState = 'waiting' | 'playing' | 'gameOver';
type BoxColor = 'red' | 'blue';

export default function ColorSort() {
  const { addScore, incrementCombo, resetCombo, activeCombo, isDarkMode, isHighContrast } = useStore();
  
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [currentColor, setCurrentColor] = useState<BoxColor>('red');
  
  // Kutucuğun ekranın üstünden aşağı düşmesini simüle etmek için state
  const [animationKey, setAnimationKey] = useState(0);

  const generateBox = useCallback(() => {
    setCurrentColor(Math.random() > 0.5 ? 'red' : 'blue');
    setAnimationKey(prev => prev + 1);
  }, []);

  const startGame = useCallback(() => {
    resetCombo();
    generateBox();
    setGameState('playing');
    setFeedback(null);
  }, [resetCombo, generateBox]);

  const handleChoice = useCallback((choice: BoxColor) => {
    if (gameState !== 'playing') return;

    if (choice === currentColor) {
      addScore(40 + activeCombo * 5); // Daha hızlı oyun, daha az temel skor
      incrementCombo();
      setFeedback('correct');
    } else {
      resetCombo();
      setFeedback('wrong');
    }

    generateBox();
    setTimeout(() => setFeedback(null), 150);
  }, [gameState, currentColor, addScore, activeCombo, incrementCombo, resetCombo, generateBox]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      if (e.key === 'ArrowLeft') handleChoice('red');
      else if (e.key === 'ArrowRight') handleChoice('blue');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, handleChoice]);

  const cardBgClass = isDarkMode ? 'bg-gray-800' : 'bg-white';
  
  // HC Modda farklı renk/şekil (Kırmızı->Turuncu, Mavi->Gökyüzü)
  const redClass = isHighContrast ? 'bg-orange-500' : 'bg-red-500';
  const blueClass = isHighContrast ? 'bg-sky-500' : 'bg-blue-500';

  return (
    <GameWrapper gameName="Renk Ayrıştırma" onTimeUp={() => setGameState('gameOver')}>
      <div className="flex flex-col items-center justify-center w-full max-w-md">
        {gameState === 'gameOver' ? (
           <div className="text-center">
             <h2 className="text-3xl font-bold text-red-500 mb-4">Süre Doldu!</h2>
             <button onClick={startGame} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold">Yeniden Oyna</button>
           </div>
        ) : gameState === 'waiting' ? (
           <div className={`p-8 rounded-2xl shadow-xl text-center border-2 ${cardBgClass} border-slate-200 dark:border-gray-700`}>
             <h2 className="text-2xl font-bold mb-4">Nasıl Oynanır?</h2>
             <p className="opacity-80 mb-6">Düşen kutu KIRMIZI ise SOLA, MAVİ ise SAĞA gönderin! Hızlanarak devam edeceksiniz.</p>
             <button onClick={startGame} className="px-8 py-4 bg-green-600 text-white rounded-xl font-bold text-lg w-full">Oyuna Başla</button>
           </div>
        ) : (
           <div className="w-full flex flex-col items-center">
              <div className="h-6 mb-2 text-center font-bold">
                 {feedback === 'correct' && <span className="text-green-500">✔</span>}
                 {feedback === 'wrong' && <span className="text-red-500">✖</span>}
              </div>

              {/* Game Area (Falling Box Simulator) */}
              <div className={`relative w-full h-80 rounded-3xl shadow-inner border-4 overflow-hidden bg-slate-100 dark:bg-gray-900 ${feedback === 'wrong' ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}>
                 <div className="absolute top-0 left-0 w-full h-full flex justify-center items-start pt-10">
                    <div 
                      key={animationKey}
                      className={`w-24 h-24 sm:w-32 sm:h-32 rounded-2xl shadow-lg animate-bounce ${currentColor === 'red' ? redClass : blueClass}`}
                    />
                 </div>
                 
                 {/* Bins */}
                 <div className="absolute bottom-0 left-0 w-full flex justify-between p-4">
                    <div className={`w-1/3 h-16 rounded-xl border-4 border-dashed opacity-50 flex items-center justify-center ${redClass} border-red-700`}>
                       <ArrowLeft className="text-white"/>
                    </div>
                    <div className={`w-1/3 h-16 rounded-xl border-4 border-dashed opacity-50 flex items-center justify-center ${blueClass} border-blue-700`}>
                       <ArrowRight className="text-white"/>
                    </div>
                 </div>
              </div>

              <div className="flex w-full gap-4 mt-6">
                <button onClick={() => handleChoice('red')} className={`flex-1 py-5 text-white rounded-xl font-bold text-xl shadow-lg flex flex-col items-center ${redClass}`}>
                  <span>KIRMIZI</span><span className="text-xs opacity-70">(Sol Ok)</span>
                </button>
                <button onClick={() => handleChoice('blue')} className={`flex-1 py-5 text-white rounded-xl font-bold text-xl shadow-lg flex flex-col items-center ${blueClass}`}>
                  <span>MAVİ</span><span className="text-xs opacity-70">(Sağ Ok)</span>
                </button>
              </div>
           </div>
        )}
      </div>
    </GameWrapper>
  );
}
