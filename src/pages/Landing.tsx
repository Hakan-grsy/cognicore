import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, ArrowRight, User, Lock } from 'lucide-react';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';

export default function Landing() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const username = useStore(state => state.username);
  const setUsername = useStore(state => state.setUsername);
  const navigate = useNavigate();

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (username) {
      navigate('/dashboard');
    }
  }, [username, navigate]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !password.trim()) return;

    const usersStr = localStorage.getItem('cognicore-users') || '{}';
    const users = JSON.parse(usersStr);

    const targetUser = name.trim();

    if (users[targetUser]) {
      // Login attempt
      if (users[targetUser] === password) {
        setUsername(targetUser);
        navigate('/dashboard');
      } else {
        setError('Hatalı şifre! Lütfen tekrar deneyin.');
      }
    } else {
      // Register
      users[targetUser] = password;
      localStorage.setItem('cognicore-users', JSON.stringify(users));
      setUsername(targetUser);
      navigate('/dashboard');
    }
  };

  const handleGuestPlay = () => {
    setUsername('Misafir Oyuncu');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 selection:bg-blue-500/30 overflow-hidden relative transition-colors duration-300">
      
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 blur-[100px] rounded-full"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md flex flex-col items-center relative z-10"
      >
        <Brain className="text-blue-500 mb-6 drop-shadow-[0_0_20px_rgba(59,130,246,0.6)]" size={72} strokeWidth={1.5} />
        
        <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-2 text-center">
          CogniCore
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg mb-10 text-center font-medium">Bilişsel Antrenman Platformu</p>

        <div className="w-full bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 rounded-3xl p-8 shadow-xl dark:shadow-2xl relative overflow-hidden transition-colors duration-300">
          
          <form onSubmit={handleAuth} className="flex flex-col gap-4 mb-6">
            <h2 className="text-slate-900 dark:text-white font-bold text-xl mb-2 flex items-center gap-2">
              <User size={20} className="text-blue-500 dark:text-blue-400" /> Giriş Yap / Kayıt Ol
            </h2>
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 dark:text-red-400 text-sm p-3 rounded-xl">
                {error}
              </div>
            )}

            <div className="relative">
              <input
                type="text"
                placeholder="Kullanıcı Adı"
                value={name}
                onChange={(e) => {setName(e.target.value); setError('');}}
                className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white p-4 pl-12 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-400 dark:placeholder-slate-500"
                required
                maxLength={15}
              />
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
            </div>

            <div className="relative">
              <input
                type="password"
                placeholder="Şifre"
                value={password}
                onChange={(e) => {setPassword(e.target.value); setError('');}}
                className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white p-4 pl-12 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-400 dark:placeholder-slate-500"
                required
              />
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            </div>

            <button 
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg py-4 rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 group mt-2"
            >
              Devam Et
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="relative flex items-center justify-center mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700/50"></div>
            </div>
            <div className="relative px-4 bg-transparent backdrop-blur-md text-sm text-slate-400 font-medium tracking-wide">VEYA</div>
          </div>

          <button 
            type="button"
            onClick={handleGuestPlay}
            className="w-full bg-slate-800/80 hover:bg-slate-700 text-white font-bold text-lg py-4 rounded-xl border border-slate-700 transition-all hover:scale-[1.02] active:scale-95"
          >
            Misafir Olarak Oyna
          </button>
        </div>

      </motion.div>
      
    </div>
  );
}
