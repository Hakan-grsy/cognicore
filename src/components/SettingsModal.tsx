import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Moon, Sun, Eye, Volume2, VolumeX, LogOut } from 'lucide-react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameSounds } from '../hooks/useGameSounds';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  showLogout?: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, showLogout = false }) => {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode, isHighContrast, toggleHighContrast, isSoundEnabled, toggleSound, setUsername } = useStore();
  const { playClick } = useGameSounds();

  const handleLogout = () => {
    playClick();
    setUsername('');
    navigate('/');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-md p-4 transition-colors duration-300"
          onClick={() => { playClick(); onClose(); }}
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl dark:shadow-2xl rounded-3xl p-8 max-w-md w-full relative overflow-hidden transition-colors duration-300"
          >
            {/* Background Accent */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-600/10 dark:bg-blue-600/20 blur-3xl rounded-full"></div>

            <div className="flex justify-between items-center mb-6 relative z-10">
               <h2 className="text-2xl font-black text-slate-900 dark:text-white">Ayarlar</h2>
               <button onClick={() => { playClick(); onClose(); }} className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
                 <X size={20} />
               </button>
            </div>

            <div className="flex flex-col gap-4 relative z-10">
              
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 transition-colors duration-300">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm dark:shadow-none border border-slate-200 dark:border-transparent">
                      {isDarkMode ? <Moon size={20} className="text-blue-500 dark:text-blue-400" /> : <Sun size={20} className="text-yellow-500 dark:text-yellow-400" />}
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white">Karanlık Tema</span>
                 </div>
                 <button onClick={() => { playClick(); toggleDarkMode(); }} className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${isDarkMode ? 'bg-blue-600 dark:bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                    <motion.div layout className={`w-6 h-6 bg-white rounded-full shadow-md`} style={{ x: isDarkMode ? 24 : 0 }} />
                 </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 transition-colors duration-300">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm dark:shadow-none border border-slate-200 dark:border-transparent">
                      <Eye size={20} className={isHighContrast ? "text-green-500 dark:text-green-400" : "text-slate-400"} />
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white">Yüksek Kontrast</span>
                 </div>
                 <button onClick={() => { playClick(); toggleHighContrast(); }} className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${isHighContrast ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                    <motion.div layout className={`w-6 h-6 bg-white rounded-full shadow-md`} style={{ x: isHighContrast ? 24 : 0 }} />
                 </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 transition-colors duration-300">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm dark:shadow-none border border-slate-200 dark:border-transparent">
                      {isSoundEnabled ? <Volume2 size={20} className="text-purple-500 dark:text-purple-400" /> : <VolumeX size={20} className="text-red-500 dark:text-red-400" />}
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white">Ses Efektleri</span>
                 </div>
                 <button onClick={() => { playClick(); toggleSound(); }} className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${isSoundEnabled ? 'bg-purple-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                    <motion.div layout className={`w-6 h-6 bg-white rounded-full shadow-md`} style={{ x: isSoundEnabled ? 24 : 0 }} />
                 </button>
              </div>

            </div>

            {showLogout && (
              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 relative z-10">
                <button 
                  onClick={handleLogout}
                  className="w-full py-4 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-500 border border-red-200 dark:border-red-500/20 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut size={20} /> Oturumu Kapat / Çıkış Yap
                </button>
              </div>
            )}

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
