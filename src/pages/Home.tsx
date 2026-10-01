import { Link } from 'react-router-dom';
import { Brain, Settings, Play } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function Home() {
  const { isDarkMode, toggleDarkMode } = useStore();

  const bgClass = isDarkMode ? 'bg-gray-900 text-white' : 'bg-slate-50 text-gray-900';
  const cardClass = isDarkMode ? 'bg-gray-800' : 'bg-white';

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 ${bgClass} transition-colors`}>
      <div className={`max-w-xl w-full p-8 rounded-2xl shadow-xl ${cardClass} flex flex-col items-center text-center`}>
        <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
          <Brain size={48} className="text-white" />
        </div>
        
        <h1 className="text-4xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">
          CogniCore Platform
        </h1>
        
        <p className="text-lg opacity-80 mb-8 max-w-md mx-auto">
          30'dan fazla bilişsel zeka oyunu, adaptif zorluk ve erişilebilir arayüz tasarımıyla beyninizi eğitin.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <Link to="/games" className="flex-1 flex items-center justify-center gap-2 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg transition-transform hover:scale-105 shadow-md">
            <Play size={24} />
            Oyunlara Başla
          </Link>
          <button onClick={toggleDarkMode} className={`flex-1 flex items-center justify-center gap-2 py-4 border-2 rounded-xl font-bold text-lg transition-colors ${isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-300 hover:bg-slate-100'}`}>
            <Settings size={24} />
            Tema Değiştir
          </button>
        </div>
      </div>
      
      <div className="mt-12 text-sm opacity-50 max-w-lg text-center">
        Kullanıcı geri bildirimlerine göre tasarlanmıştır: Göz yorgunluğuna karşı varsayılan Karanlık Mod, daha iyi kontrast seçenekleri ve adaptif hız ayarları içerir.
      </div>
    </div>
  );
}
