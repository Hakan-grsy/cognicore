import { useState, useEffect, useCallback, useRef } from 'react';
import { GameWrapper } from '../../components/GameWrapper';
import { useStore } from '../../store/useStore';

type GameState = 'waiting' | 'memorize' | 'input' | 'gameOver';

export default function DigitSpan() {
  const { addScore, incrementCombo, resetCombo, activeCombo, isDarkMode } = useStore();
  
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [targetNumber, setTargetNumber] = useState('');
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);

  const generateNumber = useCallback(() => {
    // Length scales with combo (starts at 3)
    const length = Math.min(3 + Math.floor(activeCombo / 2), 10);
    let numStr = '';
    for (let i = 0; i < length; i++) {
      numStr += Math.floor(Math.random() * 10).toString();
    }
    setTargetNumber(numStr);
    setUserInput('');
    setGameState('memorize');
  }, [activeCombo]);

  const startGame = useCallback(() => {
    resetCombo();
    generateNumber();
    setFeedback(null);
  }, [resetCombo, generateNumber]);

  useEffect(() => {
    if (gameState === 'memorize') {
      const timer = setTimeout(() => {
        setGameState('input');
      }, 2000);
      return () => clearTimeout(timer);
    } else if (gameState === 'input') {
      inputRef.current?.focus();
    }
  }, [gameState]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (gameState !== 'input') return;

    if (userInput === targetNumber) {
      addScore(80 + activeCombo * 15);
      incrementCombo();
      setFeedback('correct');
    } else {
      resetCombo();
      setFeedback('wrong');
    }

    setGameState('waiting'); // Brief wait before next round
    setTimeout(() => {
      setFeedback(null);
      generateNumber();
    }, 1000);
  };

  const cardBgClass = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200';

  return (
    <GameWrapper gameName="Sayı Hafızası" onTimeUp={() => setGameState('gameOver')}>
      <div className="flex flex-col items-center justify-center w-full max-w-md">
        {gameState === 'gameOver' ? (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-red-500 mb-4">Süre Doldu!</h2>
            <button onClick={startGame} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-bold">Yeniden Oyna</button>
          </div>
        ) : gameState === 'waiting' && !feedback ? (
          <div className={`p-8 rounded-2xl shadow-xl text-center ${cardBgClass} border-2`}>
             <h2 className="text-2xl font-bold mb-4">Nasıl Oynanır?</h2>
             <p className="opacity-80 mb-6">Ekranda kısa bir süreliğine beliren sayıları akılda tutun ve sonrasında doğru şekilde girin. Kombonuz arttıkça hane sayısı artacaktır.</p>
             <button onClick={startGame} className="px-8 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-bold text-lg w-full">Oyuna Başla</button>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center">
             <div className="h-8 mb-4 text-center font-bold text-lg">
                {feedback === 'correct' && <span className="text-green-500">Doğru!</span>}
                {feedback === 'wrong' && <span className="text-red-500">Yanlış! ({targetNumber})</span>}
             </div>
             
             <div className={`flex items-center justify-center w-full h-48 rounded-3xl shadow-xl border-4 transition-all duration-150 ${cardBgClass} ${feedback === 'correct' ? 'border-green-500' : feedback === 'wrong' ? 'border-red-500' : 'border-blue-400'}`}>
                {gameState === 'memorize' ? (
                  <span className="text-6xl font-black font-mono tracking-widest text-blue-500">{targetNumber}</span>
                ) : gameState === 'input' ? (
                  <form onSubmit={handleSubmit} className="w-full px-8 flex flex-col items-center">
                    <input 
                      ref={inputRef}
                      type="number"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      className="w-full text-center text-4xl font-bold p-4 bg-slate-100 dark:bg-gray-900 rounded-xl outline-none focus:ring-4 focus:ring-blue-500 transition-all dark:text-white"
                      placeholder="Sayıyı girin"
                      autoFocus
                    />
                  </form>
                ) : (
                  <span className="text-3xl font-bold opacity-50">Hazırlanıyor...</span>
                )}
             </div>

             {gameState === 'input' && (
                <button onClick={handleSubmit} className="mt-8 px-12 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xl shadow-lg transition transform active:scale-95">
                  Onayla (Enter)
                </button>
             )}
          </div>
        )}
      </div>
    </GameWrapper>
  );
}
