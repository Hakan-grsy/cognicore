import { useState, useEffect, useCallback, useRef } from 'react';
import { GameWrapper } from '../../components/GameWrapper';
import { useStore } from '../../store/useStore';

type GameState = 'waiting' | 'playing' | 'gameOver';

export default function FallingMath() {
  const { addScore, incrementCombo, resetCombo, activeCombo, isDarkMode } = useStore();
  
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [expression, setExpression] = useState('');
  const [answer, setAnswer] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [positionY, setPositionY] = useState(0);
  
  const inputRef = useRef<HTMLInputElement>(null);

  const generateMath = useCallback(() => {
    const isAdd = Math.random() > 0.5;
    const num1 = Math.floor(Math.random() * (10 + activeCombo * 2)) + 1;
    const num2 = Math.floor(Math.random() * (10 + activeCombo * 2)) + 1;
    
    if (isAdd) {
      setExpression(`${num1} + ${num2}`);
      setAnswer(num1 + num2);
    } else {
      const max = Math.max(num1, num2);
      const min = Math.min(num1, num2);
      setExpression(`${max} - ${min}`);
      setAnswer(max - min);
    }
    setPositionY(0);
    setUserInput('');
  }, [activeCombo]);

  const startGame = useCallback(() => {
    resetCombo();
    generateMath();
    setGameState('playing');
  }, [resetCombo, generateMath]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    inputRef.current?.focus();
    
    // Fall speed increases with combo
    const speed = Math.max(10, 100 - activeCombo * 5); // delay in ms
    
    const interval = setInterval(() => {
      setPositionY(prev => {
        if (prev > 95) {
          // Hit bottom
          resetCombo();
          generateMath();
          return 0;
        }
        return prev + 1;
      });
    }, speed);
    
    return () => clearInterval(interval);
  }, [gameState, activeCombo, resetCombo, generateMath]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (gameState !== 'playing') return;

    if (parseInt(userInput) === answer) {
      addScore(50 + activeCombo * 10);
      incrementCombo();
      generateMath();
    } else {
      setUserInput('');
    }
  };

  const cardBgClass = isDarkMode ? 'bg-gray-800' : 'bg-white';

  return (
    <GameWrapper gameName="Matematik Yağmuru" onTimeUp={() => setGameState('gameOver')}>
      <div className="flex flex-col items-center justify-center w-full max-w-md">
        {gameState === 'gameOver' ? (
           <div className="text-center">
             <h2 className="text-3xl font-bold text-red-500 mb-4">Süre Doldu!</h2>
             <button onClick={startGame} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold">Yeniden Oyna</button>
           </div>
        ) : gameState === 'waiting' ? (
           <div className={`p-8 rounded-2xl shadow-xl text-center border-2 ${cardBgClass} border-slate-200 dark:border-gray-700`}>
             <h2 className="text-2xl font-bold mb-4">Nasıl Oynanır?</h2>
             <p className="opacity-80 mb-6">İşlem yere düşmeden önce cevabını girin! Hızlanarak devam edecektir.</p>
             <button onClick={startGame} className="px-8 py-4 bg-green-600 text-white rounded-xl font-bold text-lg w-full">Oyuna Başla</button>
           </div>
        ) : (
           <div className="w-full flex flex-col items-center">
              <div className={`relative w-full h-80 rounded-3xl shadow-inner border-4 overflow-hidden bg-slate-100 dark:bg-gray-900 border-gray-300 dark:border-gray-700`}>
                 <div 
                   className="absolute w-full text-center text-3xl font-black text-blue-600 dark:text-blue-400 drop-shadow-md transition-all duration-75"
                   style={{ top: `${positionY}%` }}
                 >
                   {expression}
                 </div>
                 {/* Danger Zone */}
                 <div className="absolute bottom-0 w-full h-4 bg-red-500 opacity-20"></div>
              </div>

              <form onSubmit={handleSubmit} className="w-full mt-6">
                <input 
                  ref={inputRef}
                  type="number"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  className={`w-full text-center text-4xl font-bold p-4 rounded-xl outline-none border-2 border-transparent focus:border-blue-500 transition-all ${cardBgClass}`}
                  placeholder="Cevap..."
                  autoFocus
                />
              </form>
           </div>
        )}
      </div>
    </GameWrapper>
  );
}
