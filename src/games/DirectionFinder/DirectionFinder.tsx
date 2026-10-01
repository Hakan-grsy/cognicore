import { useState, useEffect, useCallback } from 'react';
import { GameWrapper } from '../../components/GameWrapper';
import { useStore } from '../../store/useStore';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Navigation } from 'lucide-react';

type GameState = 'waiting' | 'playing' | 'gameOver';
type Direction = 'up' | 'down' | 'left' | 'right';

const DIRECTION_ICONS = {
  up: ArrowUp,
  down: ArrowDown,
  left: ArrowLeft,
  right: ArrowRight
};

export default function DirectionFinder() {
  const { addScore, incrementCombo, resetCombo, activeCombo, isDarkMode, isHighContrast } = useStore();
  
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const [targetDir, setTargetDir] = useState<Direction>('up');
  const [flockDir, setFlockDir] = useState<Direction>('up');
  const [scatterPositions, setScatterPositions] = useState<number[]>([]);

  const generateLevel = useCallback(() => {
    const dirs: Direction[] = ['up', 'down', 'left', 'right'];
    const newTarget = dirs[Math.floor(Math.random() * dirs.length)];
    
    // 50% chance to be incongruent
    let newFlock = newTarget;
    if (Math.random() > 0.5) {
      newFlock = dirs[Math.floor(Math.random() * dirs.length)];
    }
    
    setTargetDir(newTarget);
    setFlockDir(newFlock);

    // If combo is high, scatter them in a 3x3 grid
    // Center is always index 4. The other 4 arrows go to random outer cells.
    if (activeCombo >= 5) {
      const outerCells = [0, 1, 2, 3, 5, 6, 7, 8];
      const positions: number[] = [];
      while (positions.length < 4) {
        const randIndex = Math.floor(Math.random() * outerCells.length);
        const cell = outerCells[randIndex];
        if (!positions.includes(cell)) {
          positions.push(cell);
        }
      }
      setScatterPositions(positions);
    } else {
      setScatterPositions([]);
    }

  }, [activeCombo]);

  const startGame = useCallback(() => {
    resetCombo();
    generateLevel();
    setGameState('playing');
    setFeedback(null);
  }, [resetCombo, generateLevel]);

  const handleChoice = useCallback((choice: Direction) => {
    if (gameState !== 'playing') return;

    if (choice === targetDir) {
      // Correct
      addScore(50 + activeCombo * 10);
      incrementCombo();
      setFeedback('correct');
    } else {
      // Wrong
      resetCombo();
      setFeedback('wrong');
    }

    generateLevel();
    setTimeout(() => setFeedback(null), 300);
  }, [gameState, targetDir, addScore, activeCombo, incrementCombo, resetCombo, generateLevel]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      if (e.key === 'ArrowLeft') handleChoice('left');
      else if (e.key === 'ArrowRight') handleChoice('right');
      else if (e.key === 'ArrowUp') handleChoice('up');
      else if (e.key === 'ArrowDown') handleChoice('down');
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, handleChoice]);

  const cardBgClass = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200';
  const contrastClass = isHighContrast ? 'text-yellow-400' : 'text-blue-500 dark:text-blue-400';
  const targetContrastClass = isHighContrast ? 'text-yellow-400' : 'text-blue-500 dark:text-blue-400'; // Make target look same or slightly different? Usually they must look identical to cause cognitive conflict.

  const renderArrows = () => {
    const TargetIcon = DIRECTION_ICONS[targetDir];
    const FlockIcon = DIRECTION_ICONS[flockDir];
    
    if (activeCombo >= 5) {
      // Scattered 3x3 Grid
      return (
        <div className="grid grid-cols-3 grid-rows-3 gap-2 w-64 h-64 sm:w-80 sm:h-80 mx-auto">
          {Array.from({ length: 9 }).map((_, i) => {
            if (i === 4) {
              return (
                <div key={i} className="flex items-center justify-center border-2 border-dashed border-gray-400 dark:border-gray-600 rounded-xl bg-slate-50 dark:bg-gray-800 shadow-sm relative">
                   <TargetIcon size={48} className={targetContrastClass} strokeWidth={3} />
                   <div className="absolute -top-3 text-[10px] bg-blue-500 text-white px-2 rounded-full opacity-50 uppercase">Orta</div>
                </div>
              );
            }
            if (scatterPositions.includes(i)) {
              return (
                <div key={i} className="flex items-center justify-center">
                   <FlockIcon size={48} className={`${contrastClass} opacity-70`} strokeWidth={3} />
                </div>
              );
            }
            return <div key={i} className="flex items-center justify-center"></div>;
          })}
        </div>
      );
    }

    // Straight Row
    return (
      <div className="flex items-center justify-center gap-2 sm:gap-4 h-64 w-full">
        <FlockIcon size={56} className={`${contrastClass} opacity-80`} strokeWidth={3} />
        <FlockIcon size={56} className={`${contrastClass} opacity-80`} strokeWidth={3} />
        
        <div className="relative flex items-center justify-center p-2 rounded-xl bg-slate-100 dark:bg-gray-900 shadow-inner border border-slate-200 dark:border-gray-700">
          <TargetIcon size={64} className={targetContrastClass} strokeWidth={4} />
          <div className="absolute -top-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Orta</div>
        </div>
        
        <FlockIcon size={56} className={`${contrastClass} opacity-80`} strokeWidth={3} />
        <FlockIcon size={56} className={`${contrastClass} opacity-80`} strokeWidth={3} />
      </div>
    );
  };

  return (
    <GameWrapper gameName="Direction Finder" onTimeUp={() => setGameState('gameOver')}>
      <div className="flex flex-col items-center justify-center w-full max-w-2xl">
        {gameState === 'gameOver' ? (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-red-500 mb-4">Süre Doldu!</h2>
            <button onClick={startGame} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-bold">
              Yeniden Oyna
            </button>
          </div>
        ) : gameState === 'waiting' ? (
          <div className="text-center">
             <div className={`p-8 rounded-2xl shadow-xl mb-6 ${cardBgClass} border-2`}>
               <Navigation size={48} className="mx-auto mb-4 text-blue-500" />
               <h2 className="text-2xl font-bold mb-4">Nasıl Oynanır?</h2>
               <p className="opacity-80 mb-2">Ekranda beliren oklardan <strong>SADECE ORTADAKİNE</strong> odaklanın.</p>
               <p className="opacity-80 mb-6">Ortadaki okun gösterdiği yöne ait butona veya klavye yön tuşuna basın.</p>
               <div className="text-sm opacity-60 mb-6 space-y-1">
                 <p className="mt-2 text-orange-500 font-bold">Dikkat! Kombo 5'e ulaştığında oklar dağılacaktır.</p>
               </div>
               <button onClick={startGame} className="px-8 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-bold text-lg w-full">
                 Oyuna Başla
               </button>
             </div>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center">
             <div className="h-8 mb-4 text-center font-bold text-lg">
                {feedback === 'correct' && <span className="text-green-500">Doğru!</span>}
                {feedback === 'wrong' && <span className="text-red-500">Yanlış!</span>}
             </div>
             
             {/* Arrows Area */}
             <div className={`flex flex-col items-center justify-center w-full p-4 sm:p-8 rounded-3xl shadow-xl border-4 transition-all duration-150 ${cardBgClass} ${feedback === 'correct' ? 'border-green-500' : feedback === 'wrong' ? 'border-red-500' : 'border-transparent'}`}>
                {renderArrows()}
             </div>

             {/* Mobile Controls (D-Pad style) */}
             <div className="flex flex-col items-center gap-2 mt-8 w-full max-w-xs sm:hidden">
               <button onClick={() => handleChoice('up')} className="p-4 bg-blue-500 text-white rounded-xl active:bg-blue-600 shadow-lg"><ArrowUp size={32}/></button>
               <div className="flex gap-2 w-full justify-between">
                 <button onClick={() => handleChoice('left')} className="p-4 bg-blue-500 text-white rounded-xl active:bg-blue-600 shadow-lg"><ArrowLeft size={32}/></button>
                 <button onClick={() => handleChoice('right')} className="p-4 bg-blue-500 text-white rounded-xl active:bg-blue-600 shadow-lg"><ArrowRight size={32}/></button>
               </div>
               <button onClick={() => handleChoice('down')} className="p-4 bg-blue-500 text-white rounded-xl active:bg-blue-600 shadow-lg"><ArrowDown size={32}/></button>
             </div>

             {/* Desktop instructions */}
             <div className="hidden sm:block mt-8 text-center opacity-60">
                <p className="font-bold mb-2">Klavyedeki Yön Tuşlarını Kullanın</p>
                <div className="flex justify-center gap-4">
                  <span className="px-3 py-1 bg-slate-200 dark:bg-gray-700 rounded-md shadow-sm">⬅️ Sol</span>
                  <span className="px-3 py-1 bg-slate-200 dark:bg-gray-700 rounded-md shadow-sm">⬆️ Yukarı</span>
                  <span className="px-3 py-1 bg-slate-200 dark:bg-gray-700 rounded-md shadow-sm">⬇️ Aşağı</span>
                  <span className="px-3 py-1 bg-slate-200 dark:bg-gray-700 rounded-md shadow-sm">➡️ Sağ</span>
                </div>
             </div>
          </div>
        )}
      </div>
    </GameWrapper>
  );
}
