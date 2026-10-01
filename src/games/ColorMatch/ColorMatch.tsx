import { useState, useEffect, useCallback } from 'react';
import { GameWrapper } from '../../components/GameWrapper';
import { useStore } from '../../store/useStore';
import { Square, Circle, Triangle, Star } from 'lucide-react';

type GameState = 'waiting' | 'playing' | 'gameOver';

const ITEMS = [
  { id: 'red', name: 'KIRMIZI', shapeName: 'KARE', color: 'text-red-500', hcColor: 'text-orange-600', Icon: Square },
  { id: 'blue', name: 'MAVİ', shapeName: 'DAİRE', color: 'text-blue-500', hcColor: 'text-sky-500', Icon: Circle },
  { id: 'green', name: 'YEŞİL', shapeName: 'ÜÇGEN', color: 'text-green-500', hcColor: 'text-teal-600', Icon: Triangle },
  { id: 'yellow', name: 'SARI', shapeName: 'YILDIZ', color: 'text-yellow-500', hcColor: 'text-yellow-400', Icon: Star },
];

export default function ColorMatch() {
  const { addScore, incrementCombo, resetCombo, activeCombo, isDarkMode, isHighContrast } = useStore();
  
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  // Top item properties
  const [topMeaning, setTopMeaning] = useState<typeof ITEMS[0]>(ITEMS[0]);
  const [topDisplayAttr, setTopDisplayAttr] = useState<typeof ITEMS[0]>(ITEMS[1]); // Color or Shape

  // Bottom item properties
  const [bottomMeaning, setBottomMeaning] = useState<typeof ITEMS[0]>(ITEMS[2]);
  const [bottomDisplayAttr, setBottomDisplayAttr] = useState<typeof ITEMS[0]>(ITEMS[3]); // Color or Shape

  const getRandomItem = () => ITEMS[Math.floor(Math.random() * ITEMS.length)];

  const generateLevel = useCallback(() => {
    const tMeaning = getRandomItem();
    const tAttr = getRandomItem();
    const bMeaning = getRandomItem();
    
    // 50% chance for actual match
    let bAttr;
    if (Math.random() > 0.5) {
      bAttr = tMeaning; // They match! (Top meaning === Bottom attribute)
    } else {
      bAttr = getRandomItem();
      while (bAttr.id === tMeaning.id) {
        bAttr = getRandomItem(); // Ensure they don't match
      }
    }

    setTopMeaning(tMeaning);
    setTopDisplayAttr(tAttr);
    setBottomMeaning(bMeaning);
    setBottomDisplayAttr(bAttr);
  }, []);

  const startGame = useCallback(() => {
    resetCombo();
    generateLevel();
    setGameState('playing');
    setFeedback(null);
  }, [resetCombo, generateLevel]);

  const handleChoice = useCallback((isYes: boolean) => {
    if (gameState !== 'playing') return;

    // The core rule: Does Top Meaning match Bottom Display Attribute?
    const actualIsMatch = topMeaning.id === bottomDisplayAttr.id;
    
    if (isYes === actualIsMatch) {
      // Correct
      addScore(60 + activeCombo * 15);
      incrementCombo();
      setFeedback('correct');
    } else {
      // Wrong
      resetCombo();
      setFeedback('wrong');
    }

    generateLevel();
    setTimeout(() => setFeedback(null), 300);
  }, [gameState, topMeaning, bottomDisplayAttr, addScore, activeCombo, incrementCombo, resetCombo, generateLevel]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      if (e.key === 'ArrowLeft') {
        handleChoice(false); // HAYIR
      } else if (e.key === 'ArrowRight') {
        handleChoice(true); // EVET
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, handleChoice]);

  const cardBgClass = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200';

  return (
    <GameWrapper gameName="Color Match" onTimeUp={() => setGameState('gameOver')}>
      <div className="flex flex-col items-center justify-center w-full max-w-md">
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
               <h2 className="text-2xl font-bold mb-4">Nasıl Oynanır?</h2>
               {isHighContrast ? (
                  <p className="opacity-80 mb-6 text-lg">
                    Üstteki kelimenin <strong>ANLAMI</strong> ile alttaki sembolün <strong>ŞEKLİ</strong> aynı mı?<br/><br/>
                    <em>(Erişilebilirlik Modu: Renkler yerine şekiller kullanılıyor.)</em>
                  </p>
               ) : (
                  <p className="opacity-80 mb-6 text-lg">
                    Üstteki kelimenin <strong>ANLAMI</strong> ile alttaki kelimenin <strong>RENGİ</strong> eşleşiyor mu?
                  </p>
               )}
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
             
             <div className={`flex flex-col items-center gap-8 w-full p-8 rounded-3xl shadow-xl border-4 transition-all duration-150 ${cardBgClass} ${feedback === 'correct' ? 'border-green-500' : feedback === 'wrong' ? 'border-red-500' : 'border-transparent'}`}>
                
                {/* TOP ITEM */}
                <div className="flex flex-col items-center text-center">
                  <span className="text-sm opacity-50 uppercase tracking-widest mb-1">Üst (Anlam)</span>
                  {isHighContrast ? (
                    <div className="text-5xl font-black tracking-tight dark:text-white text-gray-900">
                      {topMeaning.shapeName}
                    </div>
                  ) : (
                    <div className={`text-6xl font-black tracking-tight ${topDisplayAttr.color} drop-shadow-md`}>
                      {topMeaning.name}
                    </div>
                  )}
                </div>

                <div className="w-full h-px bg-gray-300 dark:bg-gray-600 my-2"></div>

                {/* BOTTOM ITEM */}
                <div className="flex flex-col items-center text-center">
                  <span className="text-sm opacity-50 uppercase tracking-widest mb-1">
                    {isHighContrast ? "Alt (Şekil)" : "Alt (Renk)"}
                  </span>
                  {isHighContrast ? (
                    <div className="flex flex-col items-center gap-2">
                       <bottomDisplayAttr.Icon size={80} className={`${bottomDisplayAttr.hcColor}`} strokeWidth={3} />
                       <div className="text-xl font-bold dark:text-gray-400 text-gray-500">
                         {bottomMeaning.shapeName}
                       </div>
                    </div>
                  ) : (
                    <div className={`text-6xl font-black tracking-tight ${bottomDisplayAttr.color} drop-shadow-md`}>
                      {bottomMeaning.name}
                    </div>
                  )}
                </div>

             </div>

             <div className="flex w-full gap-4 mt-8">
               <button 
                 onClick={() => handleChoice(false)} 
                 className="flex-1 py-5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-xl transition flex flex-col items-center shadow-lg active:scale-95"
               >
                 <span>HAYIR</span>
                 <span className="text-xs opacity-70 mt-1">(Sol Ok)</span>
               </button>
               <button 
                 onClick={() => handleChoice(true)} 
                 className="flex-1 py-5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-xl transition flex flex-col items-center shadow-lg active:scale-95"
               >
                 <span>EVET</span>
                 <span className="text-xs opacity-70 mt-1">(Sağ Ok)</span>
               </button>
             </div>
          </div>
        )}
      </div>
    </GameWrapper>
  );
}
