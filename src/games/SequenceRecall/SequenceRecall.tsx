import { useState, useEffect, useCallback } from 'react';
import { GameWrapper } from '../../components/GameWrapper';
import { useStore } from '../../store/useStore';

type GameState = 'waiting' | 'flashing' | 'input' | 'gameOver';

const BUTTONS = [
  { id: 0, color: 'bg-red-500', active: 'bg-red-300 shadow-[0_0_20px_rgba(239,68,68,0.8)] scale-105' },
  { id: 1, color: 'bg-blue-500', active: 'bg-blue-300 shadow-[0_0_20px_rgba(59,130,246,0.8)] scale-105' },
  { id: 2, color: 'bg-green-500', active: 'bg-green-300 shadow-[0_0_20px_rgba(34,197,94,0.8)] scale-105' },
  { id: 3, color: 'bg-yellow-500', active: 'bg-yellow-300 shadow-[0_0_20px_rgba(234,179,8,0.8)] scale-105' }
];

export default function SequenceRecall() {
  const { addScore, incrementCombo, resetCombo, activeCombo, isDarkMode } = useStore();
  
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [sequence, setSequence] = useState<number[]>([]);
  const [userStep, setUserStep] = useState(0);
  const [activeButton, setActiveButton] = useState<number | null>(null);

  const startNextLevel = useCallback(() => {
    // Add one more step to the sequence based on combo
    const newSeqLength = 3 + Math.floor(activeCombo / 3);
    const newSeq = [];
    for(let i=0; i<newSeqLength; i++) {
       newSeq.push(Math.floor(Math.random() * 4));
    }
    setSequence(newSeq);
    setUserStep(0);
    setGameState('flashing');
  }, [activeCombo]);

  const startGame = useCallback(() => {
    resetCombo();
    startNextLevel();
  }, [resetCombo, startNextLevel]);

  // Flash sequence
  useEffect(() => {
    if (gameState === 'flashing' && sequence.length > 0) {
      let step = 0;
      const interval = setInterval(() => {
        if (step >= sequence.length) {
          clearInterval(interval);
          setActiveButton(null);
          setGameState('input');
          return;
        }
        
        // Flash on
        setActiveButton(sequence[step]);
        
        // Turn off slightly before next flash to distinguish duplicate consecutive colors
        setTimeout(() => setActiveButton(null), 400);

        step++;
      }, 700);
      
      return () => clearInterval(interval);
    }
  }, [gameState, sequence]);

  const handleChoice = (btnId: number) => {
    if (gameState !== 'input') return;

    // Visual feedback for clicking
    setActiveButton(btnId);
    setTimeout(() => setActiveButton(null), 200);

    if (btnId === sequence[userStep]) {
      // Correct step
      if (userStep + 1 === sequence.length) {
        // Level complete
        addScore(100 + activeCombo * 20);
        incrementCombo();
        setGameState('waiting'); // buffer
        setTimeout(() => startNextLevel(), 1000);
      } else {
        setUserStep(prev => prev + 1);
      }
    } else {
      // Wrong step
      resetCombo();
      setGameState('waiting');
      setTimeout(() => startNextLevel(), 1500);
    }
  };

  const cardBgClass = isDarkMode ? 'bg-gray-800' : 'bg-white';

  return (
    <GameWrapper gameName="Sıra Hafızası" onTimeUp={() => setGameState('gameOver')}>
      <div className="flex flex-col items-center justify-center w-full max-w-md">
         {gameState === 'gameOver' ? (
           <div className="text-center">
             <h2 className="text-3xl font-bold text-red-500 mb-4">Süre Doldu!</h2>
             <button onClick={startGame} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold">Yeniden Oyna</button>
           </div>
        ) : gameState === 'waiting' && sequence.length === 0 ? (
           <div className={`p-8 rounded-2xl shadow-xl text-center border-2 ${cardBgClass} border-slate-200 dark:border-gray-700`}>
             <h2 className="text-2xl font-bold mb-4">Nasıl Oynanır?</h2>
             <p className="opacity-80 mb-6">Sistem size renkli butonlardan oluşan bir sıra gösterecek. Dikkatle izleyin ve ardından sırayı eksiksiz tekrar edin!</p>
             <button onClick={startGame} className="px-8 py-4 bg-green-600 text-white rounded-xl font-bold text-lg w-full">Oyuna Başla</button>
           </div>
        ) : (
           <div className="w-full flex flex-col items-center">
              <div className="h-8 mb-4 text-center font-bold text-lg">
                 {gameState === 'flashing' && <span className="text-blue-500 animate-pulse">Dikkatle İzleyin...</span>}
                 {gameState === 'input' && <span className="text-green-500">Sıra Sizde! ({userStep}/{sequence.length})</span>}
                 {gameState === 'waiting' && sequence.length > 0 && <span className="text-yellow-500">Sonraki Seviye...</span>}
              </div>

              <div className="grid grid-cols-2 gap-4 w-64 h-64 sm:w-80 sm:h-80">
                {BUTTONS.map((btn) => (
                  <button
                    key={btn.id}
                    disabled={gameState !== 'input'}
                    onClick={() => handleChoice(btn.id)}
                    className={`rounded-3xl transition-all duration-150 ${activeButton === btn.id ? btn.active : btn.color} ${gameState !== 'input' ? 'cursor-default' : 'cursor-pointer hover:brightness-110 active:scale-95'}`}
                  />
                ))}
              </div>
           </div>
        )}
      </div>
    </GameWrapper>
  );
}
