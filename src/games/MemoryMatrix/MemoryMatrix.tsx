import { useState, useEffect, useCallback } from 'react';
import { GameWrapper } from '../../components/GameWrapper';
import { useStore } from '../../store/useStore';

type GameState = 'waiting' | 'memorize' | 'playing' | 'gameOver';

export default function MemoryMatrix() {
  const { addScore, incrementCombo, resetCombo, activeCombo, isDarkMode, isHighContrast } = useStore();
  
  const [gridSize, setGridSize] = useState(3);
  const [activeTiles, setActiveTiles] = useState<number[]>([]);
  const [userTiles, setUserTiles] = useState<number[]>([]);
  const [gameState, setGameState] = useState<GameState>('waiting');
  
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [consecutiveWrong, setConsecutiveWrong] = useState(0);
  
  // Seviye (gridSize) arttıkça gösterim süresi orantılı olarak kısalır
  const displayTime = Math.max(400, 2000 - (gridSize - 3) * 400 - consecutiveCorrect * 100);
  const totalTilesToRemember = Math.min(Math.floor(gridSize * gridSize * 0.4) + Math.floor(consecutiveCorrect / 2), gridSize * gridSize - 1);

  const startLevel = useCallback(() => {
    // Generate random active tiles
    const totalCells = gridSize * gridSize;
    const newActive = new Set<number>();
    while (newActive.size < totalTilesToRemember) {
      newActive.add(Math.floor(Math.random() * totalCells));
    }
    
    setActiveTiles(Array.from(newActive));
    setUserTiles([]);
    setGameState('memorize');
  }, [gridSize, totalTilesToRemember]);

  useEffect(() => {
    if (gameState === 'memorize') {
      const timer = setTimeout(() => {
        setGameState('playing');
      }, displayTime);
      return () => clearTimeout(timer);
    }
  }, [gameState, displayTime]);

  const handleTileClick = (index: number) => {
    if (gameState !== 'playing') return;
    if (userTiles.includes(index)) return; // Already clicked

    const newUserTiles = [...userTiles, index];
    setUserTiles(newUserTiles);

    if (activeTiles.includes(index)) {
      // Correct click
      if (newUserTiles.length === activeTiles.length) {
        // Level completed
        addScore(100 + activeCombo * 20);
        incrementCombo();
        
        const newCorrect = consecutiveCorrect + 1;
        if (newCorrect >= 3) {
          setGridSize(prev => Math.min(prev + 1, 8)); // Max grid 8
          setConsecutiveCorrect(0);
        } else {
          setConsecutiveCorrect(newCorrect);
        }
        setConsecutiveWrong(0);

        setGameState('waiting');
        setTimeout(startLevel, 1000);
      }
    } else {
      // Wrong click
      resetCombo();
      
      const newWrong = consecutiveWrong + 1;
      if (newWrong >= 2) {
        setGridSize(prev => Math.max(prev - 1, 3)); // Min grid 3
        setConsecutiveWrong(0);
      } else {
        setConsecutiveWrong(newWrong);
      }
      setConsecutiveCorrect(0);

      setGameState('waiting');
      setTimeout(startLevel, 1500);
    }
  };

  const getTileClass = (index: number) => {
    const isTarget = activeTiles.includes(index);
    const isClicked = userTiles.includes(index);
    
    let baseClass = "w-16 h-16 sm:w-20 sm:h-20 rounded-md shadow-sm transition-all duration-200 cursor-pointer border-2 ";
    
    if (isDarkMode) {
      baseClass += "border-gray-700 bg-gray-800 ";
    } else {
      baseClass += "border-gray-300 bg-slate-100 ";
    }

    if (gameState === 'memorize' && isTarget) {
      // Highlight color
      return baseClass + (isHighContrast ? "!bg-yellow-400 !border-yellow-500 scale-105" : "!bg-blue-500 !border-blue-600 scale-105");
    }

    if (gameState === 'playing' || gameState === 'waiting') {
      if (isClicked) {
        if (isTarget) {
           return baseClass + (isHighContrast ? "!bg-yellow-400 !border-yellow-500" : "!bg-blue-500 !border-blue-600");
        } else {
           return baseClass + "!bg-red-500 !border-red-600 animate-pulse";
        }
      }
      // Reveal missed targets on error (during wait state if wrong)
      if (gameState === 'waiting' && isTarget && userTiles.length > 0 && !activeTiles.every(t => userTiles.includes(t))) {
         return baseClass + "!bg-blue-300 !border-blue-400 opacity-50";
      }
    }

    return baseClass + "hover:bg-slate-200 dark:hover:bg-gray-700";
  };

  return (
    <GameWrapper gameName="Memory Matrix" onTimeUp={() => setGameState('gameOver')}>
      <div className="flex flex-col items-center">
        {gameState === 'gameOver' ? (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-red-500 mb-4">Süre Doldu!</h2>
            <button onClick={() => { resetCombo(); setGridSize(3); setConsecutiveCorrect(0); setConsecutiveWrong(0); setGameState('waiting'); startLevel(); }} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-bold">
              Yeniden Oyna
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6 h-8 text-center text-lg font-medium opacity-80">
              {gameState === 'waiting' && userTiles.length === 0 && (
                 <button onClick={startLevel} className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700">Oyuna Başla</button>
              )}
              {gameState === 'waiting' && userTiles.length > 0 && "Sonraki Seviye Hazırlanıyor..."}
              {gameState === 'memorize' && "Kareleri Ezberle!"}
              {gameState === 'playing' && "Hatırladığın karelere tıkla"}
            </div>

            <div 
              className="grid gap-2 sm:gap-3"
              style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
            >
              {Array.from({ length: gridSize * gridSize }).map((_, idx) => (
                <div 
                  key={idx} 
                  className={getTileClass(idx)}
                  onClick={() => handleTileClick(idx)}
                />
              ))}
            </div>
            
            <div className="mt-8 text-sm opacity-60 text-center max-w-md">
              <p>Adaptif Zorluk: Peş peşe 3 doğru grid'i büyütür, 2 yanlış küçültür. Seviye arttıkça gösterim süresi kısalır.</p>
              <p>Gösterim süresi: {displayTime}ms, Izgara: {gridSize}x{gridSize}</p>
            </div>
          </>
        )}
      </div>
    </GameWrapper>
  );
}
