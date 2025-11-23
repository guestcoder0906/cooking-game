import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';

export const WebSimViewer: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  // Using the requested URL.
  const TARGET_URL = "https://interactive-cooking-game--frog.on.websim.com/";

  const handleReload = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      {/* Control Overlay - Top Right */}
      <div className="absolute top-4 right-4 z-40 opacity-0 hover:opacity-100 transition-opacity duration-300">
         <button 
          onClick={handleReload}
          className="p-2 bg-black/50 backdrop-blur text-white/70 hover:text-white rounded-full hover:bg-emerald-600 transition-all border border-white/10"
          title="Reload Game"
        >
          <RefreshCw size={20} />
        </button>
      </div>

      {/* VISUAL MASK: Bottom Right 
          Since browsers block script access to cross-origin iframes (CORS),
          we place a black element over the area where the logo appears to hide it.
          Pinning to 0,0 (bottom right) to cover the extreme corner edges.
          Using rounded-tl-3xl gives it a smooth interior curve while keeping the corner square.
      */}
      <div 
        className="absolute bottom-0 right-0 z-50 bg-black rounded-tl-3xl pointer-events-auto"
        style={{ width: '160px', height: '60px' }}
        aria-hidden="true"
      />

      <iframe
        key={refreshKey}
        src={TARGET_URL}
        title="Interactive Cooking Game"
        className="w-full h-full border-none block bg-black"
        // Sandbox permissions needed for the game to run, but limiting some interactions
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation allow-pointer-lock"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
};