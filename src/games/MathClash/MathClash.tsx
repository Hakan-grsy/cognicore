import { useState, useEffect, useCallback } from 'react';
import { GameWrapper } from '../../components/GameWrapper';
import { useStore } from '../../store/useStore';
import { Equal, ChevronLeft, ChevronRight, Calculator } from 'lucide-react';

type GameState = 'waiting' | 'playing' | 'gameOver';

interface MathExpression {
  expr: string;
  value: number;
}

export default function MathClash() {
  const { addScore, incrementCombo, resetCombo, activeCombo, isDarkMode, isHighContrast } = useStore();
  
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const [leftExpr, setLeftExpr] = useState<MathExpression>({ expr: '0', value: 0 });
  const [rightExpr, setRightExpr] = useState<MathExpression>({ expr: '0', value: 0 });

  const generateExpression = useCallback((combo: number): MathExpression => {
    let ops = ['+', '-'];
    let maxNum = 20;
    let allowNegative = false;
    
    if (combo >= 3) {
      ops.push('x');
      maxNum = 30;
    }
    if (combo >= 6) {
      ops.push('÷');
      allowNegative = true;
      maxNum = 50;
    }
    
    const op = ops[Math.floor(Math.random() * ops.length)];
    let num1, num2, value;
    
    if (op === 'x') {
      num1 = Math.floor(Math.random() * (combo >= 9 ? 12 : 8)) + 2;
      num2 = Math.floor(Math.random() * (combo >= 9 ? 12 : 8)) + 2;
      value = num1 * num2;
    } else if (op === '÷') {
      num2 = Math.floor(Math.random() * 9) + 2; // divisor 2-10
      value = Math.floor(Math.random() * 12) + 1; // result 1-12
      num1 = value * num2; // dividend
    } else {
      num1 = Math.floor(Math.random() * maxNum) + 1;
      num2 = Math.floor(Math.random() * maxNum) + 1;
      if (!allowNegative && op === '-' && num1 < num2) {
        // Swap to prevent negative result
        const temp = num1; num1 = num2; num2 = temp;
      }
      value = op === '+' ? num1 + num2 : num1 - num2;
    }
    
    return { expr: `${num1} ${op} ${num2}`, value };
  }, []);

  const generateEqual = useCallback((targetValue: number): MathExpression => {
    if (targetValue >= 0) {
        const n1 = Math.floor(Math.random() * (targetValue + 1));
        const n2 = targetValue - n1;
        return { expr: `${n1} + ${n2}`, value: targetValue };
    } else {
        const n2 = Math.floor(Math.random() * 20) + 1;
        const n1 = targetValue + n2;
        return { expr: `${n1} - ${n2}`, value: targetValue };
    }
  }, []);

  const generateLevel = useCallback(() => {
    const left = generateExpression(activeCombo);
    let right;
    
    // 30% chance to be equal
    if (Math.random() < 0.3) {
      right = generateEqual(left.value);
    } else {
      right = generateExpression(activeCombo);
      // Ensure they are not actually equal if it wasn't the 30% chance
      while (right.value === left.value) {
        right = generateExpression(activeCombo);
      }
    }
    
    setLeftExpr(left);
    setRightExpr(right);
  }, [activeCombo, generateExpression, generateEqual]);

  const startGame = useCallback(() => {
    resetCombo();
    generateLevel();
    setGameState('playing');
    setFeedback(null);
  }, [resetCombo, generateLevel]);

  const handleChoice = useCallback((choice: 'left' | 'equal' | 'right') => {
    if (gameState !== 'playing') return;

    let isCorrect = false;
    
    if (leftExpr.value > rightExpr.value && choice === 'left') isCorrect = true;
    else if (leftExpr.value < rightExpr.value && choice === 'right') isCorrect = true;
    else if (leftExpr.value === rightExpr.value && choice === 'equal') isCorrect = true;
    
    if (isCorrect) {
      addScore(75 + activeCombo * 10);
      incrementCombo();
      setFeedback('correct');
    } else {
      resetCombo();
      setFeedback('wrong');
    }

    generateLevel();
    setTimeout(() => setFeedback(null), 300);
  }, [gameState, leftExpr, rightExpr, addScore, activeCombo, incrementCombo, resetCombo, generateLevel]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      if (e.key === 'ArrowLeft') handleChoice('left');
      else if (e.key === 'ArrowDown') handleChoice('equal');
      else if (e.key === 'ArrowRight') handleChoice('right');
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, handleChoice]);

  const cardBgClass = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200';
  const contrastClass = isHighContrast ? 'contrast-125' : '';

  return (
    <GameWrapper gameName="Math Clash" onTimeUp={() => setGameState('gameOver')}>
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
               <Calculator size={48} className="mx-auto mb-4 text-blue-500" />
               <h2 className="text-2xl font-bold mb-4">Nasıl Oynanır?</h2>
               <p className="opacity-80 mb-2">Ekranda iki matematiksel işlem göreceksiniz.</p>
               <p className="opacity-80 mb-6">Hangi tarafın sonucu daha büyükse onu seçin, veya EŞİT butonuna basın!</p>
               <div className="text-sm opacity-60 mb-6 space-y-1">
                 <p>Kısayollar:</p>
                 <p>Sol Ok (Sol Büyük) | Alt Ok (Eşit) | Sağ Ok (Sağ Büyük)</p>
                 <p className="mt-2 text-yellow-500 font-bold">Zorluk Komboya Göre Artar!</p>
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
             
             {/* Expressions */}
             <div className={`flex flex-col sm:flex-row items-center justify-center gap-6 w-full p-8 rounded-3xl shadow-xl border-4 transition-all duration-150 ${cardBgClass} ${contrastClass} ${feedback === 'correct' ? 'border-green-500' : feedback === 'wrong' ? 'border-red-500' : 'border-transparent'}`}>
                
                {/* LEFT */}
                <div className="flex-1 flex items-center justify-center py-6 px-4 bg-slate-100 dark:bg-gray-900 rounded-2xl shadow-inner w-full">
                  <span className="text-4xl sm:text-5xl font-black font-mono tracking-tighter text-blue-600 dark:text-blue-400">
                    {leftExpr.expr}
                  </span>
                </div>

                <div className="text-2xl font-bold opacity-30 flex-shrink-0">VS</div>

                {/* RIGHT */}
                <div className="flex-1 flex items-center justify-center py-6 px-4 bg-slate-100 dark:bg-gray-900 rounded-2xl shadow-inner w-full">
                  <span className="text-4xl sm:text-5xl font-black font-mono tracking-tighter text-purple-600 dark:text-purple-400">
                    {rightExpr.expr}
                  </span>
                </div>

             </div>

             {/* Controls */}
             <div className="flex w-full gap-3 mt-8 flex-col sm:flex-row">
               <button 
                 onClick={() => handleChoice('left')} 
                 className="flex-1 py-5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold text-xl transition flex flex-col items-center shadow-lg active:scale-95"
               >
                 <ChevronLeft size={32} />
                 <span>SOL BÜYÜK</span>
                 <span className="text-xs opacity-70 mt-1">(Sol Ok)</span>
               </button>

               <button 
                 onClick={() => handleChoice('equal')} 
                 className="flex-1 py-5 bg-slate-500 hover:bg-gray-600 text-white rounded-xl font-bold text-xl transition flex flex-col items-center shadow-lg active:scale-95"
               >
                 <Equal size={32} />
                 <span>EŞİT</span>
                 <span className="text-xs opacity-70 mt-1">(Alt Ok)</span>
               </button>

               <button 
                 onClick={() => handleChoice('right')} 
                 className="flex-1 py-5 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-bold text-xl transition flex flex-col items-center shadow-lg active:scale-95"
               >
                 <ChevronRight size={32} />
                 <span>SAĞ BÜYÜK</span>
                 <span className="text-xs opacity-70 mt-1">(Sağ Ok)</span>
               </button>
             </div>
          </div>
        )}
      </div>
    </GameWrapper>
  );
}
