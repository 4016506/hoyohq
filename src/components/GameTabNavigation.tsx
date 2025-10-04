import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface GameTabNavigationProps {
  className?: string;
}

export const GameTabNavigation: React.FC<GameTabNavigationProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isGenshinActive = location.pathname === '/' || location.pathname === '/genshin';
  const isHSRActive = location.pathname === '/honkai-star-rail';

  const handleTabClick = (game: 'genshin' | 'hsr') => {
    if (game === 'genshin') {
      navigate('/');
    } else {
      navigate('/honkai-star-rail');
    }
  };

  return (
    <div className={`flex justify-center mb-6 md:mb-8 ${className}`}>
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 border border-white/20">
        <div className="flex space-x-2">
          <button
            onClick={() => handleTabClick('genshin')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
              isGenshinActive
                ? 'bg-gradient-to-r from-yellow-400 via-blue-500 to-purple-500 text-white shadow-lg'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            Genshin Impact
          </button>
          <button
            onClick={() => handleTabClick('hsr')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
              isHSRActive
                ? 'bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 text-white shadow-lg'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            Honkai Star Rail
          </button>
        </div>
      </div>
    </div>
  );
};
