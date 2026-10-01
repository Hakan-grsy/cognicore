import { useState, useEffect, useCallback } from 'react';
import { GameWrapper } from '../../components/GameWrapper';
import { useStore } from '../../store/useStore';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

type GameState = 'waiting' | 'playing' | 'gameOver';
type Direction = 'up' | 'down' | 'left' | 'right';
type ArrowColor = 'blue' | 'red';

export default function MotionDirection() {
  const { addScore, incrementCombo, resetCombo, activeCombo, isDarkMode, isHighContrast } = useStore();
  
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  
  const [arrowDir, setArrowDir] = useState<Direction>('up');
  const [motionDir, setMotionDir] = useState<Direction>('down');
  const [arrowColor, setArrowColor] = useState<ArrowColor>('blue');
  const [animationKey, setAnimationKey] = useState(0);

  const getMotionClass = (dir: Direction) => {
    switch(dir) {
      case 'up': return '-translate-y-12';
      case 'down': return 'translate-y-12';
      case 'left': return '-translate-x-12';
      case 'right': return 'translate-x-12';
    }
  };

  const getIcon = (dir: Direction) => {
    switch(dir) {
      case 'up': return ArrowUp;
      case 'down': return ArrowDown;
      case 'left': return ArrowLeft;
      case 'right': return ArrowRight;
    }
  };

  const generateLevel = useCallback(() => {
    const dirs: Direction[] = ['up', 'down', 'left', 'right'];
    const aDir = dirs[Math.floor(Math.random() * dirs.length)];
    let mDir = dirs[Math.floor(Math.random() * dirs.length)];
    
    // Ensure they are often different for confusion
    if (Math.random() > 0.3) {
      while (mDir === aDir) {
        mDir = dirs[Math.floor(Math.random() * dirs.length)];
      }
    }
    
    setArrowDir(aDir);
    setMotionDir(mDir);
    setArrowColor(Math.random() > 0.5 ? 'blue' : 'red');
    setAnimationKey(prev => prev + 1);
  }, []);

  const startGame = useCallback(() => {
    resetCombo();
    generateLevel();
    setGameState('playing');
    setFeedback(null);
  }, [resetCombo, generateLevel]);

  const handleChoice = useCallback((choice: Direction) => {
    if (gameState !== 'playing') return;

    // Rule: Blue -> Arrow Direction, Red -> Motion Direction
    const correctDir = arrowColor === 'blue' ? arrowDir : motionDir;
    
    if (choice === correctDir) {
      addScore(60 + activeCombo * 10);
      incrementCombo();
      setFeedback('correct');
    } else {
      resetCombo();
      setFeedback('wrong');
    }

    generateLevel();
    setTimeout(() => setFeedback(null), 300);
  }, [gameState, arrowColor, arrowDir, motionDir, addScore, activeCombo, incrementCombo, resetCombo, generateLevel]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      if (e.key === 'ArrowUp') handleChoice('up');
      else if (e.key === 'ArrowDown') handleChoice('down');
      else if (e.key === 'ArrowLeft') handleChoice('left');
      else if (e.key === 'ArrowRight') handleChoice('right');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, handleChoice]);

  const cardBgClass = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const Icon = getIcon(arrowDir);
  
  // High contrast support
  const blueColor = isHighContrast ? 'text-sky-400' : 'text-blue-500';
  const redColor = isHighContrast ? 'text-orange-500' : 'text-red-500';
  const displayColorClass = arrowColor === 'blue' ? blueColor : redColor;

  return (
    <GameWrapper gameName="Esnek Yönelim" onTimeUp={() => setGameState('gameOver')}>
      <div className="flex flex-col items-center justify-center w-full max-w-md">
        {gameState === 'gameOver' ? (
           <div className="text-center">
             <h2 className="text-3xl font-bold text-red-500 mb-4">Süre Doldu!</h2>
             <button onClick={startGame} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold">Yeniden Oyna</button>
           </div>
        ) : gameState === 'waiting' ? (
           <div className={`p-8 rounded-2xl shadow-xl text-center border-2 ${cardBgClass} border-slate-200 dark:border-gray-700`}>
             <h2 className="text-2xl font-bold mb-4">Nasıl Oynanır?</h2>
             <div className="opacity-80 mb-6 space-y-2 text-left">
               <p>Ekranda hareket eden bir ok göreceksiniz.</p>
               <p className="font-bold text-blue-500">Ok MAVİ ise: Okun BAKTIĞI yöne basın.</p>
               <p className="font-bold text-red-500">Ok KIRMIZI ise: Okun HAREKET ETTİĞİ yöne basın.</p>
             </div>
             <button onClick={startGame} className="px-8 py-4 bg-green-600 text-white rounded-xl font-bold text-lg w-full">Oyuna Başla</button>
           </div>
        ) : (
           <div className="w-full flex flex-col items-center">
              <div className="h-8 mb-4 text-center font-bold text-lg">
                 {feedback === 'correct' && <span className="text-green-500">Doğru!</span>}
                 {feedback === 'wrong' && <span className="text-red-500">Yanlış!</span>}
              </div>

              <div className={`flex items-center justify-center w-full h-64 rounded-3xl shadow-xl border-4 transition-all duration-150 overflow-hidden ${cardBgClass} ${feedback === 'correct' ? 'border-green-500' : feedback === 'wrong' ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}>
                 <div key={animationKey} className={`transition-transform duration-1000 ease-in-out ${getMotionClass(motionDir)}`}>
                   <Icon size={120} className={displayColorClass} strokeWidth={3} />
                 </div>
              </div>

              <div className="hidden sm:flex w-full justify-center gap-4 mt-8 opacity-50 font-bold">
                 Klavye Yön Tuşlarını Kullanın
              </div>

              <div className="flex flex-col items-center gap-2 mt-8 w-full max-w-xs sm:hidden">
               <button onClick={() => handleChoice('up')} className="p-4 bg-slate-500 text-white rounded-xl shadow-lg"><ArrowUp size={32}/></button>
               <div className="flex gap-2 w-full justify-between">
                 <button onClick={() => handleChoice('left')} className="p-4 bg-slate-500 text-white rounded-xl shadow-lg"><ArrowLeft size={32}/></button>
                 <button onClick={() => handleChoice('right')} className="p-4 bg-slate-500 text-white rounded-xl shadow-lg"><ArrowRight size={32}/></button>
               </div>
               <button onClick={() => handleChoice('down')} className="p-4 bg-slate-500 text-white rounded-xl shadow-lg"><ArrowDown size={32}/></button>
             </div>
           </div>
        )}
      </div>
    </GameWrapper>
  );
}
