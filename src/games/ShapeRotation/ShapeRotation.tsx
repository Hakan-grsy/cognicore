import { useState, useEffect, useCallback } from 'react';
import { GameWrapper } from '../../components/GameWrapper';
import { useStore } from '../../store/useStore';

type GameState = 'waiting' | 'playing' | 'gameOver';

// 3x3 grids representing shapes
const SHAPES = [
  { id: 'T', base: [[1,1,1],[0,1,0],[0,0,0]] },
  { id: 'L', base: [[1,0,0],[1,0,0],[1,1,0]] },
  { id: 'J', base: [[0,0,1],[0,0,1],[0,1,1]] },
  { id: 'Z', base: [[1,1,0],[0,1,1],[0,0,0]] },
  { id: 'S', base: [[0,1,1],[1,1,0],[0,0,0]] }
];

// Rotate a 3x3 matrix 90 degrees clockwise
const rotateMatrix = (matrix: number[][]) => {
  const N = matrix.length;
  const rotated = matrix.map((row, i) =>
    row.map((_, j) => matrix[N - 1 - j][i])
  );
  return rotated;
};

// Mirror a 3x3 matrix horizontally
const mirrorMatrix = (matrix: number[][]) => {
  return matrix.map(row => [...row].reverse());
};

export default function ShapeRotation() {
  const { addScore, incrementCombo, resetCombo, activeCombo, isDarkMode, isHighContrast } = useStore();
  
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  
  const [leftMatrix, setLeftMatrix] = useState<number[][]>([]);
  const [rightMatrix, setRightMatrix] = useState<number[][]>([]);
  const [isMatch, setIsMatch] = useState(true);

  const generateLevel = useCallback(() => {
    const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    let left = shape.base;
    let right = shape.base;
    
    // Random initial rotation for left
    const leftRots = Math.floor(Math.random() * 4);
    for(let i=0; i<leftRots; i++) left = rotateMatrix(left);
    
    // Decide if right is just rotated or mirrored/different
    const actualMatch = Math.random() > 0.5;
    setIsMatch(actualMatch);
    
    if (actualMatch) {
      // Just rotate right differently
      const rightRots = Math.floor(Math.random() * 4);
      for(let i=0; i<rightRots; i++) right = rotateMatrix(right);
    } else {
      // Either mirror it or pick a completely different shape
      if (Math.random() > 0.5) {
        right = mirrorMatrix(right); // Ayna simetrisi
      } else {
        const otherShape = SHAPES.filter(s => s.id !== shape.id)[Math.floor(Math.random() * (SHAPES.length - 1))];
        right = otherShape.base;
      }
      const rightRots = Math.floor(Math.random() * 4);
      for(let i=0; i<rightRots; i++) right = rotateMatrix(right);
    }

    setLeftMatrix(left);
    setRightMatrix(right);
  }, []);

  const startGame = useCallback(() => {
    resetCombo();
    generateLevel();
    setGameState('playing');
    setFeedback(null);
  }, [resetCombo, generateLevel]);

  const handleChoice = useCallback((choiceIsMatch: boolean) => {
    if (gameState !== 'playing') return;

    if (choiceIsMatch === isMatch) {
      addScore(70 + activeCombo * 15);
      incrementCombo();
      setFeedback('correct');
    } else {
      resetCombo();
      setFeedback('wrong');
    }

    generateLevel();
    setTimeout(() => setFeedback(null), 300);
  }, [gameState, isMatch, addScore, activeCombo, incrementCombo, resetCombo, generateLevel]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      if (e.key === 'ArrowLeft') handleChoice(false);
      else if (e.key === 'ArrowRight') handleChoice(true);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, handleChoice]);

  const cardBgClass = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const cellFilledClass = isHighContrast ? 'bg-orange-500' : 'bg-blue-600';
  const cellEmptyClass = isDarkMode ? 'bg-gray-700' : 'bg-slate-100';

  const renderMatrix = (matrix: number[][]) => (
    <div className="grid grid-cols-3 gap-1">
      {matrix.map((row, r) => 
        row.map((val, c) => (
          <div key={`${r}-${c}`} className={`w-8 h-8 sm:w-12 sm:h-12 rounded-sm ${val ? cellFilledClass : cellEmptyClass}`} />
        ))
      )}
    </div>
  );

  return (
    <GameWrapper gameName="Şekil Döndürme" onTimeUp={() => setGameState('gameOver')}>
      <div className="flex flex-col items-center justify-center w-full max-w-md">
         {gameState === 'gameOver' ? (
           <div className="text-center">
             <h2 className="text-3xl font-bold text-red-500 mb-4">Süre Doldu!</h2>
             <button onClick={startGame} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold">Yeniden Oyna</button>
           </div>
        ) : gameState === 'waiting' ? (
           <div className={`p-8 rounded-2xl shadow-xl text-center border-2 ${cardBgClass} border-slate-200 dark:border-gray-700`}>
             <h2 className="text-2xl font-bold mb-4">Nasıl Oynanır?</h2>
             <p className="opacity-80 mb-6">Sağdaki şekil, soldakinin sadece <strong>DÖNDÜRÜLMÜŞ</strong> hali mi, yoksa aynadan yansımış/tamamen <strong>FARKLI</strong> bir şekil mi?</p>
             <button onClick={startGame} className="px-8 py-4 bg-green-600 text-white rounded-xl font-bold text-lg w-full">Oyuna Başla</button>
           </div>
        ) : (
           <div className="w-full flex flex-col items-center">
              <div className="h-8 mb-4 text-center font-bold text-lg">
                 {feedback === 'correct' && <span className="text-green-500">Doğru!</span>}
                 {feedback === 'wrong' && <span className="text-red-500">Yanlış!</span>}
              </div>

              <div className={`flex items-center justify-around w-full p-8 rounded-3xl shadow-xl border-4 transition-all duration-150 ${cardBgClass} ${feedback === 'correct' ? 'border-green-500' : feedback === 'wrong' ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}>
                 {renderMatrix(leftMatrix)}
                 <div className="text-2xl font-bold opacity-30">vs</div>
                 {renderMatrix(rightMatrix)}
              </div>

              <div className="flex w-full gap-4 mt-8">
                <button onClick={() => handleChoice(false)} className="flex-1 py-5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-xl shadow-lg">
                  FARKLI <br/><span className="text-xs opacity-70">(Sol Ok)</span>
                </button>
                <button onClick={() => handleChoice(true)} className="flex-1 py-5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-xl shadow-lg">
                  AYNI (DÖNÜK) <br/><span className="text-xs opacity-70">(Sağ Ok)</span>
                </button>
              </div>
           </div>
        )}
      </div>
    </GameWrapper>
  );
}
