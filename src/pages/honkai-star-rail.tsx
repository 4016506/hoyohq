import React from 'react';
import { GameTabNavigation } from '../components/GameTabNavigation';

export const HonkaiStarRail: React.FC = () => {
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Game Tab Navigation */}
        <GameTabNavigation />
        
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold text-white mb-2 md:mb-4 bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 bg-clip-text text-transparent">
            HOYO HQ
          </h1>
          <p className="text-lg md:text-xl text-white/80">
            Three friends, two games, one dream.
          </p>
        </div>

        {/* Under Construction Message */}
        <div className="flex items-center justify-center min-h-[60vh]">
          <div 
            className="text-center p-12 rounded-3xl"
            style={{
              backdropFilter: 'blur(20px)',
              background: 'rgba(255, 255, 255, 0.15)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
              maxWidth: '600px',
              width: '90%'
            }}
          >
            <div className="text-6xl mb-6">🚧</div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Under Construction
            </h2>
            <p className="text-lg text-white/80 mb-6">
              We're working hard to bring you the Honkai Star Rail character tracker!
            </p>
            <p className="text-base text-white/60">
              Check back soon for character progress tracking and more features.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
