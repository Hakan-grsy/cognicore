import { useState, useCallback } from 'react';
import { GameWrapper } from '../../components/GameWrapper';
import { useStore } from '../../store/useStore';
import { Square, Circle, Triangle, Star } from 'lucide-react';

type GameState = 'waiting' | 'playing' | 'gameOver';

const SHAPES = [
  { id: 'square', Icon: Square },
  { id: 'circle', Icon: Circle },
  { id: 'triangle', Icon: Triangle },
  { id: 'star', Icon: Star },
];

const COLORS = [
  { id: 'red', cls: 'text-red-500' },
  { id: 'blue', cls: 'text-blue-500' },
  { id: 'green', cls: 'text-green-500' },
  { id: 'yellow', cls: 'text-yellow-500' }
];

export default function RuleSwitcher() {
  const { addScore, incrementCombo, resetCombo, activeCombo, isDarkMode, isHighContrast } = useStore();
  
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  
  const [rule, setRule] = useState<'RENK' | 'ŞEKİL'>('RENK');
  const [targetCard, setTargetCard] = useState({ shape: SHAPES[0], color: COLORS[0] });
  const [options, setOptions] = useState<Array<{shape: typeof SHAPES[0], color: typeof COLORS[0]}>>([]);

  const generateLevel = useCallback(() => {
    const currentRule = Math.random() > 0.5 ? 'RENK' : 'ŞEKİL';
    setRule(currentRule);
    
    const tShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    const tColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    setTargetCard({ shape: tShape, color: tColor });

    // Generate 3 options. Only 1 must be correct according to currentRule.
    const newOptions = [];
    
    // 1 Correct option
    if (currentRule === 'RENK') {
      let oShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      while(oShape.id === tShape.id) oShape = SHAPES[Math.floor(Math.random() * SHAPES.length)]; // different shape to trick
      newOptions.push({ shape: oShape, color: tColor });
    } else {
      let oColor = COLORS[Math.floor(Math.random() * COLORS.length)];
      while(oColor.id === tColor.id) oColor = COLORS[Math.floor(Math.random() * COLORS.length)]; // different color to trick
      newOptions.push({ shape: tShape, color: oColor });
    }

    // 2 Distractors
    while (newOptions.length < 3) {
      const dShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      const dColor = COLORS[Math.floor(Math.random() * COLORS.length)];
      
      const isValidColor = dColor.id === tColor.id;
      const isValidShape = dShape.id === tShape.id;
      
      // Ensure distractors are not correct under the CURRENT rule
      if ((currentRule === 'RENK' && !isValidColor) || (currentRule === 'ŞEKİL' && !isValidShape)) {
        // Also ensure we don't have duplicate options
        if (!newOptions.some(o => o.shape.id === dShape.id && o.color.id === dColor.id)) {
           newOptions.push({ shape: dShape, color: dColor });
        }
      }
    }
    
    // Shuffle options
    newOptions.sort(() => Math.random() - 0.5);
    setOptions(newOptions);
  }, []);

  const startGame = useCallback(() => {
    resetCombo();
    generateLevel();
    setGameState('playing');
    setFeedback(null);
  }, [resetCombo, generateLevel]);

  const handleChoice = useCallback((opt: typeof options[0]) => {
    if (gameState !== 'playing') return;

    let isCorrect = false;
    if (rule === 'RENK' && opt.color.id === targetCard.color.id) isCorrect = true;
    if (rule === 'ŞEKİL' && opt.shape.id === targetCard.shape.id) isCorrect = true;

    if (isCorrect) {
      addScore(60 + activeCombo * 10);
      incrementCombo();
      setFeedback('correct');
    } else {
      resetCombo();
      setFeedback('wrong');
    }

    generateLevel();
    setTimeout(() => setFeedback(null), 300);
  }, [gameState, rule, targetCard, addScore, activeCombo, incrementCombo, resetCombo, generateLevel]);

  const cardBgClass = isDarkMode ? 'bg-gray-800' : 'bg-white';

  return (
    <GameWrapper gameName="Kural Değiştirici" onTimeUp={() => setGameState('gameOver')}>
      <div className="flex flex-col items-center justify-center w-full max-w-md">
         {gameState === 'gameOver' ? (
           <div className="text-center">
             <h2 className="text-3xl font-bold text-red-500 mb-4">Süre Doldu!</h2>
             <button onClick={startGame} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold">Yeniden Oyna</button>
           </div>
        ) : gameState === 'waiting' ? (
           <div className={`p-8 rounded-2xl shadow-xl text-center border-2 ${cardBgClass} border-slate-200 dark:border-gray-700`}>
             <h2 className="text-2xl font-bold mb-4">Nasıl Oynanır?</h2>
             <p className="opacity-80 mb-6">Aktif olan kurala (ŞEKİL veya RENK) göre aşağıdaki 3 karttan hedef karta uyanı seçin. Kural her an değişebilir, esnek olun!</p>
             <button onClick={startGame} className="px-8 py-4 bg-green-600 text-white rounded-xl font-bold text-lg w-full">Oyuna Başla</button>
           </div>
        ) : (
           <div className="w-full flex flex-col items-center">
              <div className="h-8 mb-4 text-center font-bold text-lg">
                 {feedback === 'correct' && <span className="text-green-500">Doğru!</span>}
                 {feedback === 'wrong' && <span className="text-red-500">Yanlış!</span>}
              </div>

              <div className="w-full flex flex-col items-center mb-8">
                 <div className="text-2xl font-black mb-4 uppercase tracking-widest text-blue-500">KURAL: {rule}</div>
                 <div className="p-8 bg-slate-100 dark:bg-gray-900 rounded-2xl shadow-inner border-2 border-gray-300 dark:border-gray-700">
                   <targetCard.shape.Icon size={64} className={`${targetCard.color.cls} ${isHighContrast ? 'contrast-125' : ''}`} strokeWidth={3}/>
                 </div>
              </div>

              <div className="flex w-full gap-4 justify-center">
                {options.map((opt, i) => (
                  <button 
                    key={i} 
                    onClick={() => handleChoice(opt)}
                    className={`p-6 rounded-2xl shadow-lg border-2 hover:border-blue-500 transition-all ${cardBgClass} border-transparent`}
                  >
                    <opt.shape.Icon size={48} className={`${opt.color.cls} ${isHighContrast ? 'contrast-125' : ''}`} strokeWidth={3}/>
                  </button>
                ))}
              </div>
           </div>
        )}
      </div>
    </GameWrapper>
  );
}
