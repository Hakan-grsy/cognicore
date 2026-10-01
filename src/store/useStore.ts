import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
}

interface GlobalState {
  username: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  achievements: Achievement[];
  
  totalScore: number;
  activeCombo: number;
  isDarkMode: boolean;
  isHighContrast: boolean;
  isSoundEnabled: boolean;

  setUsername: (name: string) => void;
  addXp: (amount: number) => void;
  unlockAchievement: (id: string) => void;

  addScore: (score: number) => void;
  incrementCombo: () => void;
  resetCombo: () => void;
  toggleDarkMode: () => void;
  toggleHighContrast: () => void;
  toggleSound: () => void;
}

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_game', title: 'İlk Kan', description: 'Platformda ilk oyununuzu tamamlayın.', icon: 'zap', isUnlocked: false },
  { id: 'combo_master', title: 'Kombo Ustası', description: 'Oyunlarda arka arkaya 10 doğru cevap (Kombo) yapın.', icon: 'flame', isUnlocked: false },
  { id: 'brain_genius', title: 'Beyin Fırtınası', description: 'Zeka profilindeki tüm yeteneklerinizi kullanın.', icon: 'brain', isUnlocked: false },
];

export const useStore = create<GlobalState>()(
  persist(
    (set) => ({
      username: '',
      level: 1,
      xp: 0,
      xpToNextLevel: 500,
      achievements: INITIAL_ACHIEVEMENTS,

      totalScore: 0,
      activeCombo: 0,
      isDarkMode: true,
      isHighContrast: false,
      isSoundEnabled: true,

      setUsername: (name) => set({ username: name }),
      
      addXp: (amount) => set((state) => {
        let newXp = state.xp + amount;
        let newLevel = state.level;
        let newXpNext = state.xpToNextLevel;
        
        while (newXp >= newXpNext) {
          newXp -= newXpNext;
          newLevel += 1;
          newXpNext = Math.floor(newXpNext * 1.5);
        }
        
        return { xp: newXp, level: newLevel, xpToNextLevel: newXpNext };
      }),

      unlockAchievement: (id) => set((state) => ({
        achievements: state.achievements.map(ach => 
          ach.id === id ? { ...ach, isUnlocked: true } : ach
        )
      })),

      addScore: (score) => set((state) => ({ totalScore: state.totalScore + score })),
      
      incrementCombo: () => set((state) => {
        const newCombo = state.activeCombo + 1;
        let achs = state.achievements;
        if (newCombo >= 10 && !achs.find(a => a.id === 'combo_master')?.isUnlocked) {
          achs = achs.map(a => a.id === 'combo_master' ? { ...a, isUnlocked: true } : a);
        }
        return { activeCombo: newCombo, achievements: achs };
      }),
      
      resetCombo: () => set({ activeCombo: 0 }),
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      toggleHighContrast: () => set((state) => ({ isHighContrast: !state.isHighContrast })),
      toggleSound: () => set((state) => ({ isSoundEnabled: !state.isSoundEnabled })),
    }),
    {
      name: 'cognicore-storage', // key in localStorage
      partialize: (state) => ({ 
        username: state.username, 
        level: state.level, 
        xp: state.xp, 
        xpToNextLevel: state.xpToNextLevel, 
        achievements: state.achievements,
        totalScore: state.totalScore,
        isSoundEnabled: state.isSoundEnabled
      }), // only persist these fields
    }
  )
);
